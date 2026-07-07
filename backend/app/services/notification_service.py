"""
ForgeMind AI — Notification Service (Real-time SSE + Redis Pub/Sub)
"""
import asyncio
import json
import uuid
from typing import AsyncGenerator

import structlog
from redis.asyncio import Redis

from app.core.config import settings
from app.repositories.notification_repository import NotificationRepository
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationResponse

logger = structlog.get_logger(__name__)

# Global Redis instance for pub/sub
redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)

class NotificationService:
    def __init__(self, repository: NotificationRepository):
        self.repository = repository

    async def create_notification(self, payload: NotificationCreate) -> Notification:
        """
        Creates a notification in the database and broadcasts it via Redis Pub/Sub.
        """
        notification = Notification(
            user_id=payload.user_id,
            title=payload.title,
            message=payload.message,
            type=payload.type,
            category=payload.category,
            priority=payload.priority,
            action_url=payload.action_url,
            action_label=payload.action_label,
            icon=payload.icon,
            metadata_json=payload.metadata_json,
            expires_at=payload.expires_at,
        )
        saved = await self.repository.create(notification)

        # Broadcast real-time update
        await self._broadcast(saved)
        return saved

    async def _broadcast(self, notification: Notification):
        """Publish the notification payload to a user-specific Redis channel."""
        try:
            channel = f"notifications:{notification.user_id}"
            response = NotificationResponse.model_validate(notification)
            # Pydantic json() handles UUID and datetime serialization
            await redis_client.publish(channel, response.model_dump_json())
            logger.info("notification_published", user_id=str(notification.user_id), notification_id=str(notification.id))
        except Exception as e:
            logger.error("failed_to_broadcast_notification", error=str(e))

    @staticmethod
    async def subscribe_to_user_notifications(user_id: uuid.UUID) -> AsyncGenerator[str, None]:
        """
        Subscribes to a user's notification channel and yields Server-Sent Events (SSE).
        Uses a PubSub instance dedicated to this connection.
        """
        channel = f"notifications:{user_id}"
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(channel)
        
        logger.info("sse_client_connected", user_id=str(user_id))

        try:
            # Yield a connection established event
            yield f"event: connected\ndata: {json.dumps({'status': 'listening'})}\n\n"

            while True:
                try:
                    message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                    if message and message["type"] == "message":
                        data = message["data"]
                        # SSE format:
                        # event: new_notification
                        # data: {...}
                        yield f"event: new_notification\ndata: {data}\n\n"
                    else:
                        # Send a periodic ping to keep the connection alive
                        yield ": keepalive\n\n"
                        await asyncio.sleep(15)
                except asyncio.CancelledError:
                    break
        finally:
            logger.info("sse_client_disconnected", user_id=str(user_id))
            await pubsub.unsubscribe(channel)
            await pubsub.close()
