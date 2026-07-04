import pytest
from fastapi.testclient import TestClient
from app.db.base import Base  # Import Base first to establish load order
from app.main import app
from app.evaluation.evaluation_service import EvaluationService
from app.evaluation.logger import evaluation_db

client = TestClient(app)


@pytest.mark.asyncio
async def test_evaluation_service_and_api():
    # Clear records
    evaluation_db._records.clear()
    
    service = EvaluationService()
    
    chunks = [
        {"document_id": "doc1", "page_number": 3, "chunk_index": 0, "score": 0.85},
        {"document_id": "doc2", "page_number": 1, "chunk_index": 5, "score": 0.75},
    ]
    query = "Operating limits?"
    response = "The operating limit is 100C [doc1, p. 3]."
    
    result = await service.evaluate_run(
        query=query,
        response_text=response,
        chunks=chunks,
        latency_ms=120.5,
        conversation_id="conv_test_123",
        provider="OpenAI",
        model="gpt-4o"
    )
    
    assert result.query == query
    assert result.conversation_id == "conv_test_123"
    assert result.provider == "OpenAI"
    assert result.model == "gpt-4o"
    assert result.latency_ms == 120.5
    assert result.chunk_count == 2
    assert result.top_similarity == 0.85
    assert result.average_similarity == 0.80
    assert result.citation_score == 1.0
    assert result.confidence_score > 0.0
    
    latest = evaluation_db.get_latest()
    assert latest is not None
    assert latest.query == query
    
    # Test APIs
    resp_latest = client.get("/api/v1/evaluation/latest")
    assert resp_latest.status_code == 200
    assert resp_latest.json()["query"] == query
    
    resp_conv = client.get("/api/v1/evaluation/conversation/conv_test_123")
    assert resp_conv.status_code == 200
    assert len(resp_conv.json()) == 1
    assert resp_conv.json()[0]["query"] == query
    
    resp_system = client.get("/api/v1/evaluation/system")
    assert resp_system.status_code == 200
    data = resp_system.json()
    assert data["total_runs"] == 1
    assert data["average_confidence"] == result.confidence_score

    # Run 2: MEDIUM hallucination risk (low similarity)
    low_similarity_chunks = [
        {"document_id": "doc1", "page_number": 3, "chunk_index": 0, "score": 0.45},
        {"document_id": "doc2", "page_number": 1, "chunk_index": 5, "score": 0.35},
    ]
    result_med = await service.evaluate_run(
        query=query,
        response_text=response,
        chunks=low_similarity_chunks,
        latency_ms=100.0,
        conversation_id="conv_test_123",
        provider="OpenAI",
        model="gpt-4o"
    )
    assert result_med.hallucination_risk == "MEDIUM"

    # Run 3: HIGH hallucination risk (missing citation)
    response_missing = "This is ungrounded information [unrelated_doc, p. 100]."
    result_high = await service.evaluate_run(
        query=query,
        response_text=response_missing,
        chunks=chunks,
        latency_ms=100.0,
        conversation_id="conv_test_123",
        provider="OpenAI",
        model="gpt-4o"
    )
    assert result_high.hallucination_risk == "HIGH"
    
    # Assert updated system stats
    resp_system2 = client.get("/api/v1/evaluation/system")
    assert resp_system2.status_code == 200
    data_sys = resp_system2.json()
    assert data_sys["total_runs"] == 3
    assert data_sys["hallucination_risk_counts"]["LOW"] == 1
    assert data_sys["hallucination_risk_counts"]["MEDIUM"] == 1
    assert data_sys["hallucination_risk_counts"]["HIGH"] == 1
    
    # Test latest endpoint
    resp_latest2 = client.get("/api/v1/evaluation/latest")
    assert resp_latest2.status_code == 200
    assert resp_latest2.json()["query"] == query

