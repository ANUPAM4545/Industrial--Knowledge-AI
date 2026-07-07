"""
ForgeMind AI — Chat Database Models
"""
import enum
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Conversation(Base):
    """
    A chat conversation instance tied to a user.
    """
    __tablename__ = "conversations"

    title: Mapped[str] = mapped_column(String(255), default="New Conversation", nullable=False)
    
    # Ownership
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    # Relationships
    messages: Mapped[List["Message"]] = relationship(
        "Message", 
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )

    def __repr__(self) -> str:
        return f"<Conversation(id={self.id}, title={self.title}, user_id={self.user_id})>"


class Role(str, enum.Enum):
    """Message roles."""
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


class Message(Base):
    """
    A single message inside a conversation.
    """
    __tablename__ = "messages"

    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    
    role: Mapped[Role] = mapped_column(
        Enum(Role, values_callable=lambda obj: [e.value for e in obj]),
        nullable=False,
    )
    
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Store retrieved context or citations for assistant messages
    context_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Metrics
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", 
        back_populates="messages"
    )

    def __repr__(self) -> str:
        return f"<Message(id={self.id}, role={self.role}, conversation_id={self.conversation_id})>"
