"""
NEXO — Notification Schemas (Pydantic v2)
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.notification import NotificationCategory, NotificationPriority, NotificationType


class NotificationBase(BaseModel):
    title: str = Field(..., max_length=255)
    message: str
    type: NotificationType = NotificationType.INFO
    category: NotificationCategory = NotificationCategory.SYSTEM
    priority: NotificationPriority = NotificationPriority.NORMAL
    action_url: Optional[str] = Field(None, max_length=1024)
    action_label: Optional[str] = Field(None, max_length=100)
    icon: Optional[str] = Field(None, max_length=100)
    metadata_json: Optional[dict] = None
    expires_at: Optional[datetime] = None


class NotificationCreate(NotificationBase):
    """Schema for internal notification creation."""
    user_id: UUID


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(NotificationBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    is_read: bool
    created_at: datetime


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
