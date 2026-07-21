"""
NEXO — Observability Data Models
"""
from typing import Optional
from pydantic import BaseModel


class PipelineDiagnostics(BaseModel):
    """Encapsulates latency profiles and evaluation indicators for a single run."""
    conversation_id: Optional[str] = None
    query: str
    embedding_provider: str
    embedding_model: str
    llm_provider: str
    llm_model: str
    
    # Latencies
    embedding_time_ms: float = 0.0
    vector_search_time_ms: float = 0.0
    keyword_search_time_ms: float = 0.0
    merge_time_ms: float = 0.0
    rerank_time_ms: float = 0.0
    context_build_time_ms: float = 0.0
    prompt_build_time_ms: float = 0.0
    generation_time_ms: float = 0.0
    total_latency_ms: float = 0.0
    
    # RAG Chunks Details
    retrieved_chunks: int = 0
    merged_chunks: int = 0
    reranked_chunks: int = 0
    top_similarity: float = 0.0
    average_similarity: float = 0.0
    
    # Quality Scores
    confidence_score: float = 0.0
    hallucination_risk: str = "LOW"
    citations_count: int = 0
    documents_used: int = 0
    token_estimate: int = 0
    provider_status: str = "Healthy"


class AIProviderInfo(BaseModel):
    """Contains configured LLM/embedding details."""
    provider_name: str
    model_name: str
    status: str
    latency_profile_ms: float


class AIHealthStatus(BaseModel):
    """Represent the overall status (Healthy, Unavailable, Degraded) of AI layers."""
    embedding_status: str
    vector_store_status: str
    retriever_status: str
    llm_status: str
    evaluation_status: str
    overall_status: str


class SystemRuntimeMetrics(BaseModel):
    """Aggregated telemetry indices for system dashboards."""
    average_latency_ms: float
    p95_latency_ms: float
    average_confidence: float
    average_retrieval_score: float
    average_citations: float
    queries_today: int
    documents_indexed: int
    vectors_stored: int
