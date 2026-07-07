import pytest
from unittest.mock import AsyncMock, MagicMock
from app.retrieval.hybrid_retriever import HybridRetriever


@pytest.mark.asyncio
async def test_hybrid_retriever_retrieve():
    vector_mock = MagicMock()
    vector_mock.retrieve = AsyncMock(return_value=[
        {"document_id": "doc1", "chunk_index": 1, "text": "vector text", "score": 0.9}
    ])
    
    keyword_mock = MagicMock()
    keyword_mock.retrieve = AsyncMock(return_value=[
        {"document_id": "doc2", "chunk_index": 2, "text": "keyword text", "score": 10.0}
    ])
    
    merge_mock = MagicMock()
    merge_mock.merge = MagicMock(return_value=[
        {"document_id": "doc1", "chunk_index": 1, "text": "vector text", "score": 0.5},
        {"document_id": "doc2", "chunk_index": 2, "text": "keyword text", "score": 0.3}
    ])
    
    hybrid = HybridRetriever(
        vector_retriever=vector_mock,
        keyword_retriever=keyword_mock,
        merge_strategy=merge_mock
    )
    
    result = await hybrid.retrieve_with_diagnostics(query="test query", limit=5)
    
    assert len(result.chunks) == 2
    assert result.diagnostics.vector_results_count == 1
    assert result.diagnostics.keyword_results_count == 1
    assert result.diagnostics.chunks_retrieved == 2
    
    vector_mock.health_check = AsyncMock(return_value={"status": "ok", "provider": "Vector"})
    keyword_mock.health_check = AsyncMock(return_value={"status": "ok", "provider": "Keyword"})
    
    health = await hybrid.health_check()
    assert health["status"] == "ok"
