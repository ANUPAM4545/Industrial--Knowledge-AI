"""
NEXO — Intelligence Models
Stores AI-generated recommendations, insights, and workflow configurations.
"""
from typing import Optional
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())


class Recommendation(Base):
    """AI generated insights, warnings, or compliance risks"""
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(500), nullable=False)
    description = Column(String(2000), nullable=False)
    type = Column(String(100), nullable=False, index=True) # e.g., 'WARNING', 'INSIGHT', 'COMPLIANCE', 'OPPORTUNITY'
    severity = Column(String(50), nullable=False) # e.g., 'HIGH', 'MEDIUM', 'LOW'
    status = Column(String(50), nullable=False, default='OPEN') # e.g., 'OPEN', 'RESOLVED', 'IGNORED'
    
    # Optional references
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    knowledge_node_id = Column(String(36), ForeignKey("knowledge_nodes.id", ondelete="SET NULL"), nullable=True, index=True)
    
    metadata_json = Column(JSONB, nullable=True) # Contains rationale, confidence score, etc.
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class WorkflowTemplate(Base):
    """User-defined automated AI workflows (e.g. PDF -> Extract -> Graph -> Notify)"""
    __tablename__ = "workflow_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    trigger_type = Column(String(100), nullable=False) # e.g., 'DOCUMENT_UPLOAD', 'SCHEDULED', 'MANUAL'
    
    # The visual workflow structure, containing nodes and edges
    workflow_json = Column(JSONB, nullable=False) 
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
