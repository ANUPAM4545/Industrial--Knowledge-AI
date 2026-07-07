"""
NEXO — Hybrid Retriever
"""
import asyncio
import time
from typing import Any, Dict, List, Optional

from app.ai.interfaces import Retriever
from app.retrieval.keyword_retriever import KeywordRetriever
from app.retrieval.merge_strategy import MergeStrategy, ReciprocalRankFusion
from app.retrieval.retrieval_result import RetrievalDiagnostics, RetrievalResult
from app.retrieval.vector_retriever import VectorRetriever


class HybridRetriever(Retriever):
    """
    Combines Vector Search and Keyword Search using a MergeStrategy.
    """
    
    def __init__(
        self, 
        vector_retriever: Optional[VectorRetriever] = None,
        keyword_retriever: Optional[KeywordRetriever] = None,
        merge_strategy: Optional[MergeStrategy] = None
    ):
        self.vector_retriever = vector_retriever or VectorRetriever()
        self.keyword_retriever = keyword_retriever or KeywordRetriever()
        self.merge_strategy = merge_strategy or ReciprocalRankFusion()

    async def retrieve(
        self, 
        query: str, 
        limit: int = 5, 
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve using both vector and keyword, then merge."""
        # This method satisfies the Retriever interface but doesn't expose diagnostics.
        # Use retrieve_with_diagnostics for full telemetry.
        result = await self.retrieve_with_diagnostics(query, limit, filter_dict)
        return result.chunks
        
    async def retrieve_with_diagnostics(
        self,
        query: str,
        limit: int = 5,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> RetrievalResult:
        """Hybrid retrieval with full diagnostics metrics."""
        diagnostics = RetrievalDiagnostics()
        
        from app.retrieval.retrieval_result import retrieval_timings
        
        timings = {
            "embedding_time_ms": 0.0,
            "vector_search_time_ms": 0.0,
            "keyword_search_time_ms": 0.0,
            "merge_time_ms": 0.0
        }
        token = retrieval_timings.set(timings)
        
        t0 = time.time()
        try:
            # Parallel execution of both retrievers
            vector_task = self.vector_retriever.retrieve(query, limit=limit*2, filter_dict=filter_dict)
            keyword_task = self.keyword_retriever.retrieve(query, limit=limit*2, filter_dict=filter_dict)
            
            vector_results, keyword_results = await asyncio.gather(vector_task, keyword_task)
            
            # Merge
            t_merge_start = time.time()
            merged_results = self.merge_strategy.merge([vector_results, keyword_results], top_k=limit)
            timings["merge_time_ms"] = (time.time() - t_merge_start) * 1000
        finally:
            retrieval_timings.reset(token)
            
        diagnostics.embedding_time_ms = timings["embedding_time_ms"]
        diagnostics.vector_search_time_ms = timings["vector_search_time_ms"]
        diagnostics.keyword_search_time_ms = timings["keyword_search_time_ms"]
        diagnostics.merge_time_ms = timings["merge_time_ms"]
        diagnostics.vector_results_count = len(vector_results)
        diagnostics.keyword_results_count = len(keyword_results)
        
        diagnostics.chunks_retrieved = len(merged_results)
        if merged_results:
            # If RRF is used, top score is RRF score. Let's populate the diagnostics fields.
            diagnostics.top_similarity = merged_results[0].get("score", 0.0)
            
        diagnostics.total_latency_ms = (time.time() - t0) * 1000
        
        return RetrievalResult(chunks=merged_results, diagnostics=diagnostics)

    async def health_check(self) -> Dict[str, Any]:
        """Health check for underlying retrievers."""
        v_health = await self.vector_retriever.health_check()
        k_health = await self.keyword_retriever.health_check()
        
        return {
            "status": "ok" if v_health["status"] == "ok" and k_health["status"] == "ok" else "error",
            "provider": "HybridRetriever",
            "vector_health": v_health,
            "keyword_health": k_health
        }
