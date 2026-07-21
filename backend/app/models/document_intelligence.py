"""
NEXO — Document Intelligence Model
Stores AI-generated metadata for a document (Executive Summary, Topics, Keywords, Entities, Action Items, FAQs, etc.).
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base, WorkspaceMixin, SoftDeleteMixin

def generate_uuid():
    return str(uuid.uuid4())

class DocumentIntelligence(Base, WorkspaceMixin, SoftDeleteMixin):
    """Stores all asynchronous AI-extracted insights for a Document."""
    __tablename__ = "document_intelligence"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    executive_summary = Column(String, nullable=True)
    topics = Column(JSONB, nullable=True) # List of strings
    keywords = Column(JSONB, nullable=True) # List of strings
    entities = Column(JSONB, nullable=True) # List of dicts {name, type}
    action_items = Column(JSONB, nullable=True) # List of strings
    risks = Column(JSONB, nullable=True) # List of strings
    faqs = Column(JSONB, nullable=True) # List of dicts {question, answer}
    suggested_questions = Column(JSONB, nullable=True) # List of strings
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Document relationship is defined in Document model
