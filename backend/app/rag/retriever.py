"""
ForgeMind AI — RAG Retriever
"""
from typing import Any, Dict, List, Optional

from app.ai.interfaces import Retriever
from app.services.similarity_service import SimilaritySearchService


class RAGRetriever(Retriever):
    """
    Implements document retrieval using the SimilaritySearchService.
    """
    def __init__(self, search_service: SimilaritySearchService):
        self.search_service = search_service

    async def retrieve(
        self, 
        query: str, 
        limit: int = 5, 
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve top K semantic chunks for the query.
        """
        # The search_service returns a list of dictionaries with chunk metadata and score.
        results = await self.search_service.search(
            query=query,
            limit=limit,
            filter_dict=filter_dict
        )
        return results
