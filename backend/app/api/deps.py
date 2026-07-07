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
from fastapi import Query


logger = structlog.get_logger(__name__)

# Tells FastAPI where to find the token (used in OpenAPI docs too)
# auto_error=False allows us to fallback to query parameters (for SSE)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

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
    session: DBSession,
    token: str = Depends(oauth2_scheme),
    query_token: str = Query(None, alias="token"),
) -> User:
    """
    Resolve the JWT bearer token to an active User instance using Clerk.
    Falls back to query_token for Server-Sent Events which can't send headers.

    Usage in routes:
        CurrentUser = Annotated[User, Depends(get_current_user)]
    """
    from app.services.clerk_service import verify_clerk_token, fetch_clerk_user_info
    from sqlalchemy import select
    from fastapi import Request
    
    # Priority: Header -> Query Parameter
    actual_token = token or query_token
    
    if not actual_token:
        raise UnauthorizedException(message="Not authenticated")
    
    try:
        clerk_id = verify_clerk_token(actual_token)
    except ValueError as e:
        raise UnauthorizedException(message=str(e))

    # Query DB for user
    stmt = select(User).where(User.clerk_user_id == clerk_id)
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Auto-sync user if they do not exist
        user_info = await fetch_clerk_user_info(clerk_id)
        user = User(
            clerk_user_id=clerk_id,
            email=user_info["email"],
            full_name=user_info["full_name"],
            role=UserRole.OPERATOR,
            is_active=True
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    if not user.is_active:
        raise ForbiddenException("User account is inactive")

    return user


# Type alias for clean route signatures
CurrentUser = Annotated[User, Depends(get_current_user)]


# ─── Notification Service Dependency ────────────────────────────────
def get_notification_service(session: DBSession):
    from app.repositories.notification_repository import NotificationRepository
    from app.services.notification_service import NotificationService
    
    repository = NotificationRepository(session)
    return NotificationService(repository)

NotificationSvc = Annotated[__import__('app.services.notification_service', fromlist=['NotificationService']).NotificationService, Depends(get_notification_service)]


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
