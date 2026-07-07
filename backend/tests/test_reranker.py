import pytest
from app.reranking.placeholder import PlaceholderReranker
from app.reranking.bge_reranker import BGEReranker


@pytest.mark.asyncio
async def test_placeholder_reranker():
    reranker = PlaceholderReranker()
    docs = [
        {"id": 1, "text": "doc1"},
        {"id": 2, "text": "doc2"},
        {"id": 3, "text": "doc3"},
    ]
    reranked = await reranker.rerank("query", docs, top_k=2)
    assert len(reranked) == 2
    assert reranked[0]["id"] == 1
    assert reranked[1]["id"] == 2
    
    health = await reranker.health_check()
    assert health["status"] == "ok"
    assert health["provider"] == "PlaceholderReranker"


@pytest.mark.asyncio
async def test_bge_reranker_placeholder():
    reranker = BGEReranker()
    docs = [
        {"id": 1, "text": "doc1"},
        {"id": 2, "text": "doc2"},
    ]
    reranked = await reranker.rerank("query", docs, top_k=1)
    assert len(reranked) == 1
    
    health = await reranker.health_check()
    assert health["status"] == "ok"
    assert health["provider"] == "BGEReranker"
