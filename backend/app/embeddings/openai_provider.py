"""
ForgeMind AI — OpenAI Embedding Provider (Placeholder)
"""
from typing import Any, Dict, List

from app.ai.interfaces import EmbeddingProvider


class OpenAIEmbeddingProvider(EmbeddingProvider):
    """
    Placeholder for future OpenAI embedding integration.
    """
    
    def __init__(self, model_name: str = "text-embedding-3-small"):
        self._model_name = model_name

    async def embed_text(self, text: str) -> List[float]:
        raise NotImplementedError("OpenAI provider is not yet implemented.")

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError("OpenAI provider is not yet implemented.")

    def dimension(self) -> int:
        raise NotImplementedError("OpenAI provider is not yet implemented.")

    def model_name(self) -> str:
        return self._model_name

    async def health_check(self) -> Dict[str, Any]:
        return {
            "provider": "OpenAI",
            "model": self._model_name,
            "status": "not_implemented"
        }
