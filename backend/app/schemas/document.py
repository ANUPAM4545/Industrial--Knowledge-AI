"""
NEXO — Document Schemas (Pydantic v2)

Extends the scaffold schemas with:
- Upload request validation
- Download response metadata
- Status-only response for the status endpoint
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.document import DocumentStatus, DocumentType


class DocumentResponse(BaseModel):
    """Full document representation returned by the API."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    original_filename: str
    file_size: int
    mime_type: str
    document_type: DocumentType
    status: DocumentStatus
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    processing_error: Optional[str] = None
    tags: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    is_ocr_processed: bool
    language: str
    owner_id: str
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    """Paginated list of documents."""
    items: List[DocumentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DocumentStatusResponse(BaseModel):
    """Lightweight status-only response."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: DocumentStatus
    processing_error: Optional[str] = None
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    updated_at: datetime


class DocumentDownloadMeta(BaseModel):
    """Metadata returned before streaming a download (not the file itself)."""
    document_id: str
    original_filename: str
    mime_type: str
    file_size: int
