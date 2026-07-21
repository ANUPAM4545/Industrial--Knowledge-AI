"""
NEXO — Rate Limiting Async Logger
"""
import asyncio
import structlog
from app.db.session import AsyncSessionLocal
from app.models.rate_limit import RateLimitLog
from app.security.event_bus import SecurityEventBus, EventType

logger = structlog.get_logger(__name__)

class SecurityLogger:
    """
    Handles logging rate limit events.
    Uses asyncio.create_task to perform non-blocking database writes.
    """
    
    @staticmethod
    def log(
        ip_address: str,
        endpoint: str,
        limit_value: int,
        remaining: int,
        decision: str,
        violation_type: str = "STANDARD",
        user_id: str = None,
        role: str = None,
        security_score: float = None
    ) -> None:
        """
        Fire and forget logging of rate limit events.
        """
        asyncio.create_task(
            SecurityLogger._async_log_to_db(
                ip_address, endpoint, limit_value, remaining, 
                decision, violation_type, user_id, role, security_score
            )
        )
        
        # Publish to the unified security bus for downstream consumers
        if decision == "BLOCKED" or remaining == 0:
            SecurityEventBus.publish(
                EventType.RATE_LIMIT_VIOLATION,
                {
                    "ip_address": ip_address,
                    "endpoint": endpoint,
                    "decision": decision,
                    "violation_type": violation_type,
                    "user_id": user_id,
                    "limit_value": limit_value
                }
            )

    @staticmethod
    async def _async_log_to_db(
        ip_address: str, endpoint: str, limit_value: int, remaining: int,
        decision: str, violation_type: str, user_id: str, role: str, security_score: float
    ) -> None:
        try:
            async with AsyncSessionLocal() as session:
                log_entry = RateLimitLog(
                    ip_address=ip_address,
                    endpoint=endpoint,
                    limit_value=limit_value,
                    remaining=remaining,
                    decision=decision,
                    violation_type=violation_type,
                    user_id=user_id,
                    role=role,
                    security_score=security_score
                )
                session.add(log_entry)
                await session.commit()
        except Exception as e:
            logger.error("failed_to_log_rate_limit", error=str(e), ip=ip_address)
