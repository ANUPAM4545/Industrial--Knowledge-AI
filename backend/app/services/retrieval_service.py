"""
ForgeMind AI — Retrieval Orchestration Service
"""
import time
from typing import Any, Dict, List, Optional

from app.ai.registry import registry
from app.retrieval.query_rewriter import QueryRewriter
from app.retrieval.hybrid_retriever import HybridRetriever
from app.retrieval.retrieval_result import RetrievalResult, RetrievalProfiler


class RetrievalService:
    """Orchestrates query rewriting, hybrid retrieval, and reranking with telemetry profiling."""

    def __init__(
        self,
        query_rewriter: Optional[QueryRewriter] = None,
        hybrid_retriever: Optional[HybridRetriever] = None
    ):
        self.query_rewriter = query_rewriter or QueryRewriter()
        self.hybrid_retriever = hybrid_retriever or HybridRetriever()

    async def search(
        self,
        query: str,
        limit: int = 5,
        filter_dict: Optional[Dict[str, Any]] = None,
        chat_history: Optional[List[Any]] = None,
        rerank: bool = True
    ) -> RetrievalResult:
        """
        Orchestrate the hybrid search pipeline:
        1. Rewrite query if chat history exists (resolves pronouns, expands).
        2. Perform parallel Vector + Keyword (BM25) search.
        3. Merge candidates using RRF / min-max normalization.
        4. Re-rank retrieved candidates.
        5. Record profiling telemetry diagnostics.
        """
        t_total_start = time.time()
        
        # 1. Rewrite Query
        rewritten_query = await self.query_rewriter.rewrite(query, chat_history)
        
        # 2. Hybrid Retrieve
        result = await self.hybrid_retriever.retrieve_with_diagnostics(
            query=rewritten_query,
            limit=limit,
            filter_dict=filter_dict
        )
        
        # 3. Rerank
        reranker_name = "None"
        if rerank:
            try:
                reranker = registry.get_reranker()
                reranker_name = reranker.__class__.__name__
                
                t_rerank_start = time.time()
                reranked_chunks = await reranker.rerank(
                    query=rewritten_query,
                    documents=result.chunks,
                    top_k=limit
                )
                rerank_latency = (time.time() - t_rerank_start) * 1000
                result.diagnostics.rerank_time_ms = rerank_latency
                result.chunks = reranked_chunks
            except Exception as e:
                print(f"[RetrievalService] Reranking failed: {e}")
                
        # Update overall latency
        result.diagnostics.total_latency_ms = (time.time() - t_total_start) * 1000
        
        # 4. Profile Log
        RetrievalProfiler.log_profile(
            query=query,
            result=result,
            retriever_name="HybridRetriever",
            reranker_name=reranker_name
        )
        
        return result
