"""
NEXO — RAG Citation Builder
"""
from typing import Any, Dict, List


class CitationBuilder:
    """
    Builds citation objects from the retrieved chunks to send to the frontend.
    """
    
    def build(self, retrieved_chunks: List[Dict[str, Any]], document_titles: Dict[str, str] = None) -> List[Dict[str, Any]]:
        """
        Extract citation metadata (doc name, page, heading, score) from chunks.
        """
        document_titles = document_titles or {}
        citations = []
        seen_chunks = set()
        
        for chunk_data in retrieved_chunks:
            # handle both {"payload": {...}} and flat dictionaries (which is what SimilaritySearchService now returns)
            payload = chunk_data.get("payload") if "payload" in chunk_data else chunk_data
            
            chunk_id = chunk_data.get("id") or payload.get("chunk_id") or payload.get("chunk_index")
            
            if chunk_id in seen_chunks:
                continue
                
            seen_chunks.add(chunk_id)
            
            doc_id = payload.get("document_id")
            
            citations.append({
                "chunk_id": chunk_id,
                "document_id": doc_id,
                "document_name": document_titles.get(doc_id, payload.get("document_name", "Unknown Document")),
                "page_number": payload.get("page_number"),
                "heading": payload.get("heading"),
                "similarity_score": chunk_data.get("rrf_score", chunk_data.get("score", 0.0)),
                "text": payload.get("text", "")
            })
            
        return citations
            
        return citations
