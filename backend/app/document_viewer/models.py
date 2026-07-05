from pydantic import BaseModel, Field
from typing import List, Optional


class DocumentViewerInfo(BaseModel):
    """General document viewer information."""
    document_id: str
    title: str
    mime_type: str
    total_pages: int
    status: str
    file_size: int


class DocumentHighlight(BaseModel):
    """Metadata representing a specific citation match on a page."""
    text: str = Field(..., description="The matching citation context paragraph text")
    start_offset: int = Field(..., description="Index offset starting index")
    end_offset: int = Field(..., description="Index offset ending index")
    chunk_id: Optional[str] = Field(None, description="The matched chunk identifier")
    similarity: float = Field(0.0, description="Similarity matching score")
    confidence: float = Field(0.0, description="Evaluated confidence percentage score")
    retrieval_method: str = Field("hybrid", description="Retrieval method used: vector, keyword, or hybrid")


class DocumentPageData(BaseModel):
    """Page text content along with highlight spans."""
    page_number: int
    text_content: str
    highlights: List[DocumentHighlight] = []


class DocumentSearchMatch(BaseModel):
    """Result matching inline document searches."""
    page_number: int
    snippet: str
    text_match: str
