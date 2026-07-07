import pytest
from app.retrieval.merge_strategy import ReciprocalRankFusion, WeightedNormalizedMergeStrategy


def test_rrf_merge():
    strategy = ReciprocalRankFusion(k=60)
    
    vector_results = [
        {"document_id": "doc1", "chunk_index": 1, "text": "chunk1", "score": 0.9},
        {"document_id": "doc2", "chunk_index": 2, "text": "chunk2", "score": 0.8},
    ]
    keyword_results = [
        {"document_id": "doc2", "chunk_index": 2, "text": "chunk2", "score": 15.0},
        {"document_id": "doc3", "chunk_index": 3, "text": "chunk3", "score": 10.0},
    ]
    
    merged = strategy.merge([vector_results, keyword_results], top_k=2)
    
    assert len(merged) == 2
    # doc2 appeared in both, so it should rank first
    assert merged[0]["document_id"] == "doc2"
    assert merged[1]["document_id"] in ["doc1", "doc3"]


def test_weighted_normalized_merge():
    strategy = WeightedNormalizedMergeStrategy(alpha=0.7)
    
    vector_results = [
        {"document_id": "doc1", "chunk_index": 1, "text": "chunk1", "score": 0.9},
        {"document_id": "doc2", "chunk_index": 2, "text": "chunk2", "score": 0.5},
    ]
    keyword_results = [
        {"document_id": "doc2", "chunk_index": 2, "text": "chunk2", "score": 10.0},
        {"document_id": "doc3", "chunk_index": 3, "text": "chunk3", "score": 2.0},
    ]
    
    merged = strategy.merge([vector_results, keyword_results], top_k=3)
    
    assert len(merged) == 3
    assert merged[0]["document_id"] == "doc1"
    assert merged[1]["document_id"] == "doc2"
    assert merged[2]["document_id"] == "doc3"
    
    assert merged[0]["score"] == pytest.approx(0.7)
    assert merged[1]["score"] == pytest.approx(0.3)
    assert merged[2]["score"] == pytest.approx(0.0)
