"""
NEXO — Retrieval Merge Strategy
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Set, Tuple


class MergeStrategy(ABC):
    """Abstract strategy for merging retrieval results from multiple sources."""
    
    @abstractmethod
    def merge(self, result_sets: List[List[Dict[str, Any]]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Merge multiple lists of retrieved chunks."""
        pass


class ReciprocalRankFusion(MergeStrategy):
    """
    Implements Reciprocal Rank Fusion (RRF).
    RRF Score = sum(1 / (k + rank)) for each result set where the document appears.
    k is a constant, usually 60.
    """
    
    def __init__(self, k: int = 60):
        self.k = k

    def _get_doc_id(self, chunk: Dict[str, Any]) -> str:
        """Helper to uniquely identify a chunk."""
        # A chunk is uniquely identified by document_id + chunk_index
        doc_id = chunk.get("document_id", "")
        chunk_idx = chunk.get("chunk_index", 0)
        # If chunk doesn't have an ID, try to hash text
        if not doc_id:
            text = chunk.get("text", "")
            return str(hash(text))
        return f"{doc_id}_{chunk_idx}"

    def merge(self, result_sets: List[List[Dict[str, Any]]], top_k: int = 5) -> List[Dict[str, Any]]:
        """Merge results using RRF."""
        if not result_sets:
            return []
            
        rrf_scores: Dict[str, float] = {}
        chunk_map: Dict[str, Dict[str, Any]] = {}
        
        for results in result_sets:
            for rank, chunk in enumerate(results, start=1):
                chunk_id = self._get_doc_id(chunk)
                
                # Store the actual chunk data
                if chunk_id not in chunk_map:
                    # Make a copy so we don't modify the original
                    chunk_copy = dict(chunk)
                    # We will override the score with the RRF score
                    chunk_copy["original_score"] = chunk.get("score", 0.0)
                    chunk_map[chunk_id] = chunk_copy
                    rrf_scores[chunk_id] = 0.0
                    
                # Add RRF score
                rrf_scores[chunk_id] += 1.0 / (self.k + rank)
                
        # Update the chunks with their RRF scores
        for chunk_id, rrf_score in rrf_scores.items():
            chunk_map[chunk_id]["score"] = rrf_score
            
        # Sort by RRF score descending
        merged_results = sorted(chunk_map.values(), key=lambda x: x["score"], reverse=True)
        
        return merged_results[:top_k]


class WeightedNormalizedMergeStrategy(MergeStrategy):
    """
    Normalizes scores for each retrieval method to [0, 1] using Min-Max normalization,
    then combines them using a weighted sum.
    """
    def __init__(self, alpha: float = 0.5):
        self.alpha = alpha

    def _get_doc_id(self, chunk: Dict[str, Any]) -> str:
        doc_id = chunk.get("document_id", "")
        chunk_idx = chunk.get("chunk_index", 0)
        if not doc_id:
            text = chunk.get("text", "")
            return str(hash(text))
        return f"{doc_id}_{chunk_idx}"

    def _normalize(self, results: List[Dict[str, Any]]) -> Dict[str, float]:
        if not results:
            return {}
        scores = [chunk.get("score", 0.0) for chunk in results]
        min_s = min(scores)
        max_s = max(scores)
        diff = max_s - min_s
        
        normalized = {}
        for chunk in results:
            cid = self._get_doc_id(chunk)
            if diff > 0:
                normalized[cid] = (chunk.get("score", 0.0) - min_s) / diff
            else:
                normalized[cid] = 1.0
        return normalized

    def merge(self, result_sets: List[List[Dict[str, Any]]], top_k: int = 5) -> List[Dict[str, Any]]:
        if not result_sets:
            return []
        
        vector_results = result_sets[0] if len(result_sets) > 0 else []
        keyword_results = result_sets[1] if len(result_sets) > 1 else []
        
        vector_norm = self._normalize(vector_results)
        keyword_norm = self._normalize(keyword_results)
        
        chunk_map: Dict[str, Dict[str, Any]] = {}
        for chunk in vector_results + keyword_results:
            cid = self._get_doc_id(chunk)
            if cid not in chunk_map:
                chunk_copy = dict(chunk)
                chunk_copy["original_score"] = chunk.get("score", 0.0)
                chunk_map[cid] = chunk_copy
                
        for cid, chunk in chunk_map.items():
            v_score = vector_norm.get(cid, 0.0)
            k_score = keyword_norm.get(cid, 0.0)
            chunk["score"] = self.alpha * v_score + (1.0 - self.alpha) * k_score
            
        merged = sorted(chunk_map.values(), key=lambda x: x["score"], reverse=True)
        return merged[:top_k]

