"""
NEXO — Similarity Search Service
"""
from typing import Any, Dict, List, Optional

from app.ai.registry import registry
from app.core.config import settings


class SimilaritySearchService:
    """Service for handling semantic search across embedded documents."""

    @staticmethod
    async def search(
        query: str,
        limit: int = 5,
        document_id: Optional[str] = None,
        document_ids: Optional[List[str]] = None,
        collection_name: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Embed a query and search the vector store for similar chunks.
        
        Args:
            query: The search query string.
            limit: Maximum number of results to return.
            document_id: Optional ID to restrict search to a specific document.
            collection_name: Specific collection to search. Uses default if None.
            
        Returns:
            List of dictionaries containing chunk metadata and similarity scores.
        """
        # 1. Get Providers
        embedder = registry.get_embedding_provider()
        vector_store = registry.get_vector_store()
        
        target_collection = collection_name or settings.QDRANT_COLLECTION
        
        # 2. Embed the query
        query_vector = await embedder.embed_text(query)
        
        # 3. Prepare filters
        filter_dict = None
        if document_id:
            filter_dict = {"document_id": document_id}
        elif document_ids:
            filter_dict = {"document_id": document_ids}
            
        # 4. Execute search
        results = await vector_store.search(
            collection_name=target_collection,
            query_vector=query_vector,
            limit=limit,
            filter_dict=filter_dict
        )
        
        # 5. Format output
        formatted_results = []
        for payload, score in results:
            formatted_results.append({
                "score": score,
                "document_id": payload.get("document_id"),
                "chunk_index": payload.get("chunk_index"),
                "text": payload.get("text"),
                "page_number": payload.get("page_number"),
                "heading": payload.get("heading")
            })
            
        return formatted_results
