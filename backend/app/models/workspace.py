"""
NEXO — Workspace Models
"""
import enum
from typing import Optional, TYPE_CHECKING

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.workspace_settings import WorkspaceSettings

class WorkspaceRole(str, enum.Enum):
    """Roles within a specific workspace."""
    ADMIN = "admin"
    MANAGER = "manager"
    ENGINEER = "engineer"
    VIEWER = "viewer"


class Workspace(Base, SoftDeleteMixin):
    """
    Top-level tenant model. Every resource belongs to a Workspace.
    """
    __tablename__ = "workspaces"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Relationships
    members: Mapped[list["WorkspaceMember"]] = relationship(
        "WorkspaceMember", 
        back_populates="workspace", 
        cascade="all, delete-orphan"
    )
    settings: Mapped[Optional["WorkspaceSettings"]] = relationship(  # noqa: F821
        "WorkspaceSettings",
        back_populates="workspace",
        uselist=False,
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Workspace(id={self.id}, name={self.name})>"


class WorkspaceMember(Base):
    """
    Association table linking Users to Workspaces with a specific role.
    """
    __tablename__ = "workspace_members"

    workspace_id: Mapped[str] = mapped_column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    role: Mapped[WorkspaceRole] = mapped_column(
        Enum(WorkspaceRole, values_callable=lambda obj: [e.value for e in obj]),
        default=WorkspaceRole.VIEWER,
        nullable=False,
    )
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="members")
    
    def __repr__(self) -> str:
        return f"<WorkspaceMember(workspace_id={self.workspace_id}, user_id={self.user_id}, role={self.role})>"
