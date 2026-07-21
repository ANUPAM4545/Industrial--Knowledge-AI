"""
NEXO — Search Log Model
Tracks user search queries, latency, and success rates for Analytics.
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base, WorkspaceMixin, SoftDeleteMixin

def generate_uuid():
    return str(uuid.uuid4())

class SearchLog(Base, WorkspaceMixin, SoftDeleteMixin):
    """
    Analytics model to track what users are searching for and whether they clicked results.
    """
    __tablename__ = "search_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    query = Column(String(1000), nullable=False, index=True)
    search_type = Column(String(50), nullable=False) # 'semantic', 'keyword', 'hybrid'
    
    results_count = Column(Integer, nullable=False, default=0)
    latency_ms = Column(Float, nullable=False)
    
    # Was the search successful? Did it return relevant context?
    is_successful = Column(Boolean, nullable=False, default=True)
    
    # Optional metadata (e.g. filters applied)
    metadata_json = Column(JSONB, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False, index=True)
