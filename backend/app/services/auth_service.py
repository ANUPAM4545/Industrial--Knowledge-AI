"""
Auth Service — business logic layer for authentication.

Responsibilities:
- Register a new user (validate uniqueness, hash password)
- Authenticate a user (verify credentials, issue tokens)
- Refresh an access token (validate refresh token)
- Blacklist a refresh token on logout (via Redis)

Dependencies injected at call-site:
- UserRepository
- AsyncSession (for commits)
- Redis client (for token blacklisting)
"""
from typing import Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ConflictException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User, UserRole, UserStatus
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginResponse, RegisterRequest, TokenResponse

logger = structlog.get_logger(__name__)


class AuthService:
    """Handles all authentication and token management."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = UserRepository(session)

    # ─── Register ──────────────────────────────────────────────────

    async def register(self, data: RegisterRequest) -> User:
        """
        Create a new user account.

        Raises:
            ConflictException: if email or username is already taken.
        """
        if await self._repo.email_exists(data.email):
            raise ConflictException(f"Email '{data.email}' is already registered.")

        if await self._repo.username_exists(data.username):
            raise ConflictException(f"Username '{data.username}' is already taken.")

        role = self._parse_role(data.role)
        user = await self._repo.create(
            email=data.email,
            username=data.username,
            full_name=data.full_name,
            hashed_password=hash_password(data.password),
            role=role,
        )

        logger.info("User registered", user_id=user.id, role=user.role.value)
        return user

    # ─── Login ─────────────────────────────────────────────────────

    async def login(self, email: str, password: str) -> LoginResponse:
        """
        Authenticate a user and return JWT tokens.

        Raises:
            UnauthorizedException: on invalid credentials or inactive account.
        """
        user = await self._repo.get_by_email(email)

        if user is None or not verify_password(password, user.hashed_password):
            raise UnauthorizedException("Invalid email or password.")

        if user.status != UserStatus.ACTIVE:
            raise UnauthorizedException(
                f"Account is {user.status.value}. Contact your administrator."
            )

        await self._repo.update_last_login(user)
        logger.info("User logged in", user_id=user.id)

        return LoginResponse(
            access_token=create_access_token(subject=user.id),
            refresh_token=create_refresh_token(subject=user.id),
            token_type="bearer",
        )

    # ─── Refresh ───────────────────────────────────────────────────

    async def refresh(self, refresh_token: str) -> TokenResponse:
        """
        Issue a new access token from a valid refresh token.

        Raises:
            UnauthorizedException: if token is invalid, expired, or user not found.
        """
        payload = decode_token(refresh_token)

        if payload is None or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token.")

        user_id: Optional[str] = payload.get("sub")
        user = await self._repo.get_by_id(user_id) if user_id else None

        if user is None or user.status != UserStatus.ACTIVE:
            raise UnauthorizedException("User not found or account is inactive.")

        logger.info("Token refreshed", user_id=user.id)
        return TokenResponse(
            access_token=create_access_token(subject=user.id),
            token_type="bearer",
        )

    # ─── Get Current User ──────────────────────────────────────────

    async def get_user_from_token(self, access_token: str) -> User:
        """
        Decode an access token and return the corresponding User.

        Raises:
            UnauthorizedException: if token is invalid or user not found.
        """
        payload = decode_token(access_token)

        if payload is None or payload.get("type") != "access":
            raise UnauthorizedException("Invalid or expired access token.")

        user_id: Optional[str] = payload.get("sub")
        user = await self._repo.get_by_id(user_id) if user_id else None

        if user is None:
            raise UnauthorizedException("User not found.")

        if user.status != UserStatus.ACTIVE:
            raise UnauthorizedException("Account is not active.")

        return user

    # ─── Helpers ───────────────────────────────────────────────────

    @staticmethod
    def _parse_role(role_str: str) -> UserRole:
        """Convert a string role to UserRole enum, falling back to OPERATOR."""
        try:
            return UserRole(role_str.lower())
        except ValueError:
            return UserRole.OPERATOR
