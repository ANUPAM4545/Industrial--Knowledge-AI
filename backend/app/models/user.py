"""
NEXO — User Model
"""
import enum
from typing import Optional

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    """User roles for RBAC."""
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    ENGINEER = "engineer"
    OPERATOR = "operator"
    VIEWER = "viewer"


class UserStatus(str, enum.Enum):
    """User account status. (Legacy)"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(Base):
    """User account model."""
    __tablename__ = "users"

    # New Clerk Fields
    clerk_user_id: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Core Fields
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, values_callable=lambda obj: [e.value for e in obj]),
        default=UserRole.OPERATOR,
        nullable=False,
    )

    # Legacy Fields (Kept to prevent destructive schema changes on existing users)
    username: Mapped[Optional[str]] = mapped_column(String(100), unique=True, index=True, nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[Optional[UserStatus]] = mapped_column(
        Enum(UserStatus, values_callable=lambda obj: [e.value for e in obj]),
        nullable=True,
    )
    is_verified: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    last_login_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, clerk_id={self.clerk_user_id}, email={self.email}, role={self.role})>"
