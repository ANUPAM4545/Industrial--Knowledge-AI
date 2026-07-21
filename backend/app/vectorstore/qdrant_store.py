"""
NEXO — Qdrant Vector Store
"""
import uuid
from typing import Any, Dict, List, Optional, Tuple

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qmodels

from app.ai.interfaces import VectorStore
from app.core.config import settings
from app.embeddings.exceptions import CollectionError, VectorIndexError


class QdrantVectorStore(VectorStore):
    """
    Qdrant implementation of the VectorStore interface.
    Handles async communication with the Qdrant server.
    """
    
    def __init__(self, url: str = None):
        self._url = url or settings.QDRANT_URL
        api_key = getattr(settings, "QDRANT_API_KEY", None)
        self._client = AsyncQdrantClient(url=self._url, api_key=api_key if api_key else None)

    async def create_collection(self, collection_name: str, dimension: int) -> None:
        """Create a new collection if it doesn't exist."""
        try:
            exists = await self.collection_exists(collection_name)
            if not exists:
                await self._client.create_collection(
                    collection_name=collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=dimension,
                        distance=qmodels.Distance.COSINE
                    )
                )
        except Exception as e:
            raise CollectionError(f"Failed to create collection {collection_name}: {e}")

    async def delete_collection(self, collection_name: str) -> None:
        """Delete an entire collection."""
        try:
            await self._client.delete_collection(collection_name)
        except Exception as e:
            raise CollectionError(f"Failed to delete collection {collection_name}: {e}")

    async def upsert(self, collection_name: str, ids: List[str], vectors: List[List[float]], payloads: List[Dict[str, Any]]) -> None:
        """Upsert vectors with metadata."""
        if not (len(ids) == len(vectors) == len(payloads)):
            raise ValueError("Length of ids, vectors, and payloads must match.")
            
        points = []
        for i in range(len(ids)):
            # Qdrant expects valid UUIDs or integers as IDs
            # Ensure ID is a valid UUID, or generate one based on the string ID
            try:
                # Test if it's already a valid UUID
                uuid_val = str(uuid.UUID(ids[i]))
            except ValueError:
                # If not, generate a UUID version 5 based on the namespace and ID
                uuid_val = str(uuid.uuid5(uuid.NAMESPACE_OID, ids[i]))

            points.append(qmodels.PointStruct(
                id=uuid_val,
                vector=vectors[i],
                payload=payloads[i]
            ))
            
        try:
            await self._client.upsert(
                collection_name=collection_name,
                points=points
            )
        except Exception as e:
            raise VectorIndexError(f"Failed to upsert vectors to {collection_name}: {e}")

    async def search(self, collection_name: str, query_vector: List[float], limit: int = 5, filter_dict: Optional[Dict[str, Any]] = None) -> List[Tuple[Dict[str, Any], float]]:
        """Search for similar vectors."""
        qdrant_filter = None
        if filter_dict:
            conditions = []
            for key, value in filter_dict.items():
                if isinstance(value, list):
                    match_condition = qmodels.MatchAny(any=value)
                else:
                    match_condition = qmodels.MatchValue(value=value)
                conditions.append(
                    qmodels.FieldCondition(
                        key=key,
                        match=match_condition
                    )
                )
            qdrant_filter = qmodels.Filter(must=conditions)
            
        try:
            results = await self._client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=limit,
                query_filter=qdrant_filter
            )
            
            return [(hit.payload or {}, hit.score) for hit in results]
        except Exception as e:
            raise VectorIndexError(f"Failed to search collection {collection_name}: {e}")

    async def delete_vectors(self, collection_name: str, filter_dict: Dict[str, Any]) -> None:
        """Delete vectors matching a filter."""
        conditions = []
        for key, value in filter_dict.items():
            conditions.append(
                qmodels.FieldCondition(
                    key=key,
                    match=qmodels.MatchValue(value=value)
                )
            )
        qdrant_filter = qmodels.Filter(must=conditions)
        
        try:
            await self._client.delete(
                collection_name=collection_name,
                points_selector=qmodels.FilterSelector(filter=qdrant_filter)
            )
        except Exception as e:
            raise VectorIndexError(f"Failed to delete vectors from {collection_name}: {e}")

    async def collection_exists(self, collection_name: str) -> bool:
        """Check if a collection exists."""
        try:
            return await self._client.collection_exists(collection_name)
        except Exception:
            return False

    async def health_check(self) -> Dict[str, Any]:
        """Check if vector store is available."""
        try:
            # Just try to get collections as a ping
            await self._client.get_collections()
            status = "healthy"
        except Exception:
            status = "unhealthy"
            
        return {
            "provider": "Qdrant",
            "url": self._url,
            "status": status
        }
