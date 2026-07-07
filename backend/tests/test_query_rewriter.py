import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.retrieval.query_rewriter import QueryRewriter

class MockMessage:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content


@pytest.mark.asyncio
async def test_query_rewriter_normalize():
    rewriter = QueryRewriter()
    query = "  How  do   I fix   it?  "
    rewritten = await rewriter.rewrite(query)
    assert rewritten == "How do I fix it?"


@pytest.mark.asyncio
async def test_query_rewriter_with_history():
    rewriter = QueryRewriter()
    chat_history = [
        MockMessage(role="user", content="Where is the hydraulic pump?"),
        MockMessage(role="assistant", content="The hydraulic pump is on the engine block A."),
    ]
    query = "How to replace it?"
    
    mock_llm = MagicMock()
    mock_llm.generate = AsyncMock(return_value="How to replace the hydraulic pump on engine block A?")
    
    with patch("app.retrieval.query_rewriter.registry.get_llm_provider", return_value=mock_llm):
        rewritten = await rewriter.rewrite(query, chat_history)
        assert rewritten == "How to replace the hydraulic pump on engine block A?"
        mock_llm.generate.assert_called_once()


@pytest.mark.asyncio
async def test_query_rewriter_fallback():
    rewriter = QueryRewriter()
    chat_history = [
        MockMessage(role="user", content="Where is the hydraulic pump?"),
    ]
    query = "How to replace it?"
    
    mock_llm = MagicMock()
    mock_llm.generate = AsyncMock(side_effect=Exception("LLM offline"))
    
    with patch("app.retrieval.query_rewriter.registry.get_llm_provider", return_value=mock_llm):
        rewritten = await rewriter.rewrite(query, chat_history)
        assert rewritten == "How to replace it?"
