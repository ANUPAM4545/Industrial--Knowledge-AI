"""
ForgeMind AI — RAG Response Formatter
"""
from typing import Any, Dict


class ResponseFormatter:
    """
    Formats the final response structure before returning to the API.
    """
    
    def format_final_response(self, text: str, citations: list) -> Dict[str, Any]:
        """
        Package the text and citations into a standard JSON payload.
        """
        return {
            "answer": text,
            "citations": citations
        }
