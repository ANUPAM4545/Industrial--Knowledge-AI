"""
ForgeMind AI — Keyword Retriever
"""
from typing import Any, Dict, List, Optional
import time

from app.ai.interfaces import Retriever
from app.ai.registry import registry
from app.core.config import settings


class KeywordRetriever(Retriever):
    """
    Retriever implementation utilizing the KeywordSearchProvider
    to perform BM25 / Keyword search.
    """
    def __init__(self, collection_name: Optional[str] = None):
        self.collection_name = collection_name or getattr(settings, "QDRANT_COLLECTION", "forgemind")

    async def retrieve(
        self, 
        query: str, 
        limit: int = 5, 
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve using keyword search."""
        
        provider = registry.get_keyword_provider()
        
        timings = None
        try:
            from app.retrieval.retrieval_result import retrieval_timings
            timings = retrieval_timings.get()
        except Exception:
            pass
            
        t_search_start = time.time()
        results = await provider.search(
            collection_name=self.collection_name,
            query=query,
            limit=limit,
            filter_dict=filter_dict
        )
        if timings is not None:
            timings["keyword_search_time_ms"] = timings.get("keyword_search_time_ms", 0.0) + (time.time() - t_search_start) * 1000
        
        formatted_results = []
        for payload, score in results:
            formatted_results.append({
                "score": float(score),
                "document_id": payload.get("document_id"),
                "chunk_index": payload.get("chunk_index"),
                "text": payload.get("text"),
                "page_number": payload.get("page_number"),
                "heading": payload.get("heading")
            })
            
        return formatted_results

    async def health_check(self) -> Dict[str, Any]:
        """Health check for Keyword provider."""
        return {"status": "ok", "provider": "KeywordRetriever"}
