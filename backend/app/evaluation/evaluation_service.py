"""
ForgeMind AI — Evaluation Service Orchestrator
"""
from typing import Any, Dict, List, Optional
from app.evaluation.interfaces import (
    RetrievalEvaluator,
    CitationValidator,
    ConfidenceCalculator,
    ResponseMetricsCalculator,
    HallucinationDetector,
    EvaluationRepository
)
from app.evaluation.models import EvaluationResult
from app.evaluation.retrieval_evaluator import SimpleRetrievalEvaluator
from app.evaluation.citation_validator import RegexCitationValidator
from app.evaluation.confidence_calculator import WeightedConfidenceCalculator
from app.evaluation.response_metrics import SimpleResponseMetricsCalculator
from app.evaluation.logger import evaluation_db


class PlaceholderHallucinationDetector(HallucinationDetector):
    """
    Placeholder implementation of HallucinationDetector using heuristic triggers.
    In future milestones, this can be extended to use NLI models or LLM-as-a-judge.
    """
    def __init__(self, similarity_low_threshold: float = 0.55):
        self.similarity_low_threshold = similarity_low_threshold

    def detect(
        self,
        response_text: str,
        chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> str:
        # Heuristic 1: If there are citations that failed validation, hallucination risk is HIGH
        invalid_citations = [c for c in citations if not c.get("is_valid", False)]
        if invalid_citations:
            return "HIGH"

        # Heuristic 2: If we have retrieved chunks, but average similarity is extremely low
        if chunks:
            scores = [float(c.get("score", 0.0)) for c in chunks]
            avg_score = sum(scores) / len(scores)
            if avg_score < self.similarity_low_threshold:
                return "MEDIUM"

        # Heuristic 3: Extremely long responses (e.g. >800 chars) with zero citations when context is loaded
        if len(response_text) > 800 and not citations and chunks:
            return "MEDIUM"

        return "LOW"


class EvaluationService:
    """
    Orchestrates the quality evaluation pipeline post-generation.
    """
    def __init__(
        self,
        retrieval_evaluator: Optional[RetrievalEvaluator] = None,
        citation_validator: Optional[CitationValidator] = None,
        confidence_calculator: Optional[ConfidenceCalculator] = None,
        response_metrics: Optional[ResponseMetricsCalculator] = None,
        hallucination_detector: Optional[HallucinationDetector] = None,
        repository: Optional[EvaluationRepository] = None
    ):
        self.retrieval_evaluator = retrieval_evaluator or SimpleRetrievalEvaluator()
        self.citation_validator = citation_validator or RegexCitationValidator()
        self.confidence_calculator = confidence_calculator or WeightedConfidenceCalculator()
        self.response_metrics = response_metrics or SimpleResponseMetricsCalculator()
        self.hallucination_detector = hallucination_detector or PlaceholderHallucinationDetector()
        self.repository = repository or evaluation_db

    async def evaluate_run(
        self,
        query: str,
        response_text: str,
        chunks: List[Dict[str, Any]],
        latency_ms: float,
        conversation_id: Optional[str] = None,
        provider: str = "Unknown",
        model: str = "Unknown"
    ) -> EvaluationResult:
        """Runs evaluation over the RAG pipeline results."""
        # 1. Evaluate Retrieval
        ret_metrics = self.retrieval_evaluator.evaluate(chunks)
        
        # 2. Validate Citations
        cite_metrics = self.citation_validator.validate(response_text, chunks)
        
        # 3. Detect Hallucination Risk
        hallucination_risk = self.hallucination_detector.detect(
            response_text, chunks, cite_metrics["citations"]
        )
        
        # 4. Generate Response Metrics
        resp_metrics = self.response_metrics.calculate(
            response_text, chunks, cite_metrics["citations"]
        )
        
        # 5. Calculate Confidence Score
        conf_score = self.confidence_calculator.calculate(
            avg_similarity=ret_metrics["average_similarity"],
            citation_score=cite_metrics["citation_score"],
            completeness=ret_metrics["completeness"],
            response_length=resp_metrics["response_length"]
        )
        
        # Adjust confidence score based on hallucination risk penalties
        if hallucination_risk == "HIGH":
            conf_score = max(0.0, conf_score - 30.0)
        elif hallucination_risk == "MEDIUM":
            conf_score = max(0.0, conf_score - 15.0)

        # 6. Build Result Model
        result = EvaluationResult(
            query=query,
            conversation_id=conversation_id,
            retrieval_score=ret_metrics["average_similarity"],
            citation_score=cite_metrics["citation_score"],
            confidence_score=round(conf_score, 1),
            hallucination_risk=hallucination_risk,
            chunk_count=ret_metrics["chunk_count"],
            top_similarity=ret_metrics["max_similarity"],
            average_similarity=ret_metrics["average_similarity"],
            response_length=resp_metrics["response_length"],
            latency_ms=latency_ms,
            provider=provider,
            model=model
        )
        
        # 7. Persist to repository
        self.repository.save(result)
        
        return result
