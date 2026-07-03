"""
ForgeMind AI — Analytics Models
"""
from typing import Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SearchEvent(Base):
    """Tracks document search events for analytics."""
    __tablename__ = "search_events"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    results_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    document_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    session_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


class ChatEvent(Base):
    """Tracks AI chat events for analytics."""
    __tablename__ = "chat_events"

    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    conversation_id: Mapped[str] = mapped_column(String(36), ForeignKey("conversations.id"), nullable=False)
    tokens_input: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tokens_output: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    response_time_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    model_used: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    was_helpful: Mapped[Optional[bool]] = mapped_column(nullable=True)
