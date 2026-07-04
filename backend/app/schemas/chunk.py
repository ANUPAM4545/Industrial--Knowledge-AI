"""
ForgeMind AI — Chunk Schemas
"""
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ChunkResponse(BaseModel):
    """Schema for a chunk returned by the API."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    document_id: str
    chunk_index: int
    text: str
    token_count: int
    character_count: int
    page_number: Optional[int] = None
    heading: Optional[str] = None
    metadata_json: Optional[str] = None


class ChunkListResponse(BaseModel):
    """List of chunks for a document."""
    items: List[ChunkResponse]
    total: int
