"""
Authentication Endpoints
"""
from fastapi import APIRouter, status

from app.api.deps import CurrentUser
from app.schemas.user import UserResponse
from fastapi import Depends
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
async def get_me(current_user: CurrentUser) -> UserResponse:
    """
    Return the profile of the currently authenticated user from the local database.

    Requires a valid Clerk `Authorization: Bearer <access_token>` header.
    """
    return UserResponse.model_validate(current_user)

@router.put(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
    dependencies=[Depends(rate_limit(LimitType.AUTH, "me_update"))]
)
async def update_me(
    payload: __import__('app.schemas.user', fromlist=['UpdateUserRequest']).UpdateUserRequest,
    current_user: CurrentUser,
    session: __import__('app.api.deps', fromlist=['DBSession']).DBSession
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
