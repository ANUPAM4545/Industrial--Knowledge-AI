"""
NEXO — Retrieval Data Models
"""
from typing import Any, Dict, List
import contextvars
from pydantic import BaseModel, Field

# ContextVar to track latencies for sub-operations without modifying interface signatures
retrieval_timings: contextvars.ContextVar[Dict[str, float]] = contextvars.ContextVar(
    "retrieval_timings", default=None
)


class RetrievalDiagnostics(BaseModel):
    """Diagnostics for a single retrieval request."""
    embedding_time_ms: float = 0.0
    vector_search_time_ms: float = 0.0
    keyword_search_time_ms: float = 0.0
    merge_time_ms: float = 0.0
    rerank_time_ms: float = 0.0
    total_latency_ms: float = 0.0
    chunks_retrieved: int = 0
    top_similarity: float = 0.0
    
    # Track origin of results
    vector_results_count: int = 0
    keyword_results_count: int = 0


class RetrievalResult(BaseModel):
    """The final result of a retrieval operation."""
    chunks: List[Dict[str, Any]] = Field(default_factory=list)
    diagnostics: RetrievalDiagnostics = Field(default_factory=RetrievalDiagnostics)


class RetrievalProfiler:
    """Bonus: Captures and logs retrieval metrics for developer mode."""
    
    _history: List[Dict[str, Any]] = []
    _max_history: int = 50
    
    @classmethod
    def log_profile(
        cls,
        query: str, 
        result: RetrievalResult, 
        retriever_name: str = "HybridRetriever",
        reranker_name: str = "None"
    ) -> None:
        """Log the profile to stdout or a time-series DB and keep in memory history."""
        profile_data = {
            "query": query,
            "retriever": retriever_name,
            "reranker": reranker_name,
            "latency_ms": result.diagnostics.total_latency_ms,
            "chunk_count": result.diagnostics.chunks_retrieved,
            "top_score": result.diagnostics.top_similarity,
            "vector_count": result.diagnostics.vector_results_count,
            "keyword_count": result.diagnostics.keyword_results_count,
            "embedding_time_ms": result.diagnostics.embedding_time_ms,
            "vector_search_time_ms": result.diagnostics.vector_search_time_ms,
            "keyword_search_time_ms": result.diagnostics.keyword_search_time_ms,
            "merge_time_ms": result.diagnostics.merge_time_ms,
            "rerank_time_ms": result.diagnostics.rerank_time_ms,
        }
        cls._history.append(profile_data)
        if len(cls._history) > cls._max_history:
            cls._history.pop(0)
            
        print(f"[Retrieval Profiler] {profile_data}")

    @classmethod
    def get_history(cls) -> List[Dict[str, Any]]:
        """Return list of historical query profiles."""
        return cls._history.copy()

