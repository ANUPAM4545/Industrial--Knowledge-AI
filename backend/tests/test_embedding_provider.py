import pytest
from unittest.mock import AsyncMock, patch

from app.embeddings.fastembed_provider import FastEmbedProvider
from app.vectorstore.qdrant_store import QdrantVectorStore


@pytest.fixture
def fastembed_provider():
    with patch("app.embeddings.fastembed_provider.TextEmbedding") as mock_model:
        provider = FastEmbedProvider(model_name="BAAI/bge-small-en-v1.5")
        provider.model = mock_model
        yield provider


@pytest.mark.asyncio
async def test_fastembed_health(fastembed_provider):
    health = await fastembed_provider.health_check()
    assert health["provider"] == "FastEmbed"
    assert health["status"] == "healthy"
    assert health["dimension"] == 384


@pytest.mark.asyncio
async def test_fastembed_dimension(fastembed_provider):
    assert fastembed_provider.dimension() == 384


@pytest.fixture
def qdrant_store():
    with patch("app.vectorstore.qdrant_store.AsyncQdrantClient") as mock_client:
        store = QdrantVectorStore(url="http://mock-qdrant")
        store._client = mock_client()
        yield store


@pytest.mark.asyncio
async def test_qdrant_store_health(qdrant_store):
    qdrant_store._client.get_collections = AsyncMock()
    health = await qdrant_store.health_check()
    
    assert health["provider"] == "Qdrant"
    assert health["status"] == "healthy"
