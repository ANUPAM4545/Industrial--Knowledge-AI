"""
ForgeMind AI — Semantic Search Endpoints
"""
from fastapi import APIRouter, Query, status

router = APIRouter()

from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from app.services.similarity_service import SimilaritySearchService


class SearchRequest(BaseModel):
    query: str
    limit: int = 5
    document_id: Optional[str] = None
    collection_name: Optional[str] = None


@router.post("/similarity", status_code=status.HTTP_200_OK)
async def semantic_search(request: SearchRequest):
    """
    Perform semantic similarity search across the vector store.
    """
    results = await SimilaritySearchService.search(
        query=request.query,
        limit=request.limit,
        document_id=request.document_id,
        collection_name=request.collection_name
    )
    
    return {"results": results, "total": len(results)}
