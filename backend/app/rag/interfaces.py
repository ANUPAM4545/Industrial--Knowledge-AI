"""
NEXO — RAG Interfaces
Abstract base classes for the Retrieval-Augmented Generation pipeline.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional


class Retriever(ABC):
    """Abstract interface for a document retriever."""
    @abstractmethod
    async def retrieve(self, query: str, document_ids: List[str], limit: int = 5) -> List[Dict[str, Any]]:
        pass


class BaseReranker(ABC):
    """Abstract interface for a reranking model or algorithm."""
    @abstractmethod
    async def rerank(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        pass


class ConfidenceCalculator(ABC):
    """Abstract interface for calculating retrieval and generation confidence."""
    @abstractmethod
    def calculate(self, retrieved_chunks: List[Dict[str, Any]], generation_metadata: Optional[Dict[str, Any]] = None) -> float:
        pass


class CitationGenerator(ABC):
    """Abstract interface for generating and formatting citations."""
    @abstractmethod
    def generate(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass


class ContextBuilder(ABC):
    """Abstract interface for building LLM context from chunks."""
    @abstractmethod
    def build(self, chunks: List[Dict[str, Any]]) -> str:
        pass


class ReasoningEngine(ABC):
    """Abstract interface for the LLM reasoning synthesis."""
    @abstractmethod
    async def synthesize(self, query: str, context: str, conversation_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        pass
