"""
NEXO — RAG Context Builder
"""
from typing import Any, Dict, List


class ContextBuilder:
    """
    Builds context string from retrieved semantic chunks.
    """
    
    def build(self, retrieved_chunks: List[Dict[str, Any]], max_tokens: int = 4000) -> str:
        """
        Merge retrieved chunks, remove duplicates, and respect token limits.
        """
        if not retrieved_chunks:
            return "No relevant context found."
            
        context_parts = []
        seen_chunks = set()
        
        # A rough token approximation: 1 token ~= 4 characters
        current_tokens = 0
        
        for chunk_data in retrieved_chunks:
            payload = chunk_data.get("payload", {})
            chunk_id = chunk_data.get("id") or payload.get("chunk_id")
            
            if chunk_id in seen_chunks:
                continue
                
            seen_chunks.add(chunk_id)
            
            text = payload.get("text", "")
            doc_name = payload.get("document_name", "Unknown Document")
            page = payload.get("page_number", "")
            heading = payload.get("heading", "")
            
            # Format chunk
            header = f"Source: {doc_name}"
            if page:
                header += f" (Page {page})"
            if heading:
                header += f" - {heading}"
                
            chunk_str = f"[{header}]\n{text}\n"
            
            # Approx token count
            approx_tokens = len(chunk_str) // 4
            if current_tokens + approx_tokens > max_tokens:
                break
                
            context_parts.append(chunk_str)
            current_tokens += approx_tokens
            
        return "\n".join(context_parts)
