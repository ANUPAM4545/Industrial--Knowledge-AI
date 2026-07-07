"""
NEXO — Vector Search Endpoints
GET /search — Semantic similarity search
"""
from typing import List, Optional
from fastapi import APIRouter, Query, status

router = APIRouter()


@router.get("/", status_code=status.HTTP_200_OK)
async def vector_search(
    q: str = Query(..., min_length=1),
    document_ids: Optional[str] = Query(None),
    top_k: int = Query(5, ge=1, le=50),
    score_threshold: float = Query(0.7, ge=0.0, le=1.0),
):
    """
    Pure vector similarity search using Qdrant.
    Does NOT include LLM generation — returns raw ranked chunks.
    TODO: Embed query → search Qdrant → return ranked results.
    """
    raise NotImplementedError("Vector search not yet implemented")
