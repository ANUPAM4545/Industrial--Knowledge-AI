"""
ForgeMind AI — Evaluation Logger and Memory Repository
"""
import logging
from typing import Any, Dict, List, Optional
from app.evaluation.interfaces import EvaluationRepository
from app.evaluation.models import EvaluationResult

logger = logging.getLogger("ForgeMind.Evaluation")
logger.setLevel(logging.INFO)


class EvaluationLogger:
    """Logs quality evaluations to standard logger output."""
    
    @staticmethod
    def log_evaluation(result: EvaluationResult) -> None:
        logger.info(
            "[Evaluation Log] Query: '%s' | Confidence: %.1f | Hallucination Risk: %s | "
            "Retrieval Score: %.2f | Citation Score: %.2f | Latency: %.1fms | Provider: %s (%s)",
            result.query,
            result.confidence_score,
            result.hallucination_risk,
            result.retrieval_score,
            result.citation_score,
            result.latency_ms,
            result.provider,
            result.model
        )


class InMemoryEvaluationRepository(EvaluationRepository):
    """
    Transient, in-memory repository store for quality evaluation records.
    In production, this would write to a PostgreSQL table or Time-series DB.
    """
    def __init__(self):
        self._records: List[EvaluationResult] = []

    def save(self, result: EvaluationResult) -> None:
        self._records.append(result)
        EvaluationLogger.log_evaluation(result)

    def get_latest(self) -> Optional[EvaluationResult]:
        if not self._records:
            return None
        return self._records[-1]

    def get_by_conversation(self, conversation_id: str) -> List[EvaluationResult]:
        return [r for r in self._records if r.conversation_id == conversation_id]

    def get_system_stats(self) -> Dict[str, Any]:
        if not self._records:
            return {
                "total_runs": 0,
                "average_confidence": 0.0,
                "average_retrieval_score": 0.0,
                "average_citation_score": 0.0,
                "average_latency_ms": 0.0,
                "hallucination_risk_counts": {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
            }

        total_runs = len(self._records)
        avg_conf = sum(r.confidence_score for r in self._records) / total_runs
        avg_ret = sum(r.retrieval_score for r in self._records) / total_runs
        avg_cite = sum(r.citation_score for r in self._records) / total_runs
        avg_lat = sum(r.latency_ms for r in self._records) / total_runs
        
        counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
        for r in self._records:
            risk = r.hallucination_risk.upper()
            if risk in counts:
                counts[risk] += 1
            else:
                counts["LOW"] += 1  # Fallback
                
        return {
            "total_runs": total_runs,
            "average_confidence": avg_conf,
            "average_retrieval_score": avg_ret,
            "average_citation_score": avg_cite,
            "average_latency_ms": avg_lat,
            "hallucination_risk_counts": counts
        }


# Global singleton instance for Developer Mode
evaluation_db = InMemoryEvaluationRepository()
