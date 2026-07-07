"""
ForgeMind AI — Rate Limiting Models
"""
from enum import Enum
from pydantic import BaseModel
from typing import Optional

class LimitType(str, Enum):
    AUTH = "auth"
    CHAT = "chat"
    DOCUMENT = "document"
    SEARCH = "search"
    DASHBOARD = "dashboard"
    CONTACT = "contact"

class RateLimitPolicy(BaseModel):
    requests: int
    window_seconds: int
    burst_limit: Optional[int] = None
    burst_window_seconds: Optional[int] = None

class RateLimitDecision(BaseModel):
    allowed: bool
    limit: int
    remaining: int
    retry_after: int
    violation_type: Optional[str] = None
    ip_address: str
    user_id: Optional[str] = None
