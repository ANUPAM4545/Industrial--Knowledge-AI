"""
NEXO — Notification Repository
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import delete, desc, select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationCategory


class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, notification: Notification) -> Notification:
        self.session.add(notification)
        await self.session.flush()
        await self.session.refresh(notification)
        return notification

    async def get_by_user(
        self,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0,
        unread_only: bool = False,
        category: Optional[NotificationCategory] = None,
    ) -> tuple[List[Notification], int]:
        stmt = select(Notification).where(Notification.user_id == user_id)

        if unread_only:
            stmt = stmt.where(Notification.is_read == False)

        if category:
            stmt = stmt.where(Notification.category == category)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt) or 0

        # Get paginated results
        stmt = stmt.order_by(desc(Notification.created_at)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        items = list(result.scalars().all())

        return items, total

    async def get_by_id(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        stmt = select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def mark_as_read(self, notification_id: UUID, user_id: UUID) -> bool:
        stmt = (
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def mark_all_as_read(self, user_id: UUID) -> int:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read == False)
            .values(is_read=True)
        )
        result = await self.session.execute(stmt)
        return result.rowcount

    async def delete(self, notification_id: UUID, user_id: UUID) -> bool:
        stmt = delete(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == user_id
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0
