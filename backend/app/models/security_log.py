from datetime import datetime
import uuid

from sqlalchemy import Column, String, DateTime, JSON, Float
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base

class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=True, index=True)
    conversation_id = Column(String(255), nullable=True, index=True)
    
    event_type = Column(String(100), nullable=False, index=True) # e.g. "chat_input", "document_upload", "chat_output"
    action_taken = Column(String(50), nullable=False) # "ALLOW", "REVIEW", "BLOCK"
    
    risk_score = Column(Float, nullable=False, default=0.0)
    
    # JSON containing which rules were triggered
    triggered_rules = Column(JSON, nullable=True)
    
    # Store reasoning or specific details (do not store full user prompt if avoidable)
    details = Column(JSON, nullable=True)
    
    # Performance metric
    processing_time_ms = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
