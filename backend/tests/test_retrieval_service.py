import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.retrieval_service import RetrievalService
from app.retrieval.retrieval_result import RetrievalResult, RetrievalDiagnostics


@pytest.mark.asyncio
async def test_retrieval_service():
    mock_rewriter = MagicMock()
    mock_rewriter.rewrite = AsyncMock(return_value="rewritten query")
    
    mock_hybrid = MagicMock()
    mock_result = RetrievalResult(
        chunks=[{"document_id": "doc1", "text": "chunk1", "score": 0.5}],
        diagnostics=RetrievalDiagnostics(vector_results_count=1)
    )
    mock_hybrid.retrieve_with_diagnostics = AsyncMock(return_value=mock_result)
    
    service = RetrievalService(query_rewriter=mock_rewriter, hybrid_retriever=mock_hybrid)
    
    mock_reranker = MagicMock()
    mock_reranker.__class__.__name__ = "PlaceholderReranker"
    mock_reranker.rerank = AsyncMock(return_value=[{"document_id": "doc1", "text": "chunk1", "score": 0.5}])
    
    with patch("app.services.retrieval_service.registry.get_reranker", return_value=mock_reranker):
        res = await service.search(query="original query", limit=5, rerank=True)
        assert len(res.chunks) == 1
        assert res.diagnostics.total_latency_ms > 0
        assert res.diagnostics.rerank_time_ms >= 0
