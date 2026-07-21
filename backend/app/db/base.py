"""
NEXO — SQLAlchemy Base Model
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    # Common fields for all models
    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def to_dict(self) -> dict:
        """Convert model instance to dictionary."""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(id={self.id})>"


class WorkspaceMixin:
    """Mixin to add workspace isolation to models."""
    from sqlalchemy import String, ForeignKey
    from sqlalchemy.orm import Mapped, mapped_column
    
    workspace_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("workspaces.id", ondelete="CASCADE"), 
        index=True, 
        nullable=False
    )


class SoftDeleteMixin:
    """Mixin to add soft delete functionality to models."""
    from datetime import datetime, timezone
    from typing import Optional
    from sqlalchemy import DateTime, String
    from sqlalchemy.orm import Mapped, mapped_column
    
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    deleted_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

# Import models at the bottom to register them with metadata without circular import cycles
try:
    from app.models.user import User  # noqa
except ImportError:
    pass

try:
    from app.models.document import Document  # noqa
    
    # Optional: Chunks, if you want them managed by Alembic
    from app.models.chunk import Chunk  # noqa

    # Security Log
    from app.models.security_log import SecurityLog  # noqa
    
    # Rate Limit Log
    from app.models.rate_limit import RateLimitLog # noqa
    
    # Security Center
    from app.models.security_center import AuditLog, ActiveSession, BlockedEntity, SecurityReport, SecurityEvent # noqa

    # Workspaces
    from app.models.workspace import Workspace, WorkspaceMember # noqa
    from app.models.workspace_settings import WorkspaceSettings # noqa

    # AI Enterprise Models
    from app.models.knowledge_graph import KnowledgeNode, KnowledgeEdge # noqa
    from app.models.document_intelligence import DocumentIntelligence # noqa
    from app.models.intelligence import Recommendation, WorkflowTemplate # noqa
    from app.models.search_log import SearchLog # noqa
except ImportError:
    pass

try:
    from app.chat.models import Conversation, Message  # noqa
except ImportError:
    pass

