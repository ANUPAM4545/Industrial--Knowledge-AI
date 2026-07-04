"""
ForgeMind AI — Ollama LLM Provider (Placeholder)
"""
from typing import Any, AsyncGenerator, Dict, Optional

from app.ai.interfaces import LLMProvider


class OllamaProvider(LLMProvider):
    """
    Placeholder for future local Ollama integration.
    """
    
    def __init__(self, model_name: str = "llama3"):
        self._model_name = model_name

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        raise NotImplementedError("Ollama provider is not yet implemented.")

    async def stream_generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        raise NotImplementedError("Ollama provider is not yet implemented.")
        yield ""

    def model_name(self) -> str:
        return self._model_name

    async def health_check(self) -> Dict[str, Any]:
        return {
            "provider": "Ollama",
            "model": self._model_name,
            "status": "not_implemented"
        }
