import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.retrieval.keyword_provider import RankBM25Provider
from app.retrieval.keyword_retriever import KeywordRetriever
from app.retrieval.retrieval_result import retrieval_timings


@pytest.mark.asyncio
async def test_rank_bm25_provider():
    provider = RankBM25Provider()
    docs = [
        {"document_id": "doc1", "chunk_index": 1, "text": "Replace the hydraulic pump", "author": "John"},
        {"document_id": "doc2", "chunk_index": 2, "text": "Clean the engine block", "author": "Alice"},
        {"document_id": "doc3", "chunk_index": 3, "text": "Check the battery voltage", "author": "Bob"},
        {"document_id": "doc4", "chunk_index": 4, "text": "Inspect the tires and brakes", "author": "Charlie"},
        {"document_id": "doc5", "chunk_index": 5, "text": "Refill the coolant reservoir", "author": "David"},
    ]
    
    await provider.index_documents("test_col", docs)
    
    results = await provider.search("test_col", "hydraulic pump", limit=5)
    assert len(results) == 1
    assert results[0][0]["document_id"] == "doc1"
    
    results_filtered = await provider.search("test_col", "hydraulic pump", limit=5, filter_dict={"author": "Alice"})
    assert len(results_filtered) == 0
    
    health = await provider.health_check()
    assert health["status"] == "ok"
    assert health["indices_loaded"] == 1


@pytest.mark.asyncio
async def test_keyword_retriever():
    retriever = KeywordRetriever(collection_name="test_col")
    
    mock_provider = MagicMock()
    mock_provider.search = AsyncMock(return_value=[
        ({"document_id": "doc1", "chunk_index": 1, "text": "text", "page_number": 3, "heading": "Steps"}, 12.5)
    ])
    
    timings = {}
    token = retrieval_timings.set(timings)
    
    try:
        with patch("app.retrieval.keyword_retriever.registry.get_keyword_provider", return_value=mock_provider):
            results = await retriever.retrieve("query", limit=1)
            assert len(results) == 1
            assert results[0]["document_id"] == "doc1"
            assert results[0]["score"] == 12.5
            assert "keyword_search_time_ms" in timings
    finally:
        retrieval_timings.reset(token)
        
    health = await retriever.health_check()
    assert health["status"] == "ok"
