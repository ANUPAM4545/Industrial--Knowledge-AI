"""
NEXO — Workspaces API
"""
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.api.deps import CurrentUser, CurrentWorkspace, DBSession
from app.models.workspace_settings import WorkspaceSettings

router = APIRouter()


class WorkspaceSettingsUpdate(BaseModel):
    document_policy: str | None = None
    allowed_mime_types: list[str] | None = None
    max_upload_size_mb: int | None = None
    ai_provider: str | None = None
    ai_model: str | None = None
    knowledge_only_mode: bool | None = None
    citation_requirements: bool | None = None
    security_level: str | None = None
    retention_policy_days: int | None = None
    developer_mode: bool | None = None


@router.get("/{workspace_id}/settings")
async def get_workspace_settings(
    workspace_id: str,
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    session: DBSession,
) -> Any:
    """
    Get settings for a specific workspace.
    """
    if current_workspace.id != workspace_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")

    # Fetch settings
    from sqlalchemy import select
    stmt = select(WorkspaceSettings).where(WorkspaceSettings.workspace_id == workspace_id)
    result = await session.execute(stmt)
    settings = result.scalar_one_or_none()

    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found for this workspace")

    return settings


@router.patch("/{workspace_id}/settings")
async def update_workspace_settings(
    workspace_id: str,
    update_data: WorkspaceSettingsUpdate,
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    session: DBSession,
) -> Any:
    """
    Update settings for a specific workspace.
    """
    # Note: A real app would check if current_user has Admin role in this workspace
    if current_workspace.id != workspace_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this workspace")

    from sqlalchemy import select
    stmt = select(WorkspaceSettings).where(WorkspaceSettings.workspace_id == workspace_id)
    result = await session.execute(stmt)
    settings = result.scalar_one_or_none()

    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found for this workspace")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(settings, key, value)

    session.add(settings)
    await session.commit()
    await session.refresh(settings)

    return settings
