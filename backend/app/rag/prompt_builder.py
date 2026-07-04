"""
ForgeMind AI — RAG Prompt Builder
"""

class PromptBuilder:
    """
    Constructs the final prompt for the LLM based on system instructions, context, and user query.
    """
    
    def __init__(self):
        self.default_system_prompt = (
            "You are ForgeMind AI, an expert industrial knowledge assistant. "
            "You must answer the user's question strictly based on the provided Context. "
            "Never hallucinate or guess. If the answer is unavailable in the Context, "
            "clearly state that the information could not be found."
        )

    def build_system_prompt(self, context_text: str) -> str:
        """
        Builds the system instructions including the retrieved context.
        """
        return f"{self.default_system_prompt}\n\n=== CONTEXT ===\n{context_text}\n==============="

    def build_user_prompt(self, user_query: str) -> str:
        """
        Builds the user prompt.
        """
        return f"Question: {user_query}"
