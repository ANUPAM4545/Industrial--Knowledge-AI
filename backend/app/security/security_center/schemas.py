from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AggregatedSecurityEvent(BaseModel):
    """
    Unified schema representing an event from either
    security_logs, rate_limit_logs, or security_events.
    """
    id: str
    source_table: str # "security_logs", "rate_limit_logs", or "security_events"
    event_type: str # e.g. "PROMPT_INJECTION", "RATE_LIMIT_VIOLATION", "LOGIN_FAILED"
    severity: str # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    
    timestamp: datetime
    
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    
    # Contextual data
    action_taken: str # "ALLOW", "BLOCK", "REVIEW"
    risk_score: Optional[float] = None
    details: Optional[Dict[str, Any]] = None

class TimelineResponse(BaseModel):
    events: List[AggregatedSecurityEvent]
    total: int
    page: int
    page_size: int

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    old_value: Optional[Dict[str, Any]]
    new_value: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
