"""
ForgeMind AI — SQLAlchemy Models
Import all models here so Alembic can auto-detect them.
"""
from app.db.base import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.chat.models import Conversation, Message  # noqa: F401
from app.models.analytics import SearchEvent, ChatEvent  # noqa: F401
from app.models.chunk import Chunk  # noqa: F401
from app.models.marketing import ContactMessage, NewsletterSubscriber  # noqa: F401
from app.models.knowledge_graph import KnowledgeNode, KnowledgeEdge, KnowledgeCluster, node_cluster_association  # noqa: F401
from app.models.intelligence import Recommendation, WorkflowTemplate  # noqa: F401
from app.models.notification import Notification  # noqa: F401

__all__ = ["Base", "User", "Document", "Conversation", "Message", "SearchEvent", "ChatEvent", "Chunk", "ContactMessage", "NewsletterSubscriber", "KnowledgeNode", "KnowledgeEdge", "KnowledgeCluster", "Recommendation", "WorkflowTemplate", "Notification"]
