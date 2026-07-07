"""
NEXO — Keyword Search Provider (BM25)
"""
import re
from typing import Any, Dict, List, Optional, Tuple

from rank_bm25 import BM25Okapi

from app.ai.interfaces import KeywordSearchProvider


class RankBM25Provider(KeywordSearchProvider):
    """
    In-memory BM25 implementation of KeywordSearchProvider.
    In a true production environment, this would be backed by Elasticsearch/OpenSearch.
    """
    
    def __init__(self):
        # Maps collection_name to a tuple: (BM25Okapi_instance, list_of_documents)
        self._indices: Dict[str, Tuple[BM25Okapi, List[Dict[str, Any]]]] = {}

    def _tokenize(self, text: str) -> List[str]:
        """Simple whitespace/punctuation tokenizer."""
        return re.findall(r'\w+', text.lower())

    async def index_documents(self, collection_name: str, documents: List[Dict[str, Any]]) -> None:
        """
        Index a batch of documents. 
        Each document should be a dict with at least 'text' and 'id'.
        """
        if not documents:
            return
            
        tokenized_corpus = []
        for doc in documents:
            text = doc.get("text", "")
            tokenized_corpus.append(self._tokenize(text))
            
        bm25 = BM25Okapi(tokenized_corpus)
        self._indices[collection_name] = (bm25, documents)

    async def search(
        self, 
        collection_name: str, 
        query: str, 
        limit: int = 5, 
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Search the BM25 index for the given query.
        """
        if collection_name not in self._indices:
            return []
            
        bm25, corpus = self._indices[collection_name]
        
        tokenized_query = self._tokenize(query)
        # Get raw scores
        scores = bm25.get_scores(tokenized_query)
        
        # Combine docs and scores
        results = []
        for i, doc in enumerate(corpus):
            # Apply metadata filters if provided
            if filter_dict:
                match = True
                for k, v in filter_dict.items():
                    if doc.get(k) != v:
                        match = False
                        break
                if not match:
                    continue
                    
            if scores[i] > 0:
                results.append((doc, float(scores[i])))
                
        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:limit]

    async def health_check(self) -> Dict[str, Any]:
        """Check if provider is available."""
        return {"status": "ok", "provider": "RankBM25Provider", "indices_loaded": len(self._indices)}
