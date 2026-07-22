"""
NEXO — FastEmbed BGE Provider
"""
from typing import Any, Dict, List

from fastembed import TextEmbedding
from starlette.concurrency import run_in_threadpool

from app.ai.interfaces import EmbeddingProvider
from app.embeddings.exceptions import EmbeddingGenerationError, ProviderInitializationError


class FastEmbedProvider(EmbeddingProvider):
    """
    Implementation of EmbeddingProvider using FastEmbed (BGE model).
    Executes in a threadpool to prevent blocking the async event loop.
    """
    
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        self._model_name = model_name
        self._dimension = 384  # bge-small-en-v1.5 dimension
        
        try:
            # We initialize it synchronously here (typically at startup)
            self.model = TextEmbedding(model_name=self._model_name, cache_dir="/tmp/fastembed_cache")
        except Exception as e:
            raise ProviderInitializationError(f"Failed to initialize FastEmbed model {model_name}: {e}")

    async def embed_text(self, text: str) -> List[float]:
        """Embed a single string."""
        try:
            # fastembed returns a generator of numpy arrays. We convert to list of floats.
            def _embed():
                embeddings = list(self.model.embed([text]))
                return embeddings[0].tolist()
                
            return await run_in_threadpool(_embed)
        except Exception as e:
            raise EmbeddingGenerationError(f"Failed to embed text: {e}")

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of strings."""
        try:
            def _embed_batch():
                # embed() processes in batches natively
                embeddings = list(self.model.embed(texts))
                return [emb.tolist() for emb in embeddings]
                
            return await run_in_threadpool(_embed_batch)
        except Exception as e:
            raise EmbeddingGenerationError(f"Failed to embed batch: {e}")

    def dimension(self) -> int:
        """Return the vector dimension size."""
        return self._dimension

    def model_name(self) -> str:
        """Return the model name."""
        return self._model_name

    async def health_check(self) -> Dict[str, Any]:
        """Check if provider is available."""
        return {
            "provider": "FastEmbed",
            "model": self._model_name,
            "dimension": self._dimension,
            "status": "healthy" if self.model else "unhealthy"
        }
