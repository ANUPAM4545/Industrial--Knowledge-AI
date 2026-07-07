"""
ForgeMind AI — Knowledge Graph Models
Stores extracted entities and their relationships.
"""
from typing import Optional, List
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

# Association table for KnowledgeNode and KnowledgeCluster
node_cluster_association = Table(
    'node_clusters',
    Base.metadata,
    Column('node_id', String(36), ForeignKey('knowledge_nodes.id', ondelete='CASCADE'), primary_key=True),
    Column('cluster_id', String(36), ForeignKey('knowledge_clusters.id', ondelete='CASCADE'), primary_key=True)
)


class KnowledgeCluster(Base):
    """Clusters or categories of knowledge nodes for visual grouping"""
    __tablename__ = "knowledge_clusters"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    color = Column(String(50), nullable=True)
    
    # Relationships
    nodes = relationship("KnowledgeNode", secondary=node_cluster_association, back_populates="clusters")


class KnowledgeNode(Base):
    """Represents an entity extracted from a document (e.g., Equipment, Person, Standard)"""
    __tablename__ = "knowledge_nodes"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    node_type = Column(String(100), nullable=False, index=True) # e.g., 'Equipment', 'Regulation', 'Person'
    summary = Column(String(2000), nullable=True)
    embedding_id = Column(String(255), nullable=True) # Reference to vector DB if node itself is embedded
    metadata_json = Column(JSONB, nullable=True) # Flexible schema for arbitrary properties
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    # Relationships
    clusters = relationship("KnowledgeCluster", secondary=node_cluster_association, back_populates="nodes")
    
    # Outgoing edges where this node is the source
    outgoing_edges = relationship("KnowledgeEdge", foreign_keys="KnowledgeEdge.source_node_id", back_populates="source_node", cascade="all, delete-orphan")
    
    # Incoming edges where this node is the target
    incoming_edges = relationship("KnowledgeEdge", foreign_keys="KnowledgeEdge.target_node_id", back_populates="target_node", cascade="all, delete-orphan")


class KnowledgeEdge(Base):
    """Represents a relationship between two KnowledgeNodes"""
    __tablename__ = "knowledge_edges"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    source_node_id = Column(String(36), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False, index=True)
    target_node_id = Column(String(36), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(255), nullable=False, index=True) # e.g., 'MAINTAINED_BY', 'REQUIRES_STANDARD'
    confidence = Column(Float, nullable=True) # AI extraction confidence score 0.0 - 1.0
    metadata_json = Column(JSONB, nullable=True)

    # Relationships
    source_node = relationship("KnowledgeNode", foreign_keys=[source_node_id], back_populates="outgoing_edges")
    target_node = relationship("KnowledgeNode", foreign_keys=[target_node_id], back_populates="incoming_edges")
