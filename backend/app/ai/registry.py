"""
ForgeMind AI — AI Component Registry
Global registry for dependency injection of AI providers.
"""
from typing import Dict, Optional, Type

from app.ai.interfaces import (
    EmbeddingProvider, 
    VectorStore, 
    LLMProvider, 
    KeywordSearchProvider, 
    Reranker
)
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
            cls._instance.embedding_providers: Dict[str, Type[EmbeddingProvider]] = {}
            cls._instance.vector_stores: Dict[str, Type[VectorStore]] = {}
            cls._instance.llm_providers: Dict[str, Type[LLMProvider]] = {}
            cls._instance.keyword_providers: Dict[str, Type['KeywordSearchProvider']] = {}
            cls._instance.rerankers: Dict[str, Type['Reranker']] = {}
            
            # Singletons
            cls._instance._embedding_instance = None
            cls._instance._vector_store_instance = None
            cls._instance._llm_instance = None
            cls._instance._keyword_instance = None
            cls._instance._reranker_instance = None
        return cls._instance

    # ─── Embedding Providers ─────────────────────────────────────────────────
    def register_embedding_provider(self, name: str, provider_class: Type[EmbeddingProvider]) -> None:
        self.embedding_providers[name] = provider_class

    def get_embedding_provider(self) -> EmbeddingProvider:
        if self._embedding_instance is None:
            provider_name = settings.EMBEDDING_PROVIDER
            if provider_name not in self.embedding_providers:
                if provider_name == "fastembed":
                    from app.embeddings.fastembed_provider import FastEmbedProvider
                    self.register_embedding_provider("fastembed", FastEmbedProvider)
                else:
                    raise ValueError(f"Unknown embedding provider: {provider_name}")
            
            self._embedding_instance = self.embedding_providers[provider_name]()
            
        return self._embedding_instance

    # ─── Vector Stores ───────────────────────────────────────────────────────
    def register_vector_store(self, name: str, store_class: Type[VectorStore]) -> None:
        self.vector_stores[name] = store_class

    def get_vector_store(self) -> VectorStore:
        if self._vector_store_instance is None:
            store_name = settings.VECTOR_STORE
            if store_name not in self.vector_stores:
                if store_name == "qdrant":
                    from app.storage.qdrant_store import QdrantStore
                    self.register_vector_store("qdrant", QdrantStore)
                else:
                    raise ValueError(f"Unknown vector store: {store_name}")
            
            self._vector_store_instance = self.vector_stores[store_name]()
            
        return self._vector_store_instance

    # ─── LLM Providers ───────────────────────────────────────────────────────
    def register_llm_provider(self, name: str, provider_class: Type[LLMProvider]) -> None:
        self.llm_providers[name] = provider_class
        
    def get_llm_provider(self) -> LLMProvider:
        if self._llm_instance is None:
            provider_name = settings.LLM_PROVIDER
            if provider_name not in self.llm_providers:
                if provider_name == "openai":
                    from app.llm.openai_provider import OpenAIProvider
                    self.register_llm_provider("openai", OpenAIProvider)
                elif provider_name == "gemini":
                    from app.llm.gemini_provider import GeminiProvider
                    self.register_llm_provider("gemini", GeminiProvider)
                elif provider_name == "ollama":
                    from app.llm.ollama_provider import OllamaProvider
                    self.register_llm_provider("ollama", OllamaProvider)
                else:
                    raise ValueError(f"Unknown LLM provider: {provider_name}")
            
            self._llm_instance = self.llm_providers[provider_name]()
            
        return self._llm_instance

    # ─── Keyword Search Providers ────────────────────────────────────────────
    def register_keyword_provider(self, name: str, provider_class: Type['KeywordSearchProvider']) -> None:
        self.keyword_providers[name] = provider_class
        
    def get_keyword_provider(self) -> 'KeywordSearchProvider':
        if self._keyword_instance is None:
            provider_name = getattr(settings, "KEYWORD_PROVIDER", "rank_bm25")
            if provider_name not in self.keyword_providers:
                if provider_name == "rank_bm25":
                    from app.retrieval.keyword_provider import RankBM25Provider
                    self.register_keyword_provider("rank_bm25", RankBM25Provider)
                else:
                    raise ValueError(f"Unknown keyword provider: {provider_name}")
                    
            self._keyword_instance = self.keyword_providers[provider_name]()
            
        return self._keyword_instance

    # ─── Rerankers ───────────────────────────────────────────────────────────
    def register_reranker(self, name: str, reranker_class: Type['Reranker']) -> None:
        self.rerankers[name] = reranker_class
        
    def get_reranker(self) -> 'Reranker':
        if self._reranker_instance is None:
            reranker_name = getattr(settings, "RERANKER_PROVIDER", "placeholder")
            if reranker_name not in self.rerankers:
                if reranker_name == "placeholder":
                    from app.reranking.placeholder import PlaceholderReranker
                    self.register_reranker("placeholder", PlaceholderReranker)
                elif reranker_name == "bge":
                    from app.reranking.bge_reranker import BGEReranker
                    self.register_reranker("bge", BGEReranker)
                else:
                    raise ValueError(f"Unknown reranker: {reranker_name}")
                    
            self._reranker_instance = self.rerankers[reranker_name]()
            
        return self._reranker_instance

# Global registry instance
registry = AIRegistry()
