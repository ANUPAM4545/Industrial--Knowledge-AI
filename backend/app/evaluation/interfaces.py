"""
NEXO — Evaluation Interfaces
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from app.evaluation.models import EvaluationResult


class RetrievalEvaluator(ABC):
    @abstractmethod
    def evaluate(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Evaluate similarity, duplicates, and completeness in retrieved chunks."""
        pass


class CitationValidator(ABC):
    @abstractmethod
    def validate(self, response_text: str, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse, validate, and flag duplicate/missing citations in response text."""
        pass


class ConfidenceCalculator(ABC):
    @abstractmethod
    def calculate(
        self,
        avg_similarity: float,
        citation_score: float,
        completeness: float,
        response_length: int
    ) -> float:
        """Combine retrieval metrics and citation score to output a 0-100 confidence score."""
        pass


class ResponseMetricsCalculator(ABC):
    @abstractmethod
    def calculate(
        self,
        response_text: str,
        chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Expose basic metrics such as length, token estimations, and documents referenced."""
        pass


class HallucinationDetector(ABC):
    @abstractmethod
    def detect(
        self,
        response_text: str,
        chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> str:
        """Assess hallucination risk level (LOW, MEDIUM, HIGH) using heuristics."""
        pass


class EvaluationRepository(ABC):
    @abstractmethod
    def save(self, result: EvaluationResult) -> None:
        """Persist evaluation results."""
        pass

    @abstractmethod
    def get_latest(self) -> Optional[EvaluationResult]:
        """Fetch the most recent evaluation result."""
        pass

    @abstractmethod
    def get_by_conversation(self, conversation_id: str) -> List[EvaluationResult]:
        """Fetch historical evaluation results for a specific conversation."""
        pass

    @abstractmethod
    def get_system_stats(self) -> Dict[str, Any]:
        """Aggregate quality metrics (averages, count frequencies) for system analytics."""
        pass
