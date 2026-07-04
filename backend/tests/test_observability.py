import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi.testclient import TestClient
from app.db.base import Base  # Import Base first to resolve sqlalchemy loading sequence
from app.main import app
from app.observability.health_service import HealthService
from app.observability.metrics_service import MetricsService
from app.observability.runtime_service import RuntimeService
from app.observability.diagnostics import PipelineDiagnosticsManager
from app.evaluation.logger import evaluation_db
from app.retrieval.retrieval_result import RetrievalProfiler, RetrievalResult, RetrievalDiagnostics

client = TestClient(app)


@pytest.mark.asyncio
async def test_health_service():
    health = await HealthService.check_health()
    assert "embedding_status" in health
    assert "vector_store_status" in health
    assert "llm_status" in health
    assert "overall_status" in health


def test_metrics_service_empty():
    evaluation_db._records.clear()
    metrics = MetricsService.get_aggregated_metrics()
    assert metrics["average_latency_ms"] == 0.0
    assert metrics["queries_today"] == 0


@pytest.mark.asyncio
async def test_runtime_service():
    from sqlalchemy.ext.asyncio import AsyncSession
    mock_session = AsyncMock(spec=AsyncSession)
    mock_execute = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar.return_value = 5
    mock_execute.return_value = mock_result
    mock_session.execute = mock_execute

    stats = await RuntimeService.get_index_statistics(mock_session)
    assert stats["documents_indexed"] == 5
    assert stats["vectors_stored"] == 5


@pytest.mark.asyncio
async def test_pipeline_diagnostics_manager_and_api():
    # Setup mock diagnostics history
    evaluation_db._records.clear()
    RetrievalProfiler._history.clear()
    
    # 1. Log a search profile
    diag = RetrievalDiagnostics(
        embedding_time_ms=10.0,
        vector_search_time_ms=25.0,
        keyword_search_time_ms=12.0,
        merge_time_ms=4.0,
        rerank_time_ms=2.0,
        total_latency_ms=53.0,
        chunks_retrieved=3,
        top_similarity=0.85
    )
    res = RetrievalResult(chunks=[], diagnostics=diag)
    RetrievalProfiler.log_profile(query="Test query", result=res)
    
    # 2. Add an evaluation run
    from app.evaluation.evaluation_service import EvaluationService
    service = EvaluationService()
    await service.evaluate_run(
        query="Test query",
        response_text="Standard mock response [doc1, p. 5]",
        chunks=[{"document_id": "doc1", "page_number": 5, "chunk_index": 0}],
        latency_ms=120.0,
        conversation_id="conv_123",
        provider="OpenAI",
        model="gpt-4"
    )
    
    # 3. Test compilation
    pipeline_diag = PipelineDiagnosticsManager.compile_diagnostics("conv_123")
    assert pipeline_diag is not None
    assert pipeline_diag.query == "Test query"
    assert pipeline_diag.embedding_time_ms == 10.0
    assert pipeline_diag.vector_search_time_ms == 25.0
    assert pipeline_diag.total_latency_ms == 120.0
    
    # 4. Test REST Endpoints
    resp = client.get("/api/v1/ai/health")
    assert resp.status_code == 200
    
    resp = client.get("/api/v1/ai/metrics")
    assert resp.status_code == 200
    
    resp = client.get("/api/v1/ai/providers")
    assert resp.status_code == 200
    
    resp = client.get("/api/v1/ai/pipeline/conv_123")
    assert resp.status_code == 200
    assert resp.json()["query"] == "Test query"
    
    # 5. Missing conversation returns 404
    resp_missing = client.get("/api/v1/ai/pipeline/missing_conv")
    assert resp_missing.status_code == 404


@pytest.mark.asyncio
async def test_health_service_failures(monkeypatch):
    from app.ai.registry import registry
    
    def raise_err():
        raise ValueError("Simulated connection error")
        
    # Force connection failures
    monkeypatch.setattr(registry, "get_embedding_provider", raise_err)
    monkeypatch.setattr(registry, "get_vector_store", raise_err)
    monkeypatch.setattr(registry, "get_llm_provider", raise_err)
    monkeypatch.setattr(registry, "get_keyword_provider", raise_err)
    
    health = await HealthService.check_health()
    assert health["embedding_status"] == "Unavailable"
    assert health["vector_store_status"] == "Unavailable"
    assert health["llm_status"] == "Unavailable"
    assert health["retriever_status"] == "Unavailable"
    assert health["overall_status"] == "Unavailable"


@pytest.mark.asyncio
async def test_runtime_service_failure():
    from sqlalchemy.ext.asyncio import AsyncSession
    mock_session = AsyncMock(spec=AsyncSession)
    mock_session.execute.side_effect = Exception("DB connection failure")
    
    stats = await RuntimeService.get_index_statistics(mock_session)
    assert stats["documents_indexed"] == 0
    assert stats["vectors_stored"] == 0


def test_observability_api_failures(monkeypatch):
    # Mock HealthService to raise error to trigger API 500
    async def mock_err_health():
        raise Exception("Health scan error")
    monkeypatch.setattr(HealthService, "check_health", mock_err_health)
    resp = client.get("/api/v1/ai/health")
    assert resp.status_code == 500

    # Mock MetricsService to raise error to trigger API 500
    def mock_err_metrics():
        raise Exception("Metrics collation error")
    monkeypatch.setattr(MetricsService, "get_aggregated_metrics", mock_err_metrics)
    resp = client.get("/api/v1/ai/metrics")
    assert resp.status_code == 500

    # Mock RuntimeService to raise error to trigger API 500
    async def mock_err_runtime(*args, **kwargs):
        raise Exception("Runtime database error")
    monkeypatch.setattr(RuntimeService, "get_index_statistics", mock_err_runtime)
    resp = client.get("/api/v1/ai/runtime")
    assert resp.status_code == 500


