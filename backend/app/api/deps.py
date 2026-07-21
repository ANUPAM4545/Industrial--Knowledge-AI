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

    if not user or user.full_name == "Unknown User":
        # Auto-sync user if they do not exist or were previously saved as Unknown User
        user_info = await fetch_clerk_user_info(clerk_id)
        
        # Only update if we successfully fetched real data
        if user_info["full_name"] != "Unknown User":
            if not user:
                user = User(
                    clerk_user_id=clerk_id,
                    email=user_info["email"],
                    full_name=user_info["full_name"],
                    role=UserRole.OPERATOR,
                    is_active=True
                )
                session.add(user)
            else:
                user.email = user_info["email"]
                user.full_name = user_info["full_name"]
                
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

NotificationSvc = Annotated['NotificationService', Depends(get_notification_service)]


# ─── RBAC Dependency Factory ────────────────────────────────────────

def require_roles(*roles: UserRole):
    """
    Global system role check (e.g. for superadmins).
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

AdminOnly = Depends(require_roles(UserRole.ADMIN))

# ─── Workspace Dependencies ──────────────────────────────────────────

from fastapi import Header
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole

async def get_current_workspace(
    session: DBSession,
    current_user: CurrentUser,
    x_workspace_id: str = Header(None, description="The ID of the active workspace")
) -> Workspace:
    """
    Validates that the current user belongs to the specified workspace, and returns the workspace.
    If no workspace ID is provided in the header, defaults to the user's first active workspace.
    If the user has NO workspaces, it auto-provisions a personal workspace.
    """
    from sqlalchemy import select
    from sqlalchemy.orm import selectinload
    from app.models.workspace import Workspace, WorkspaceRole
    from app.models.workspace_settings import WorkspaceSettings

    if not x_workspace_id:
        stmt = select(WorkspaceMember).where(
            WorkspaceMember.user_id == current_user.id,
            WorkspaceMember.is_active == True
        ).options(selectinload(WorkspaceMember.workspace))
        result = await session.execute(stmt)
        member = result.scalars().first()
        
        if not member or not member.workspace.is_active:
            # Auto-provision a Personal Workspace
            new_workspace = Workspace(name=f"{current_user.full_name or 'User'}'s Workspace", description="Personal Workspace")
            session.add(new_workspace)
            await session.flush()
            
            settings = WorkspaceSettings(workspace_id=new_workspace.id)
            session.add(settings)
            
            new_member = WorkspaceMember(workspace_id=new_workspace.id, user_id=current_user.id, role=WorkspaceRole.ADMIN)
            session.add(new_member)
            
            await session.commit()
            
            new_workspace.current_user_role = WorkspaceRole.ADMIN
            return new_workspace
        
        member.workspace.current_user_role = member.role
        return member.workspace

    stmt = select(WorkspaceMember).where(
        WorkspaceMember.workspace_id == x_workspace_id,
        WorkspaceMember.user_id == current_user.id,
        WorkspaceMember.is_active == True
    ).options(selectinload(WorkspaceMember.workspace))
    
    result = await session.execute(stmt)
    member = result.scalar_one_or_none()
    
    if not member or not member.workspace.is_active:
        raise ForbiddenException("You do not have access to this workspace or it is inactive.")
        
    # Attach role to workspace for convenience down the line
    member.workspace.current_user_role = member.role
    return member.workspace


CurrentWorkspace = Annotated[Workspace, Depends(get_current_workspace)]


def require_workspace_role(*roles: WorkspaceRole):
    """
    Dependency factory: allow users whose role in the CURRENT workspace is in `roles`.
    """
    async def _check_workspace_role(workspace: CurrentWorkspace) -> Workspace:
        if workspace.current_user_role not in roles:
            raise ForbiddenException(
                f"This action requires one of workspace roles: "
                f"{', '.join(r.value for r in roles)}. "
                f"Your role is: {workspace.current_user_role.value}."
            )
        return workspace

    return _check_workspace_role
