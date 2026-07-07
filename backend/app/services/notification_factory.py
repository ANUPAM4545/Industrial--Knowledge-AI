"""
NEXO — Notification Factory
"""
from typing import Optional
from uuid import UUID

from app.models.notification import NotificationCategory, NotificationPriority, NotificationType
from app.schemas.notification import NotificationCreate


class NotificationFactory:
    """Helper class to create common notification payloads."""

    @staticmethod
    def success(
        user_id: UUID,
        title: str,
        message: str,
        category: NotificationCategory = NotificationCategory.SYSTEM,
        action_url: Optional[str] = None,
    ) -> NotificationCreate:
        return NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=NotificationType.SUCCESS,
            category=category,
            priority=NotificationPriority.NORMAL,
            icon="check-circle",
            action_url=action_url,
        )

    @staticmethod
    def error(
        user_id: UUID,
        title: str,
        message: str,
        category: NotificationCategory = NotificationCategory.SYSTEM,
        action_url: Optional[str] = None,
    ) -> NotificationCreate:
        return NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=NotificationType.ERROR,
            category=category,
            priority=NotificationPriority.HIGH,
            icon="x-circle",
            action_url=action_url,
        )

    @staticmethod
    def info(
        user_id: UUID,
        title: str,
        message: str,
        category: NotificationCategory = NotificationCategory.SYSTEM,
        action_url: Optional[str] = None,
    ) -> NotificationCreate:
        return NotificationCreate(
            user_id=user_id,
            title=title,
            message=message,
            type=NotificationType.INFO,
            category=category,
            priority=NotificationPriority.LOW,
            icon="info",
            action_url=action_url,
        )
