"""
NEXO — Notification Model
"""
from datetime import datetime, timezone
import uuid
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Index, String, Text, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.base import Base

class NotificationType(str, enum.Enum):
    SUCCESS = "success"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SYSTEM = "system"
    AI = "ai"
    SECURITY = "security"
    WORKFLOW = "workflow"

class NotificationCategory(str, enum.Enum):
    DOCUMENT_PROCESSING = "document_processing"
    AI_INSIGHTS = "ai_insights"
    KNOWLEDGE_BASE = "knowledge_base"
    SEARCH = "search"
    ANALYTICS = "analytics"
    SYSTEM = "system"
    SECURITY = "security"
    ACCOUNT = "account"
    ORGANIZATION = "organization"
    PWA = "pwa"

class NotificationPriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    type: Mapped[NotificationType] = mapped_column(Enum(NotificationType, name="notification_type_enum"), nullable=False, default=NotificationType.INFO)
    category: Mapped[NotificationCategory] = mapped_column(Enum(NotificationCategory, name="notification_category_enum"), nullable=False, default=NotificationCategory.SYSTEM)
    priority: Mapped[NotificationPriority] = mapped_column(Enum(NotificationPriority, name="notification_priority_enum"), nullable=False, default=NotificationPriority.NORMAL)
    
    action_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    action_label: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    icon: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Indexes
    __table_args__ = (
        Index("ix_notifications_user_id", "user_id"),
        Index("ix_notifications_is_read", "is_read"),
        Index("ix_notifications_created_at", "created_at"),
        Index("ix_notifications_category", "category"),
    )
