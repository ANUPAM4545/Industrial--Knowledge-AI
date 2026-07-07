import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import Base
from app.main import app
from app.models.document import Document, DocumentStatus
from app.evaluation.logger import evaluation_db
from app.evaluation.evaluation_service import EvaluationService
from app.dashboard.dashboard_service import DashboardService
from app.dashboard.analytics_service import DashboardAnalyticsService
from app.dashboard.insights_service import DashboardInsightsService
from app.dashboard.models import (
    DashboardOverview,
    KnowledgeHealth,
    SearchAnalytics,
    SystemHealth,
    DashboardTrends,
)

client = TestClient(app)


async def add_eval(query: str, chunks: list, latency: float):
    service = EvaluationService()
    await service.evaluate_run(
        query=query,
        response_text="Standard response [doc_1, p. 2]",
        chunks=chunks,
        latency_ms=latency,
        conversation_id="conv_123",
        provider="OpenAI",
        model="gpt-4"
    )


@pytest.fixture
def mock_documents():
    doc1 = Document(
        id="doc_1",
        title="Engineering Standard Specs",
        description="Standard rules for specs",
        file_size=1048576,
        status=DocumentStatus.READY,
        created_at=datetime.now(timezone.utc)
    )
    doc2 = Document(
        id="doc_2",
        title="Failed Upload SOP",
        description="Draft SOP rules",
        file_size=5242880,
        status=DocumentStatus.FAILED,
        created_at=datetime.now(timezone.utc)
    )
    return [doc1, doc2]


@pytest.mark.asyncio
async def test_dashboard_service_overview(mock_documents):
    session = AsyncMock(spec=AsyncSession)
    
    mock_docs_res = MagicMock()
    mock_docs_res.scalars.return_value.all.return_value = mock_documents
    
    mock_chunks_res = MagicMock()
    mock_chunks_res.scalar.return_value = 15
    mock_convs_res = MagicMock()
    mock_convs_res.scalar.return_value = 3
    
    session.execute.side_effect = [mock_docs_res, mock_chunks_res, mock_convs_res]

    evaluation_db._records.clear()
    await add_eval(
        query="Troubleshoot safety sensors trigger",
        chunks=[{"document_id": "doc_1", "page_number": 2, "chunk_index": 0}],
        latency=120.0
    )

    overview = await DashboardService.get_overview(session)
    assert overview.total_documents == 2
    assert overview.indexed_documents == 1
    assert overview.failed_documents == 1
    assert overview.total_chunks == 15
    assert overview.total_vectors == 150
    assert overview.questions_today == 1
    assert overview.average_latency == 120.0


@pytest.mark.asyncio
async def test_dashboard_service_knowledge_health(mock_documents):
    session = AsyncMock(spec=AsyncSession)
    mock_docs_res = MagicMock()
    mock_docs_res.scalars.return_value.all.return_value = mock_documents
    session.execute.return_value = mock_docs_res

    evaluation_db._records.clear()
    await add_eval(
        query="Troubleshoot sensors",
        chunks=[{"document_id": "doc_1", "page_number": 1}],
        latency=125.0
    )

    health = await DashboardService.get_knowledge_health(session)
    assert len(health.most_referenced_documents) > 0
    assert health.most_referenced_documents[0].document_id == "doc_1"
    assert health.most_referenced_documents[0].references_count == 1
    assert len(health.failed_processing_jobs) == 1
    assert health.failed_processing_jobs[0].document_id == "doc_2"


@pytest.mark.asyncio
async def test_dashboard_analytics_search():
    evaluation_db._records.clear()
    await add_eval(
        query="Troubleshoot sensors",
        chunks=[],
        latency=105.0
    )

    analytics = DashboardAnalyticsService.get_search_analytics()
    assert len(analytics.most_frequent_queries) == 1
    assert analytics.most_frequent_queries[0].query_text == "Troubleshoot sensors"
    assert "sensors" in [k.keyword for k in analytics.top_keywords]
    assert analytics.average_query_length == 20.0


@pytest.mark.asyncio
async def test_dashboard_insights(mock_documents):
    session = AsyncMock(spec=AsyncSession)
    mock_docs_res = MagicMock()
    mock_docs_res.scalars.return_value.all.return_value = mock_documents
    session.execute.return_value = mock_docs_res

    evaluation_db._records.clear()
    insights = await DashboardInsightsService.get_insights(session)
    assert any(ins.type == "warning" for ins in insights)


@pytest.mark.asyncio
async def test_dashboard_endpoints(monkeypatch):
    async def mock_over(*args, **kwargs):
        return DashboardOverview(
            total_documents=2,
            indexed_documents=1,
            pending_documents=0,
            failed_documents=1,
            total_chunks=15,
            total_vectors=150,
            total_conversations=3,
            questions_today=1,
            average_confidence=0.9,
            average_latency=120.0,
            average_retrieval_score=0.92
        )
    monkeypatch.setattr(DashboardService, "get_overview", mock_over)

    async def mock_health(*args, **kwargs):
        return KnowledgeHealth()
    monkeypatch.setattr(DashboardService, "get_knowledge_health", mock_health)

    def mock_search(*args, **kwargs):
        return SearchAnalytics(
            most_frequent_queries=[],
            top_keywords=[],
            average_query_length=20.0,
            retrieval_success_rate=0.95,
            average_similarity=0.88,
            average_citation_count=2.0
        )
    monkeypatch.setattr(DashboardAnalyticsService, "get_search_analytics", mock_search)

    async def mock_system(*args, **kwargs):
        return SystemHealth(
            embedding_provider="MockEmbedder",
            llm_provider="MockLLM",
            vector_store="MockStore",
            retriever="HybridRetriever",
            evaluation_framework="RAGAS/NEXO",
            overall_system_health="Healthy"
        )
    monkeypatch.setattr(DashboardService, "get_system_health", mock_system)

    async def mock_trends(*args, **kwargs):
        return DashboardTrends()
    monkeypatch.setattr(DashboardAnalyticsService, "get_trends", mock_trends)

    async def mock_insights(*args, **kwargs):
        return []
    monkeypatch.setattr(DashboardInsightsService, "get_insights", mock_insights)

    resp = client.get("/api/v1/dashboard/overview")
    assert resp.status_code == 200

    resp = client.get("/api/v1/dashboard/knowledge")
    assert resp.status_code == 200

    resp = client.get("/api/v1/dashboard/search")
    assert resp.status_code == 200

    resp = client.get("/api/v1/dashboard/system")
    assert resp.status_code == 200

    resp = client.get("/api/v1/dashboard/trends")
    assert resp.status_code == 200

    resp = client.get("/api/v1/dashboard/insights")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_service_failures():
    with patch("app.dashboard.dashboard_service.DashboardService.get_overview", side_effect=Exception("Database failure")):
        resp = client.get("/api/v1/dashboard/overview")
        assert resp.status_code == 500

    with patch("app.dashboard.dashboard_service.DashboardService.get_knowledge_health", side_effect=Exception("Database failure")):
        resp = client.get("/api/v1/dashboard/knowledge")
        assert resp.status_code == 500


@pytest.mark.asyncio
async def test_dashboard_analytics_trends(mock_documents):
    session = AsyncMock(spec=AsyncSession)
    mock_docs_res = MagicMock()
    mock_docs_res.scalars.return_value.all.return_value = mock_documents
    mock_chunks_res = MagicMock()
    mock_chunks_res.scalar.return_value = 15
    session.execute.side_effect = [mock_docs_res, mock_chunks_res]

    trends = await DashboardAnalyticsService.get_trends(session)
    assert len(trends.daily_uploads) == 7
    assert trends.daily_uploads[0].value == 0.0


@pytest.mark.asyncio
async def test_dashboard_service_system_health_failures(monkeypatch):
    from app.ai.registry import registry
    
    def raise_err(*args, **kwargs):
        raise ValueError("Simulated provider lookup failure")
        
    monkeypatch.setattr(registry, "get_llm_provider", raise_err)
    monkeypatch.setattr(registry, "get_embedding_provider", raise_err)
    monkeypatch.setattr(registry, "get_vector_store", raise_err)
    
    health = await DashboardService.get_system_health()
    assert health.llm_provider == "MockLLM"
    assert health.embedding_provider == "MockEmbedder"
    assert health.vector_store == "QdrantVectorStore"


@pytest.mark.asyncio
async def test_dashboard_insights_alternate_conditions(mock_documents):
    many_docs = mock_documents * 15
    session = AsyncMock(spec=AsyncSession)
    mock_docs_res = MagicMock()
    mock_docs_res.scalars.return_value.all.return_value = many_docs
    session.execute.return_value = mock_docs_res

    evaluation_db._records.clear()
    await add_eval("Query 1", [], 120.0)
    await add_eval("Query 2", [], 130.0)
    evaluation_db._records[0].confidence_score = 70.0
    evaluation_db._records[1].confidence_score = 80.0

    insights = await DashboardInsightsService.get_insights(session)
    assert any("Confidence score improved" in ins.text for ins in insights)
    assert any("Large knowledge index" in ins.text for ins in insights)

