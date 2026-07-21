"""
Authentication Endpoints
"""
from fastapi import Request, APIRouter, status

from app.api.deps import DBSession, CurrentUser
from app.schemas.user import UpdateUserRequest, UserResponse
from fastapi import Request, Depends
from app.security.rate_limit.decorators import rate_limit
from app.security.rate_limit.models import LimitType

router = APIRouter()

@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile (Synced with Clerk)",
    dependencies=[Depends(rate_limit(LimitType.AUTH, "me"))]
)
async def get_me(
    current_user: CurrentUser,
    request: Request,
    session: DBSession
) -> UserResponse:
    """
    Return the profile of the currently authenticated user from the local database.

    Requires a valid Clerk `Authorization: Bearer <access_token>` header.
    """
    from app.services.audit_service import AuditService
    from app.services.workspace_service import WorkspaceService
    
    # Try to find a workspace for logging
    ws_service = WorkspaceService(session)
    workspaces = await ws_service.get_user_workspaces(current_user.id)
    workspace_id = workspaces[0].id if workspaces else None

    if workspace_id:
        audit = AuditService(session)
        await audit.log_action(
            action="LOGIN_SUCCESS",
            status="SUCCESS",
            workspace_id=workspace_id,
            user_id=current_user.id,
            request=request,
        )
    
    return UserResponse.model_validate(current_user)


@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
    dependencies=[Depends(rate_limit(LimitType.AUTH, "me_update"))]
)
async def update_me(
    payload: UpdateUserRequest,
    current_user: CurrentUser,
    session: DBSession
) -> UserResponse:
    """
    Update the current user's profile information (e.g. department, full_name).
    """
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.department is not None:
        current_user.department = payload.department
    if payload.bio is not None:
        current_user.bio = payload.bio
    if payload.avatar_url is not None:
        current_user.avatar_url = payload.avatar_url

    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return UserResponse.model_validate(current_user)
