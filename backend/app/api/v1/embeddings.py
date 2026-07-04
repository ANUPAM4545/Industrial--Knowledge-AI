"""
ForgeMind AI — Embeddings Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import CurrentUser, DBSession
from app.models.document import Document
from app.services.embedding_service import EmbeddingService


router = APIRouter()


@router.post("/{document_id}/index", status_code=status.HTTP_200_OK)
async def index_document(
    document_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Generate and index embeddings for a document's chunks.
    """
    # Verify access
    stmt = select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Document not found or access denied")
        
    try:
        return await EmbeddingService.index_document(db, document_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {e}")


@router.post("/index-all", status_code=status.HTTP_200_OK)
async def index_all_documents(
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Trigger indexing for all READY documents that haven't been indexed.
    """
    raise NotImplementedError("Batch indexing all documents is not yet implemented.")


@router.get("/{document_id}/index-status", status_code=status.HTTP_200_OK)
async def get_index_status(
    document_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Retrieve indexing status of a document.
    """
    # Verify access
    stmt = select(Document).where(Document.id == document_id, Document.owner_id == current_user.id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Document not found")
        
    try:
        return await EmbeddingService.get_index_status(db, document_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
