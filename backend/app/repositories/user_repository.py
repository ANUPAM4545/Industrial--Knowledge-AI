"""
User Repository — data access layer for the users table.

Responsibilities:
- All database queries related to users
- No business logic — pure CRUD + lookups
"""
from typing import Optional

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole, UserStatus

logger = structlog.get_logger(__name__)


class UserRepository:
    """Async repository for the User model."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ─── Read ──────────────────────────────────────────────────────

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Fetch a user by primary key."""
        result = await self._session.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """Fetch a user by email address (case-insensitive)."""
        result = await self._session.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def get_by_username(self, username: str) -> Optional[User]:
        """Fetch a user by username."""
        result = await self._session.execute(
            select(User).where(User.username == username.lower())
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        """Return True if a user with this email already exists."""
        return await self.get_by_email(email) is not None

    async def username_exists(self, username: str) -> bool:
        """Return True if a user with this username already exists."""
        return await self.get_by_username(username) is not None

    # ─── Write ─────────────────────────────────────────────────────

    async def create(
        self,
        *,
        email: str,
        username: str,
        full_name: str,
        hashed_password: str,
        role: UserRole = UserRole.OPERATOR,
    ) -> User:
        """Insert a new user record and return the persisted instance."""
        user = User(
            email=email.lower(),
            username=username.lower(),
            full_name=full_name,
            hashed_password=hashed_password,
            role=role,
            status=UserStatus.ACTIVE,
            is_verified=False,
        )
        self._session.add(user)
        await self._session.flush()   # get the generated id before commit
        await self._session.refresh(user)

        logger.info("User created", user_id=user.id, email=user.email, role=user.role)
        return user

    async def update_last_login(self, user: User) -> None:
        """Stamp the last_login_at field with the current UTC time string."""
        from datetime import datetime, timezone
        user.last_login_at = datetime.now(timezone.utc).isoformat()
        self._session.add(user)
        await self._session.flush()
