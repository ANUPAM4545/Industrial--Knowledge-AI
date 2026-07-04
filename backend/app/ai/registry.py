"""
ForgeMind AI — AI Component Registry
Global registry for dependency injection of AI providers.
"""
from typing import Dict, Optional, Type

from app.ai.interfaces import EmbeddingProvider, VectorStore, LLMProvider
from app.core.config import settings


class AIRegistry:
    """Singleton registry for AI components."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIRegistry, cls).__new__(cls)
            cls._instance._embedding_providers = {}
            cls._instance._vector_stores = {}
            cls._instance._llm_providers = {}
            cls._instance._active_embedding_provider = None
            cls._instance._active_vector_store = None
            cls._instance._active_llm_provider = None
        return cls._instance
        
    def register_embedding_provider(self, name: str, provider: EmbeddingProvider) -> None:
        """Register an embedding provider instance."""
        self._embedding_providers[name] = provider
        
    def register_vector_store(self, name: str, store: VectorStore) -> None:
        """Register a vector store instance."""
        self._vector_stores[name] = store

    def register_llm_provider(self, name: str, provider: LLMProvider) -> None:
        """Register an LLM provider instance."""
        self._llm_providers[name] = provider
        
    def get_embedding_provider(self, name: Optional[str] = None) -> EmbeddingProvider:
        """Get the configured or specifically requested embedding provider."""
        provider_name = name or settings.EMBEDDING_PROVIDER
        if provider_name not in self._embedding_providers:
            if provider_name == "fastembed":
                from app.embeddings.fastembed_provider import FastEmbedProvider
                self._embedding_providers[provider_name] = FastEmbedProvider(settings.EMBEDDING_MODEL)
            elif provider_name == "openai":
                from app.embeddings.openai_provider import OpenAIEmbeddingProvider
                self._embedding_providers[provider_name] = OpenAIEmbeddingProvider()
            else:
                raise ValueError(f"Embedding provider '{provider_name}' is not registered and has no default setup.")
        return self._embedding_providers[provider_name]
        
    def get_vector_store(self, name: Optional[str] = None) -> VectorStore:
        """Get the configured or specifically requested vector store."""
        store_name = name or settings.VECTOR_STORE
        if store_name not in self._vector_stores:
            if store_name == "qdrant":
                from app.vectorstore.qdrant_store import QdrantVectorStore
                self._vector_stores[store_name] = QdrantVectorStore(settings.QDRANT_URL)
            elif store_name == "pinecone":
                from app.vectorstore.pinecone_store import PineconeVectorStore
                self._vector_stores[store_name] = PineconeVectorStore()
            else:
                raise ValueError(f"Vector store '{store_name}' is not registered and has no default setup.")
        return self._vector_stores[store_name]

    def get_llm_provider(self, name: Optional[str] = None) -> LLMProvider:
        """Get the configured or specifically requested LLM provider."""
        # Using getattr to allow settings fallback before config.py is fully updated
        provider_name = name or getattr(settings, "LLM_PROVIDER", "openai")
        if provider_name not in self._llm_providers:
            if provider_name == "openai":
                from app.llm.openai_provider import OpenAIProvider
                self._llm_providers[provider_name] = OpenAIProvider()
            elif provider_name == "gemini":
                from app.llm.gemini_provider import GeminiProvider
                self._llm_providers[provider_name] = GeminiProvider()
            elif provider_name == "ollama":
                from app.llm.ollama_provider import OllamaProvider
                self._llm_providers[provider_name] = OllamaProvider()
            else:
                raise ValueError(f"LLM provider '{provider_name}' is not registered and has no default setup.")
        return self._llm_providers[provider_name]

# Global instance
registry = AIRegistry()
