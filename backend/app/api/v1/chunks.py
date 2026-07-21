"""
NEXO — Chunks API
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession
from app.chunking.models import ChunkProcessingSummary, ParsedDocument
from app.chunking.strategy_factory import ChunkingStrategyType
from app.models.document import Document
from app.schemas.chunk import ChunkListResponse, ChunkResponse
from app.services.chunk_service import ChunkService

router = APIRouter()


class ChunkRequest(BaseModel):
    strategy: ChunkingStrategyType = ChunkingStrategyType.RECURSIVE
    chunk_size: int = 1000
    chunk_overlap: int = 200


@router.post("/{document_id}/chunk", response_model=ChunkProcessingSummary)
async def create_chunks(
    document_id: str,
    request: ChunkRequest,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Generate semantic chunks for a given document.
    """
    # Fetch the document
    stmt = select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or you don't have access"
        )
        
    # For Milestone 3B, simulate parsing by loading text
    # In a real pipeline, this would come from the Extraction service (Milestone 3A)
    # We will use the document description or a dummy text if empty.
    doc_text = document.description if document.description else f"Dummy text for {document.title}. " * 50
    
    parsed_doc = ParsedDocument(
        document_id=document.id,
        title=document.title,
        full_text=doc_text,
    )
    
    summary = await ChunkService.process_document(
        db=db,
        document=parsed_doc,
        strategy_type=request.strategy,
        chunk_size=request.chunk_size,
        chunk_overlap=request.chunk_overlap,
    )
    
    # Update document status
    document.chunk_count = summary.total_chunks
    await db.commit()
    
    return summary


@router.get("/{document_id}/chunks", response_model=ChunkListResponse)
async def get_chunks(
    document_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Retrieve all chunks for a document.
    """
    # Verify access
    stmt = select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Document not found")
        
    chunks = await ChunkService.get_document_chunks(db, document_id)
    
    return ChunkListResponse(
        items=[ChunkResponse.model_validate(c) for c in chunks],
        total=len(chunks)
    )


@router.get("/{document_id}/chunk-summary", response_model=ChunkProcessingSummary)
async def get_chunk_summary(
    document_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Retrieve chunking summary statistics.
    """
    # Verify access
    stmt = select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Document not found")
        
    return await ChunkService.get_document_chunk_summary(db, document_id)
