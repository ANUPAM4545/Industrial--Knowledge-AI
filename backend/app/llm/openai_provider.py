"""
NEXO — OpenAI LLM Provider
"""
from typing import Any, AsyncGenerator, Dict, Optional

from openai import AsyncOpenAI
import httpx

from app.ai.interfaces import LLMProvider
from app.core.config import settings


class OpenAIProvider(LLMProvider):
    """
    OpenAI implementation for the LLMProvider interface.
    """
    
    def __init__(self, model_name: str = "gpt-4o-mini"):
        self._model_name = model_name
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate a complete text response."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = await self._client.chat.completions.create(
            model=self._model_name,
            messages=messages,
            **kwargs
        )
        return response.choices[0].message.content or ""

    async def stream_generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        """Yield chunks of text for streaming."""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        stream = await self._client.chat.completions.create(
            model=self._model_name,
            messages=messages,
            stream=True,
            **kwargs
        )
        
        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content is not None:
                yield content

    def model_name(self) -> str:
        """Return the model identifier."""
        return self._model_name

    async def health_check(self) -> Dict[str, Any]:
        """Check if provider is available."""
        status = "healthy"
        try:
            # We perform a minimal API call or just rely on initialization check
            if not settings.OPENAI_API_KEY:
                status = "unhealthy (missing API key)"
            else:
                # Optionally check models endpoint
                await self._client.models.list(timeout=httpx.Timeout(5.0))
        except Exception as e:
            status = f"unhealthy ({str(e)})"
            
        return {
            "provider": "OpenAI",
            "model": self._model_name,
            "status": status
        }
