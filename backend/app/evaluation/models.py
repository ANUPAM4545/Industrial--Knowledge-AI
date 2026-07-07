"""
NEXO — Evaluation Models
"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class EvaluationResult(BaseModel):
    """Data model capturing quality evaluation for a single retrieval/generation run."""
    query: str
    conversation_id: Optional[str] = None
    retrieval_score: float = Field(..., description="Score reflecting retrieval quality (0-1.0)")
    citation_score: float = Field(..., description="Score reflecting citation correctness/coverage (0-1.0)")
    confidence_score: float = Field(..., description="Calculated overall confidence score (0-100)")
    hallucination_risk: str = Field(..., description="Hallucination risk level: LOW, MEDIUM, HIGH")
    chunk_count: int
    top_similarity: float
    average_similarity: float
    response_length: int
    latency_ms: float
    provider: str
    model: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
