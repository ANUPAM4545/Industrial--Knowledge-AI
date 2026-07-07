"""
NEXO — Chat Schemas (Pydantic v2)
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class CitationSchema(BaseModel):
    document_id: str
    document_title: str
    page_number: Optional[int] = None
    chunk_text: str
    score: float


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    role: str
    content: str
    citations: Optional[List[CitationSchema]] = None
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None
    created_at: datetime


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    user_id: str
    document_ids: Optional[str] = None
    message_count: int
    is_archived: bool
    messages: Optional[List[MessageResponse]] = None
    created_at: datetime
    updated_at: datetime


class CreateConversationRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    document_ids: Optional[List[str]] = None


class MessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
    stream: bool = False
