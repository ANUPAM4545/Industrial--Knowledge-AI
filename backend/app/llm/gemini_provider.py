"""
NEXO — Gemini LLM Provider
"""
from typing import Any, AsyncGenerator, Dict, Optional

from google import genai
from google.genai import types

from app.ai.interfaces import LLMProvider
from app.core.config import settings


class GeminiProvider(LLMProvider):
    """
    Google Gemini implementation for the LLMProvider interface.
    """
    
    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self._model_name = model_name
        # The new official SDK is `google-genai` which uses `from google import genai`
        self._client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> str:
        """Generate a complete text response."""
        config_kwargs = {}
        if system_prompt:
            config_kwargs["system_instruction"] = system_prompt
            
        # Support setting max tokens, temperature etc from kwargs
        if "temperature" in kwargs:
            config_kwargs["temperature"] = kwargs["temperature"]
        if "max_tokens" in kwargs:
            config_kwargs["max_output_tokens"] = kwargs["max_tokens"]
            
        config = types.GenerateContentConfig(**config_kwargs) if config_kwargs else None

        response = await self._client.aio.models.generate_content(
            model=self._model_name,
            contents=prompt,
            config=config
        )
        return response.text or ""

    async def stream_generate(self, prompt: str, system_prompt: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        """Yield chunks of text for streaming."""
        config_kwargs = {}
        if system_prompt:
            config_kwargs["system_instruction"] = system_prompt
            
        if "temperature" in kwargs:
            config_kwargs["temperature"] = kwargs["temperature"]
        if "max_tokens" in kwargs:
            config_kwargs["max_output_tokens"] = kwargs["max_tokens"]
            
        config = types.GenerateContentConfig(**config_kwargs) if config_kwargs else None

        stream = await self._client.aio.models.generate_content_stream(
            model=self._model_name,
            contents=prompt,
            config=config
        )
        
        async for chunk in stream:
            if chunk.text:
                yield chunk.text

    def model_name(self) -> str:
        """Return the model identifier."""
        return self._model_name

    async def health_check(self) -> Dict[str, Any]:
        """Check if provider is available."""
        status = "healthy"
        try:
            if not settings.GEMINI_API_KEY:
                status = "unhealthy (missing API key)"
            else:
                # Basic generation check (can be skipped to save costs)
                pass
        except Exception as e:
            status = f"unhealthy ({str(e)})"
            
        return {
            "provider": "Gemini",
            "model": self._model_name,
            "status": status
        }
