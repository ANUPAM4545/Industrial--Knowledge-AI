"""
NEXO — Chunking Domain Models
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ParsedSection(BaseModel):
    """A section of text under a specific heading."""
    heading: str
    text: str
    level: int = 1


class ParsedPage(BaseModel):
    """Content belonging to a specific page."""
    page_number: int
    text: str


class ParsedDocument(BaseModel):
    """In-memory representation of a parsed document ready for chunking."""
    document_id: str
    title: str
    full_text: str
    pages: List[ParsedPage] = Field(default_factory=list)
    sections: List[ParsedSection] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ChunkMetadata(BaseModel):
    """Enriched metadata for a semantic chunk."""
    document_title: str
    page_number: Optional[int] = None
    section_heading: Optional[str] = None
    chunk_number: int
    token_count: int
    character_count: int
    estimated_reading_time_seconds: int


class SemanticChunk(BaseModel):
    """Domain representation of a created semantic chunk."""
    document_id: str
    chunk_index: int
    text: str
    metadata: ChunkMetadata
    
    @property
    def token_count(self) -> int:
        return self.metadata.token_count

    @property
    def character_count(self) -> int:
        return self.metadata.character_count


class ChunkProcessingSummary(BaseModel):
    """Summary of chunking process."""
    document_id: str
    total_chunks: int
    average_chunk_size_chars: int
    largest_chunk_chars: int
    smallest_chunk_chars: int
    average_overlap_chars: int
    estimated_embedding_cost_usd: float
