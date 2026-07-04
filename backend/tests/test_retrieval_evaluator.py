import pytest
from app.evaluation.retrieval_evaluator import SimpleRetrievalEvaluator


def test_retrieval_evaluator_empty():
    evaluator = SimpleRetrievalEvaluator()
    res = evaluator.evaluate([])
    assert res["average_similarity"] == 0.0
    assert res["chunk_count"] == 0
    assert res["completeness"] == 0.0


def test_retrieval_evaluator_normal():
    evaluator = SimpleRetrievalEvaluator(completeness_threshold=0.7)
    chunks = [
        {"document_id": "doc1", "chunk_index": 1, "score": 0.9},
        {"document_id": "doc2", "chunk_index": 2, "score": 0.8},
        {"document_id": "doc1", "chunk_index": 1, "score": 0.9},  # Duplicate
        {"document_id": "doc3", "chunk_index": 3, "score": 0.6},
    ]
    res = evaluator.evaluate(chunks)
    assert res["chunk_count"] == 4
    assert res["average_similarity"] == 0.8
    assert res["min_similarity"] == 0.6
    assert res["max_similarity"] == 0.9
    assert res["duplicate_chunks"] == 1
    assert res["completeness"] == 0.75
