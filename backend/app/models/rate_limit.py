"""
NEXO — Rate Limit Models
"""
import enum
from typing import Optional
from datetime import datetime

from sqlalchemy import Boolean, Enum, String, Integer, Float, JSON, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RateLimitLog(Base):
    """
    Logs rate limiting violations and telemetry for the Admin Dashboard.
    """
    __tablename__ = "rate_limit_logs"

    # Base class provides id (uuid), created_at (datetime), updated_at (datetime)
    
    user_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    ip_address: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    endpoint: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    role: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    limit_value: Mapped[int] = mapped_column(Integer, nullable=False)
    remaining: Mapped[int] = mapped_column(Integer, nullable=False)
    
    violation_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "BURST_LIMIT", "DAILY_LIMIT"
    security_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    decision: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g. "BLOCKED", "THROTTLED"

    # Composite indices for fast dashboard querying
    __table_args__ = (
        Index('ix_rate_limit_logs_ip_time', 'ip_address', 'created_at'),
        Index('ix_rate_limit_logs_user_time', 'user_id', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<RateLimitLog(ip={self.ip_address}, endpoint={self.endpoint}, decision={self.decision})>"
