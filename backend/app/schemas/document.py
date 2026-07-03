"""
ForgeMind AI — Document Schemas (Pydantic v2)
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    description: Optional[str] = None
    original_filename: str
    file_size: int
    mime_type: str
    document_type: str
    status: str
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None
    tags: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    is_ocr_processed: bool
    language: str
    owner_id: str
    created_at: datetime
    updated_at: datetime


class DocumentListResponse(BaseModel):
    items: List[DocumentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
