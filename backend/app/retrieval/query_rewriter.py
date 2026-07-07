"""
ForgeMind AI — Query Rewriter
"""
from typing import List, Any

from app.ai.registry import registry


class QueryRewriter:
    """
    Expands short questions, resolves pronouns using conversation memory,
    normalizes whitespace, and generates a retrieval-friendly query.
    """
    
    def __init__(self):
        self.system_prompt = (
            "You are a search query formulation expert. "
            "Given a user's question and the recent chat history, rewrite the user's question "
            "into a fully resolved, standalone search query that contains all necessary context "
            "to be used in a vector search engine. "
            "Resolve any pronouns (e.g. 'it', 'they', 'this') based on the history. "
            "Only output the rewritten query text. Do NOT add quotes, markdown, or conversational filler."
        )

    async def rewrite(self, query: str, chat_history: List[Any] = None) -> str:
        """
        Normalize and rewrite the query using an LLM.
        """
        # Basic normalization
        normalized = " ".join(query.strip().split())
        
        # If no chat history or very long query, we can often just use it directly
        # to save latency. For enterprise systems, we might always rewrite.
        # Here we only rewrite if we have history to resolve.
        if not chat_history:
            return normalized
            
        history_lines = []
        for msg in chat_history:
            # support both objects and dicts
            role = getattr(msg, "role", None)
            content = getattr(msg, "content", None)
            if role is None and isinstance(msg, dict):
                role = msg.get("role")
            if content is None and isinstance(msg, dict):
                content = msg.get("content")
                
            # support enum role
            if hasattr(role, "value"):
                role = role.value
                
            role_str = str(role or "").lower()
            content_str = str(content or "")
            history_lines.append(f"{role_str}: {content_str}")
            
        history_text = "\n".join(history_lines)
        
        prompt = f"Chat History:\n{history_text}\n\nCurrent User Query: {normalized}\n\nRewritten Query:"
        
        llm = registry.get_llm_provider()
        
        try:
            rewritten_query = await llm.generate(prompt=prompt, system_prompt=self.system_prompt)
            return rewritten_query.strip()
        except Exception:
            # Fallback in case of LLM failure
            return normalized
