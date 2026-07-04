"""
ForgeMind AI — Response Metrics Implementation
"""
from typing import Any, Dict, List
from app.evaluation.interfaces import ResponseMetricsCalculator


class SimpleResponseMetricsCalculator(ResponseMetricsCalculator):
    """
    Calculates basic response telemetry, such as length, estimated tokens,
    and references usage counts.
    """
    def calculate(
        self,
        response_text: str,
        chunks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        char_len = len(response_text)
        
        # Token estimate: approx 4 characters per token
        token_estimate = max(1, int(char_len / 4))
        
        unique_docs = set()
        unique_pages = set()
        
        for cit in citations:
            doc_id = cit.get("document_id")
            page_num = cit.get("page_number")
            if doc_id:
                unique_docs.add(doc_id)
            if page_num is not None:
                unique_pages.add(page_num)
                
        return {
            "response_length": char_len,
            "token_estimate": token_estimate,
            "citation_count": len(citations),
            "documents_used": len(unique_docs),
            "pages_referenced": len(unique_pages)
        }
