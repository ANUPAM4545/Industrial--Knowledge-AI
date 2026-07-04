"""
FastAPI Dependencies — reusable dependency functions.

These are injected into route handlers via Depends().

Provided:
- get_db                  → AsyncSession
- get_current_user        → User (raises 401 if token missing/invalid)
- require_roles           → factory that checks role membership (raises 403)
- get_storage_provider    → StorageProvider (LocalStorageProvider by default)
"""
from typing import Annotated

import structlog
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.db.session import get_db
from app.models.user import User, UserRole
from app.services.auth_service import AuthService

logger = structlog.get_logger(__name__)

# Tells FastAPI where to find the token (used in OpenAPI docs too)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

from app.storage.base import StorageProvider
from app.storage.local_storage import LocalStorageProvider

# ─── Type aliases (clean route signatures) ──────────────────────────
DBSession = Annotated[AsyncSession, Depends(get_db)]
BearerToken = Annotated[str, Depends(oauth2_scheme)]


# ─── Storage Provider Dependency ────────────────────────────────────

def get_storage_provider() -> StorageProvider:
    """
    Return the active StorageProvider instance.

    Swap LocalStorageProvider for S3Provider or AzureBlobProvider
    here without touching any route handler.
    """
    return LocalStorageProvider()


Storage = Annotated[StorageProvider, Depends(get_storage_provider)]


# ─── Current User Dependency ────────────────────────────────────────

async def get_current_user(
    token: BearerToken,
    session: DBSession,
) -> User:
    """
    Resolve the JWT bearer token to an active User instance.

    Usage in routes:
        CurrentUser = Annotated[User, Depends(get_current_user)]
    """
    auth_service = AuthService(session)
    return await auth_service.get_user_from_token(token)


# Type alias for clean route signatures
CurrentUser = Annotated[User, Depends(get_current_user)]


# ─── RBAC Dependency Factory ────────────────────────────────────────

def require_roles(*roles: UserRole):
    """
    Dependency factory: only allow users whose role is in `roles`.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles(UserRole.ADMIN))])

    Raises:
        ForbiddenException: if the authenticated user's role is not permitted.
    """
    async def _check_role(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise ForbiddenException(
                f"This action requires one of: "
                f"{', '.join(r.value for r in roles)}. "
                f"Your role is: {current_user.role.value}."
            )
        return current_user

    return _check_role


# ─── Admin-only shortcut ────────────────────────────────────────────
AdminOnly = Depends(require_roles(UserRole.ADMIN))
