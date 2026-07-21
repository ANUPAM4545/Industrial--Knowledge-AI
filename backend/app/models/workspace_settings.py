"""
NEXO — Workspace Settings Model
"""

from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.workspace import Workspace

class WorkspaceSettings(Base, SoftDeleteMixin):
    """
    Dedicated table for tenant-specific configuration and policies.
    Linked 1-to-1 with a Workspace.
    """
    __tablename__ = "workspace_settings"

    workspace_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("workspaces.id", ondelete="CASCADE"), 
        unique=True, 
        index=True, 
        nullable=False
    )
    
    # Policies
    document_policy: Mapped[str] = mapped_column(String(50), default="standard", nullable=False)
    allowed_mime_types: Mapped[list[str]] = mapped_column(
        JSON, 
        default=lambda: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv"], 
        nullable=False
    )
    max_upload_size_mb: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    
    # AI Config
    ai_provider: Mapped[str] = mapped_column(String(50), default="gemini", nullable=False)
    ai_model: Mapped[str] = mapped_column(String(50), default="gemini-2.5-flash", nullable=False)
    knowledge_only_mode: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    citation_requirements: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Security & Governance
    security_level: Mapped[str] = mapped_column(String(50), default="standard", nullable=False)
    retention_policy_days: Mapped[int] = mapped_column(Integer, default=365, nullable=False) # 0 means indefinite
    developer_mode: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="settings")  # noqa: F821

    def __repr__(self) -> str:
        return f"<WorkspaceSettings(workspace_id={self.workspace_id})>"
