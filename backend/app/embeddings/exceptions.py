"""
ForgeMind AI — Embedding Exceptions
"""

class EmbeddingError(Exception):
    """Base exception for embedding failures."""
    pass


class ProviderInitializationError(EmbeddingError):
    """Raised when an embedding provider fails to initialize."""
    pass


class EmbeddingGenerationError(EmbeddingError):
    """Raised when text cannot be embedded."""
    pass


class VectorStoreError(Exception):
    """Base exception for vector store failures."""
    pass


class CollectionError(VectorStoreError):
    """Raised when a collection cannot be created or accessed."""
    pass


class VectorIndexError(VectorStoreError):
    """Raised when vectors cannot be indexed/upserted."""
    pass
