"""
NEXO — RAG Citation Builder
"""
from typing import Any, Dict, List


class CitationBuilder:
    """
    Builds citation objects from the retrieved chunks to send to the frontend.
    """
    
    def build(self, retrieved_chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Extract citation metadata (doc name, page, heading, score) from chunks.
        """
        citations = []
        seen_chunks = set()
        
        for chunk_data in retrieved_chunks:
            payload = chunk_data.get("payload", {})
            chunk_id = chunk_data.get("id") or payload.get("chunk_id")
            
            if chunk_id in seen_chunks:
                continue
                
            seen_chunks.add(chunk_id)
            
            citations.append({
                "chunk_id": chunk_id,
                "document_id": payload.get("document_id"),
                "document_name": payload.get("document_name", "Unknown Document"),
                "page_number": payload.get("page_number"),
                "heading": payload.get("heading"),
                "similarity_score": chunk_data.get("score", 0.0),
                "text": payload.get("text", "")
            })
            
        return citations
