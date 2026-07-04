"""
ForgeMind AI — AI Component Interfaces
Abstract base classes for AI components following Dependency Inversion Principle.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Tuple


# ─── Embedding Provider ──────────────────────────────────────────────────────
class EmbeddingProvider(ABC):
    """Interface for embedding models."""
    
    @abstractmethod
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single string."""
        pass
        
    @abstractmethod
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of strings."""
        pass
        
    @abstractmethod
    def dimension(self) -> int:
        """Return the vector dimension size."""
        pass
        
    @abstractmethod
    def model_name(self) -> str:
        """Return the model name."""
        pass
        
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check if provider is available."""
        pass


# ─── Vector Store ────────────────────────────────────────────────────────────
class VectorStore(ABC):
    """Interface for vector databases."""
    
    @abstractmethod
    async def create_collection(self, collection_name: str, dimension: int) -> None:
        """Create a new collection if it doesn't exist."""
        pass
        
    @abstractmethod
    async def delete_collection(self, collection_name: str) -> None:
        """Delete an entire collection."""
        pass
        
    @abstractmethod
    async def upsert(self, collection_name: str, ids: List[str], vectors: List[List[float]], payloads: List[Dict[str, Any]]) -> None:
        """Upsert vectors with metadata."""
        pass
        
    @abstractmethod
    async def search(self, collection_name: str, query_vector: List[float], limit: int = 5, filter_dict: Optional[Dict[str, Any]] = None) -> List[Tuple[Dict[str, Any], float]]:
        """Search for similar vectors. Returns list of (metadata, score) tuples."""
        pass
        
    @abstractmethod
    async def delete_vectors(self, collection_name: str, filter_dict: Dict[str, Any]) -> None:
        """Delete vectors matching a filter (e.g., by document_id)."""
        pass
        
    @abstractmethod
    async def collection_exists(self, collection_name: str) -> bool:
        """Check if a collection exists."""
        pass
        
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check if vector store is available."""
        pass


# ─── Future Interfaces (Placeholders) ────────────────────────────────────────
class Retriever(ABC):
    """Interface for document retrieval strategies."""
    
    @abstractmethod
    async def retrieve(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        pass


class Reranker(ABC):
    """Interface for cross-encoder or reranking models."""
    
    @abstractmethod
    async def rerank(self, query: str, documents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        pass


class LLMProvider(ABC):
    """Interface for Large Language Models."""
    
    @abstractmethod
    async def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate a complete text response."""
        pass
        
    @abstractmethod
    async def stream_generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs):
        """Yield chunks of text for streaming."""
        pass
        
    @abstractmethod
    def model_name(self) -> str:
        """Return the model identifier."""
        pass
        
    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """Check if provider is available."""
        pass
