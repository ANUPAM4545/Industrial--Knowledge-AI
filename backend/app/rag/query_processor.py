"""
NEXO — RAG Query Processor
"""

class QueryProcessor:
    """
    Processes and normalizes user queries before retrieval.
    """
    
    def process(self, query: str, chat_history: list = None) -> str:
        """
        Normalize query, remove noise, and potentially expand using chat history.
        In a production system, this could use a small LLM call for query rewriting.
        For now, we perform basic normalization.
        """
        if not query:
            return ""
            
        # Basic normalization
        normalized = query.strip()
        
        # If there's chat history and the query is short/ambiguous, we might append context.
        # This is a basic implementation of contextualization.
        if chat_history and len(normalized.split()) < 4:
            # Append a bit of context from the last user message if available
            for msg in reversed(chat_history):
                if msg.role == "user":
                    normalized = f"{msg.content} {normalized}"
                    break
                    
        return normalized
