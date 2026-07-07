"""
ForgeMind AI — Vector Retriever
"""
from typing import Any, Dict, List, Optional
import time

from app.ai.interfaces import Retriever
from app.ai.registry import registry
from app.core.config import settings


class VectorRetriever(Retriever):
    """
    Retriever implementation utilizing the EmbeddingProvider and VectorStore
    to perform semantic vector search.
    """
    def __init__(self, collection_name: Optional[str] = None):
        self.collection_name = collection_name or settings.QDRANT_COLLECTION

    async def retrieve(
        self, 
        query: str, 
        limit: int = 5, 
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve using vector search."""
        
        embedder = registry.get_embedding_provider()
        vector_store = registry.get_vector_store()
        
        timings = None
        try:
            from app.retrieval.retrieval_result import retrieval_timings
            timings = retrieval_timings.get()
        except Exception:
            pass
            
        t_embed_start = time.time()
        query_vector = await embedder.embed_text(query)
        if timings is not None:
            timings["embedding_time_ms"] = timings.get("embedding_time_ms", 0.0) + (time.time() - t_embed_start) * 1000
            
        t_search_start = time.time()
        results = await vector_store.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            filter_dict=filter_dict
        )
        if timings is not None:
            timings["vector_search_time_ms"] = timings.get("vector_search_time_ms", 0.0) + (time.time() - t_search_start) * 1000
        
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
        """Health check for Vector store and embedder."""
        return {"status": "ok", "provider": "VectorRetriever"}
