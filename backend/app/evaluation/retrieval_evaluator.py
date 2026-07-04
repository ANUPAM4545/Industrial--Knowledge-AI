"""
ForgeMind AI — Retrieval Evaluator Implementation
"""
from typing import Any, Dict, List
from app.evaluation.interfaces import RetrievalEvaluator


class SimpleRetrievalEvaluator(RetrievalEvaluator):
    """
    Evaluates semantic vector/keyword retrieved chunks for similarity bounds,
    completeness, and duplication.
    """
    def __init__(self, completeness_threshold: float = 0.7):
        self.completeness_threshold = completeness_threshold

    def evaluate(self, chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not chunks:
            return {
                "average_similarity": 0.0,
                "min_similarity": 0.0,
                "max_similarity": 0.0,
                "chunk_count": 0,
                "duplicate_chunks": 0,
                "completeness": 0.0
            }

        scores = [float(c.get("score", 0.0)) for c in chunks]
        
        # Calculate stats
        avg_sim = sum(scores) / len(scores)
        min_sim = min(scores)
        max_sim = max(scores)
        
        # Count duplicates
        seen_keys = set()
        duplicates = 0
        for c in chunks:
            doc_id = c.get("document_id") or ""
            chunk_idx = c.get("chunk_index")
            key = f"{doc_id}_{chunk_idx}"
            if key in seen_keys:
                duplicates += 1
            else:
                seen_keys.add(key)
                
        # Completeness: ratio of chunks exceeding high similarity threshold
        high_quality_count = sum(1 for s in scores if s >= self.completeness_threshold)
        completeness = high_quality_count / len(chunks)
        
        return {
            "average_similarity": avg_sim,
            "min_similarity": min_sim,
            "max_similarity": max_sim,
            "chunk_count": len(chunks),
            "duplicate_chunks": duplicates,
            "completeness": completeness
        }
