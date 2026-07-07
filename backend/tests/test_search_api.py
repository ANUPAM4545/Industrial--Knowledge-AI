import pytest
# Import Base first to establish correct load order for SQLAlchemy models
from app.db.base import Base
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch
from app.main import app
from app.retrieval.retrieval_result import RetrievalResult, RetrievalDiagnostics


client = TestClient(app)


def test_search_diagnostics():
    response = client.get("/api/v1/search/diagnostics")
    assert response.status_code == 200
    data = response.json()
    assert "profiles" in data
    assert "active_retriever" in data


@pytest.mark.asyncio
async def test_search_rewrite_endpoint():
    mock_rewrite = AsyncMock(return_value="expanded query")
    with patch("app.services.retrieval_service.QueryRewriter.rewrite", mock_rewrite):
        response = client.post("/api/v1/search/rewrite", json={"query": "test query"})
        assert response.status_code == 200
        data = response.json()
        assert data["original_query"] == "test query"
        assert data["rewritten_query"] == "expanded query"


@pytest.mark.asyncio
async def test_search_hybrid_endpoint():
    mock_result = RetrievalResult(
        chunks=[{"document_id": "doc1", "text": "sample text", "score": 0.9}],
        diagnostics=RetrievalDiagnostics(vector_results_count=1)
    )
    with patch("app.services.retrieval_service.RetrievalService.search", AsyncMock(return_value=mock_result)):
        response = client.post("/api/v1/search/hybrid", json={"query": "test query", "limit": 5})
        assert response.status_code == 200
        data = response.json()
        assert "chunks" in data
        assert "diagnostics" in data
        assert len(data["chunks"]) == 1
        assert data["chunks"][0]["document_id"] == "doc1"
