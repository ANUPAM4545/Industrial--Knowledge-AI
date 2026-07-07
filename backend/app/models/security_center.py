"""
NEXO — Security Center Models
"""
import uuid
from typing import Optional
from datetime import datetime

from sqlalchemy import Boolean, String, Integer, Float, JSON, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AuditLog(Base):
    """
    Immutable audit log for tracking system mutations (admin actions, RBAC changes, etc).
    """
    __tablename__ = "audit_logs"

    # id, created_at, updated_at provided by Base
    user_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    user_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True) # E.g., {"email": "...", "role": "admin"}
    
    action: Mapped[str] = mapped_column(String(255), index=True, nullable=False) # e.g. "USER_ROLE_CHANGED"
    resource_type: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True) # e.g. "USER"
    resource_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    
    old_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    new_value: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    ip_address: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    __table_args__ = (
        Index('ix_audit_logs_action_time', 'action', 'created_at'),
    )


class ActiveSession(Base):
    """
    Tracks active user sessions and allows admins to terminate them.
    """
    __tablename__ = "active_sessions"

    user_id: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    session_token_hash: Mapped[str] = mapped_column(String(500), unique=True, index=True, nullable=False)
    
    ip_address: Mapped[str] = mapped_column(String(100), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    login_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_activity: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    __table_args__ = (
        Index('ix_active_sessions_user_active', 'user_id', 'is_active'),
    )


class BlockedEntity(Base):
    """
    Tracks blocked IPs or Users.
    """
    __tablename__ = "blocked_entities"

    entity_type: Mapped[str] = mapped_column(String(50), nullable=False) # "IP" or "USER"
    entity_value: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    reason: Mapped[str] = mapped_column(String(500), nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class SecurityReport(Base):
    """
    Stores generated security summaries (e.g. Daily, Weekly).
    """
    __tablename__ = "security_reports"

    report_type: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # "DAILY", "WEEKLY"
    metrics: Mapped[dict] = mapped_column(JSON, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)


class SecurityEvent(Base):
    """
    Generic security events for the timeline (e.g., Failed Logins, Permission Denials).
    """
    __tablename__ = "security_events"

    event_type: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), index=True, nullable=False) # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    
    user_id: Mapped[Optional[str]] = mapped_column(String(255), index=True, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    __table_args__ = (
        Index('ix_security_events_time_severity', 'created_at', 'severity'),
    )
