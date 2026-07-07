"""
ForgeMind AI — Notifications Router
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, NotificationSvc
from app.models.notification import NotificationCategory
from app.schemas.notification import NotificationListResponse, NotificationResponse

router = APIRouter()


@router.get(
    "",
    response_model=NotificationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List notifications for the current user",
)
async def list_notifications(
    current_user: CurrentUser,
    svc: NotificationSvc,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    category: Optional[NotificationCategory] = Query(None),
) -> NotificationListResponse:
    """
    Fetch paginated notifications.
    """
    items, total = await svc.repository.get_by_user(
        user_id=current_user.id,
        limit=limit,
        offset=offset,
        unread_only=unread_only,
        category=category,
    )
    
    # Calculate pages
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    page = (offset // limit) + 1 if limit > 0 else 1

    return NotificationListResponse(
        items=[NotificationResponse.model_validate(item) for item in items],
        total=total,
        page=page,
        page_size=limit,
        total_pages=total_pages
    )


@router.get(
    "/stream",
    summary="Subscribe to real-time notifications via SSE",
)
async def stream_notifications(
    current_user: CurrentUser,
    svc: NotificationSvc,
):
    """
    Server-Sent Events endpoint to receive live notification pushes.
    The client should connect using the EventSource API.
    """
    return StreamingResponse(
        svc.subscribe_to_user_notifications(current_user.id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no", # Required for NGINX to not buffer SSE
        }
    )


@router.post(
    "/{notification_id}/read",
    status_code=status.HTTP_200_OK,
    summary="Mark a notification as read",
)
async def mark_notification_read(
    notification_id: UUID,
    current_user: CurrentUser,
    svc: NotificationSvc,
):
    """Mark a specific notification as read."""
    success = await svc.repository.mark_as_read(notification_id, current_user.id)
    await svc.repository.session.commit()
    return {"success": success}


@router.post(
    "/read-all",
    status_code=status.HTTP_200_OK,
    summary="Mark all notifications as read",
)
async def mark_all_notifications_read(
    current_user: CurrentUser,
    svc: NotificationSvc,
):
    """Mark all unread notifications for the user as read."""
    count = await svc.repository.mark_all_as_read(current_user.id)
    await svc.repository.session.commit()
    return {"success": True, "marked_count": count}


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a notification",
)
async def delete_notification(
    notification_id: UUID,
    current_user: CurrentUser,
    svc: NotificationSvc,
):
    """Delete a specific notification."""
    success = await svc.repository.delete(notification_id, current_user.id)
    await svc.repository.session.commit()
    return {"success": success}
