"""
NEXO — Dashboard Data Models
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DashboardOverview(BaseModel):
    """General dashboard metric overview statistics."""
    total_documents: int
    indexed_documents: int
    pending_documents: int
    failed_documents: int
    total_chunks: int
    total_vectors: int
    total_conversations: int
    questions_today: int
    average_confidence: float
    average_latency: float
    average_retrieval_score: float


class DocumentMetadataHealth(BaseModel):
    """Metadata representing the name, uses, and status of a document."""
    document_id: str
    title: str
    references_count: int = 0
    confidence_score: float = 0.0
    file_size_bytes: int = 0
    status: str
    created_at: str


class KnowledgeHealth(BaseModel):
    """Knowledge base quality summaries."""
    most_referenced_documents: List[DocumentMetadataHealth] = Field(default_factory=list)
    least_used_documents: List[DocumentMetadataHealth] = Field(default_factory=list)
    documents_missing_metadata: List[DocumentMetadataHealth] = Field(default_factory=list)
    low_confidence_documents: List[DocumentMetadataHealth] = Field(default_factory=list)
    failed_processing_jobs: List[DocumentMetadataHealth] = Field(default_factory=list)
    largest_documents: List[DocumentMetadataHealth] = Field(default_factory=list)
    newest_documents: List[DocumentMetadataHealth] = Field(default_factory=list)


class QueryMetric(BaseModel):
    """A single search query frequency count."""
    query_text: str
    frequency: int


class KeywordMetric(BaseModel):
    """Keyword frequency count."""
    keyword: str
    count: int


class SearchAnalytics(BaseModel):
    """Statistics about user searches and retrieval metrics."""
    most_frequent_queries: List[QueryMetric] = Field(default_factory=list)
    top_keywords: List[KeywordMetric] = Field(default_factory=list)
    average_query_length: float
    retrieval_success_rate: float
    average_similarity: float
    average_citation_count: float


class SystemHealth(BaseModel):
    """Status details of AI providers and components."""
    embedding_provider: str
    llm_provider: str
    vector_store: str
    retriever: str
    evaluation_framework: str
    overall_system_health: str


class TrendDatapoint(BaseModel):
    """A time-series trends value."""
    date: str
    value: float


class DashboardTrends(BaseModel):
    """Historical data series for charting."""
    daily_uploads: List[TrendDatapoint] = Field(default_factory=list)
    daily_queries: List[TrendDatapoint] = Field(default_factory=list)
    confidence_trend: List[TrendDatapoint] = Field(default_factory=list)
    latency_trend: List[TrendDatapoint] = Field(default_factory=list)
    document_growth: List[TrendDatapoint] = Field(default_factory=list)
    vector_growth: List[TrendDatapoint] = Field(default_factory=list)


class SmartInsight(BaseModel):
    """A computed telemetry indicator warning or notification."""
    text: str
    type: str = "info"  # info, success, warning, alert
    timestamp: str
