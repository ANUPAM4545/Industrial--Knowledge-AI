"""
NEXO — Security Event Bus
"""
import asyncio
import structlog
from typing import Callable, Any, Dict, List
from enum import Enum

logger = structlog.get_logger(__name__)

class EventType(str, Enum):
    # Auth
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    SESSION_TERMINATED = "SESSION_TERMINATED"
    
    # RBAC
    PERMISSION_DENIED = "PERMISSION_DENIED"
    ROLE_CHANGED = "ROLE_CHANGED"
    
    # AI Security
    PROMPT_INJECTION = "PROMPT_INJECTION"
    JAILBREAK_ATTEMPT = "JAILBREAK_ATTEMPT"
    
    # Rate Limit
    RATE_LIMIT_VIOLATION = "RATE_LIMIT_VIOLATION"
    
    # Admin
    ADMIN_ACTION = "ADMIN_ACTION"
    USER_BLOCKED = "USER_BLOCKED"


class SecurityEventBus:
    """
    Lightweight internal pub/sub event bus using asyncio.
    Fades out security events to multiple listeners (Audit, Timeline, Metrics)
    without blocking the main API response.
    """
    _subscribers: Dict[EventType, List[Callable]] = {}
    _queue: asyncio.Queue = asyncio.Queue()
    _worker_task: asyncio.Task = None

    @classmethod
    def subscribe(cls, event_type: EventType, handler: Callable):
        if event_type not in cls._subscribers:
            cls._subscribers[event_type] = []
        cls._subscribers[event_type].append(handler)

    @classmethod
    def publish(cls, event_type: EventType, payload: Dict[str, Any]):
        """
        Publish an event to the queue for background processing.
        """
        # Fire and forget enqueue
        try:
            cls._queue.put_nowait((event_type, payload))
        except Exception as e:
            logger.error("failed_to_publish_security_event", error=str(e), event_type=event_type)

    @classmethod
    async def start_worker(cls):
        """
        Start the background worker to process events from the queue.
        Call this during FastAPI lifespan startup.
        """
        if cls._worker_task is None:
            cls._worker_task = asyncio.create_task(cls._process_events())

    @classmethod
    async def stop_worker(cls):
        if cls._worker_task:
            cls._worker_task.cancel()
            try:
                await cls._worker_task
            except asyncio.CancelledError:
                pass
            cls._worker_task = None

    @classmethod
    async def _process_events(cls):
        while True:
            try:
                event_type, payload = await cls._queue.get()
                handlers = cls._subscribers.get(event_type, [])
                
                # Execute handlers concurrently
                tasks = []
                for handler in handlers:
                    if asyncio.iscoroutinefunction(handler):
                        tasks.append(asyncio.create_task(handler(event_type, payload)))
                    else:
                        # If synchronous, run in executor or just call
                        handler(event_type, payload)
                        
                if tasks:
                    await asyncio.gather(*tasks, return_exceptions=True)
                    
                cls._queue.task_done()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("error_processing_security_event", error=str(e))
