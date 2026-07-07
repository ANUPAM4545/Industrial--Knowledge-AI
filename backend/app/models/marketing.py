"""
NEXO — Marketing Models
"""
import enum
from typing import Optional

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Department(str, enum.Enum):
    """Departments for routing contact messages."""
    SALES = "sales"
    SUPPORT = "support"
    INQUIRY = "inquiry"
    PARTNERSHIP = "partnership"
    FEATURE_REQUEST = "feature"
    BUG_REPORT = "bug"


class MessageStatus(str, enum.Enum):
    """Status of the contact message."""
    NEW = "new"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"


class ContactMessage(Base):
    """Contact form submission model."""
    __tablename__ = "contact_messages"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    department: Mapped[Department] = mapped_column(
        Enum(Department, values_callable=lambda obj: [e.value for e in obj]),
        default=Department.INQUIRY,
        nullable=False,
    )
    
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    
    status: Mapped[MessageStatus] = mapped_column(
        Enum(MessageStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=MessageStatus.NEW,
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<ContactMessage(id={self.id}, email={self.email}, department={self.department})>"


class NewsletterSubscriber(Base):
    """Newsletter subscription model."""
    __tablename__ = "newsletter_subscribers"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, default="footer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<NewsletterSubscriber(id={self.id}, email={self.email})>"
