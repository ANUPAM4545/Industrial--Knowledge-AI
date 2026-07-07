import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.retrieval.vector_retriever import VectorRetriever
from app.retrieval.retrieval_result import retrieval_timings


@pytest.mark.asyncio
async def test_vector_retriever():
    retriever = VectorRetriever(collection_name="test_collection")
    
    mock_embedder = MagicMock()
    mock_embedder.embed_text = AsyncMock(return_value=[0.1, 0.2, 0.3])
    
    mock_vector_store = MagicMock()
    mock_vector_store.search = AsyncMock(return_value=[
        ({"document_id": "doc1", "chunk_index": 1, "text": "chunk text", "page_number": 5, "heading": "Intro"}, 0.95)
    ])
    
    timings = {}
    token = retrieval_timings.set(timings)
    
    try:
        with patch("app.retrieval.vector_retriever.registry.get_embedding_provider", return_value=mock_embedder), \
             patch("app.retrieval.vector_retriever.registry.get_vector_store", return_value=mock_vector_store):
             
             results = await retriever.retrieve("test query", limit=1, filter_dict={"author": "John"})
             
             assert len(results) == 1
             assert results[0]["document_id"] == "doc1"
             assert results[0]["score"] == 0.95
             assert results[0]["page_number"] == 5
             assert results[0]["heading"] == "Intro"
             
             assert "embedding_time_ms" in timings
             assert "vector_search_time_ms" in timings
    finally:
        retrieval_timings.reset(token)
        
    health = await retriever.health_check()
    assert health["status"] == "ok"
