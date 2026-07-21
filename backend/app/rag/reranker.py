"""
NEXO — Reranker Implementations
"""
from typing import Any, Dict, List
from rank_bm25 import BM25Okapi

from app.rag.interfaces import BaseReranker


class RRFReranker(BaseReranker):
    """
    Reciprocal Rank Fusion Reranker.
    Combines dense scores with BM25 lexical scores.
    """
    def __init__(self, k: int = 60):
        """
        Args:
            k: The RRF constant.
        """
        self.k = k

    async def rerank(self, query: str, chunks: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not chunks:
            return []
            
        # 1. Rank by Dense Score
        # Assume chunks already have a "score" from dense retrieval
        dense_ranked = sorted(chunks, key=lambda x: x.get("score", 0.0), reverse=True)
        dense_ranks = {chunk.get("chunk_id", i): rank + 1 for rank, (i, chunk) in enumerate(enumerate(dense_ranked))}
        
        # 2. Rank by BM25 (Lexical)
        tokenized_corpus = [chunk.get("text", "").lower().split() for chunk in chunks]
        bm25 = BM25Okapi(tokenized_corpus)
        tokenized_query = query.lower().split()
        bm25_scores = bm25.get_scores(tokenized_query)
        
        # Add BM25 score to chunks and rank
        bm25_ranked = sorted(enumerate(chunks), key=lambda x: bm25_scores[x[0]], reverse=True)
        bm25_ranks = {chunk.get("chunk_id", orig_idx): rank + 1 for rank, (orig_idx, chunk) in enumerate(bm25_ranked)}
        
        # 3. Calculate RRF Score
        for i, chunk in enumerate(chunks):
            chunk_id = chunk.get("chunk_id", i)
            dense_r = dense_ranks.get(chunk_id, len(chunks))
            bm25_r = bm25_ranks.get(chunk_id, len(chunks))
            
            rrf_score = (1.0 / (self.k + dense_r)) + (1.0 / (self.k + bm25_r))
            chunk["rrf_score"] = rrf_score
            chunk["bm25_score"] = bm25_scores[i]
            
        # 4. Sort by RRF and take top_k
        final_ranked = sorted(chunks, key=lambda x: x.get("rrf_score", 0.0), reverse=True)
        return final_ranked[:top_k]
