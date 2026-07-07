"""
NEXO — Placeholder Reranker
"""
from typing import Any, Dict, List

from app.ai.interfaces import Reranker


class PlaceholderReranker(Reranker):
    """
    A pass-through reranker that satisfies the interface without loading a heavy model.
    """
    
    async def rerank(self, query: str, documents: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Simply return the documents as they are, truncated to top_k."""
        return documents[:top_k]
        
    async def health_check(self) -> Dict[str, Any]:
        """Health check."""
        return {"status": "ok", "provider": "PlaceholderReranker"}
