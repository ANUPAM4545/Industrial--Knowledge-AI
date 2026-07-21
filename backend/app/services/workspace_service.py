import structlog
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.workspace import Workspace, WorkspaceMember, WorkspaceRole

logger = structlog.get_logger(__name__)

class WorkspaceService:
    """
    Service for managing Workspaces and enforcing isolation.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_workspace(self, name: str, description: Optional[str] = None) -> Workspace:
        from app.models.workspace_settings import WorkspaceSettings
        
        workspace = Workspace(name=name, description=description)
        self.session.add(workspace)
        
        # Flush to get the workspace ID
        await self.session.flush()
        
        # Attach default settings
        settings = WorkspaceSettings(workspace_id=workspace.id)
        self.session.add(settings)
        
        await self.session.commit()
        await self.session.refresh(workspace)
        return workspace

    async def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        stmt = select(Workspace).where(
            Workspace.id == workspace_id,
            Workspace.deleted_at.is_(None)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_workspaces(self, user_id: str) -> List[Workspace]:
        stmt = (
            select(Workspace)
            .join(WorkspaceMember)
            .where(
                WorkspaceMember.user_id == user_id,
                WorkspaceMember.is_active == True,
                Workspace.deleted_at.is_(None)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_member(self, workspace_id: str, user_id: str, role: WorkspaceRole = WorkspaceRole.VIEWER) -> WorkspaceMember:
        member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=user_id,
            role=role
        )
        self.session.add(member)
        await self.session.commit()
        await self.session.refresh(member)
        return member

    def enforce_isolation(self, query, model, workspace_id: str):
        """
        Applies workspace filtering and soft-delete filtering to a SQLAlchemy query.
        """
        if hasattr(model, 'workspace_id'):
            query = query.where(model.workspace_id == workspace_id)
        if hasattr(model, 'deleted_at'):
            query = query.where(model.deleted_at.is_(None))
        return query
