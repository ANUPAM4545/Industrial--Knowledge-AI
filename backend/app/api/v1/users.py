"""
ForgeMind AI — User Management Endpoints
"""
from fastapi import APIRouter, Query, status

from app.schemas.user import UserResponse, UpdateUserRequest

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: str = Query(None),
):
    """List all users. Admin only. TODO: Implement."""
    raise NotImplementedError("List users not yet implemented")


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_user(user_id: str):
    """Get user by ID. TODO: Implement."""
    raise NotImplementedError("Get user not yet implemented")


@router.patch("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def update_user(user_id: str, body: UpdateUserRequest):
    """Update user profile. TODO: Implement."""
    raise NotImplementedError("Update user not yet implemented")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """Delete user account. Admin only. TODO: Implement."""
    return None
