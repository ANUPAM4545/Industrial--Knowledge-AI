"""
NEXO — Semantic Search Endpoints
"""
from fastapi import APIRouter, status, Depends
from app.security.rate_limit.decorators import rate_limit
from app.security.rate_limit.models import LimitType

from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from app.services.similarity_service import SimilaritySearchService
from app.services.retrieval_service import RetrievalService
from app.retrieval.retrieval_result import RetrievalProfiler, RetrievalResult
from app.chat.models import Message, Role

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    limit: int = 5
    document_id: Optional[str] = None
    collection_name: Optional[str] = None


class ChatMessage(BaseModel):
    role: str
    content: str


class HybridSearchRequest(BaseModel):
    query: str
    limit: int = 5
    filter_dict: Optional[Dict[str, Any]] = None
    chat_history: Optional[List[ChatMessage]] = None
    rerank: bool = True


class RewriteRequest(BaseModel):
    query: str
    chat_history: Optional[List[ChatMessage]] = None


@router.post("/similarity", status_code=status.HTTP_200_OK, dependencies=[Depends(rate_limit(LimitType.SEARCH))])
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


@router.post("/hybrid", status_code=status.HTTP_200_OK, response_model=RetrievalResult, dependencies=[Depends(rate_limit(LimitType.SEARCH))])
async def hybrid_search(request: HybridSearchRequest):
    """
    Perform hybrid retrieval (vector + BM25 keyword search) with RRF/normalization,
    rerank, and diagnostics profiling.
    """
    history = None
    if request.chat_history:
        history = [
            Message(role=Role(msg.role), content=msg.content)
            for msg in request.chat_history
        ]
        
    retrieval_service = RetrievalService()
    try:
        result = await retrieval_service.search(
            query=request.query,
            limit=request.limit,
            filter_dict=request.filter_dict,
            chat_history=history,
            rerank=request.rerank
        )
        return result
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hybrid search failed: {str(e)}"
        )


@router.post("/rewrite", status_code=status.HTTP_200_OK, dependencies=[Depends(rate_limit(LimitType.SEARCH))])
async def rewrite_query(request: RewriteRequest):
    """
    Formulate and expand a search query using conversation history.
    """
    history = None
    if request.chat_history:
        history = [
            Message(role=Role(msg.role), content=msg.content)
            for msg in request.chat_history
        ]
        
    retrieval_service = RetrievalService()
    try:
        rewritten = await retrieval_service.query_rewriter.rewrite(
            query=request.query,
            chat_history=history
        )
        return {"original_query": request.query, "rewritten_query": rewritten}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Query rewrite failed: {str(e)}"
        )


@router.get("/diagnostics", status_code=status.HTTP_200_OK)
async def get_retrieval_diagnostics():
    """
    Retrieve historical search profiles and performance logs.
    """
    history = RetrievalProfiler.get_history()
    return {
        "profiles": history,
        "total_profiles": len(history),
        "active_retriever": "HybridRetriever"
    }

