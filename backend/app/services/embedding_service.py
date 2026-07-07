"""
NEXO — Embedding Service
"""
from datetime import datetime
from typing import Dict, Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.registry import registry
from app.models.document import Document, DocumentStatus
from app.repositories.chunk_repository import ChunkRepository


class EmbeddingService:
    """Service for handling document vector embeddings."""

    @staticmethod
    async def index_document(db: AsyncSession, document_id: str) -> Dict[str, Any]:
        """
        Embed all chunks of a document and index them in the vector store.
        """
        # 1. Fetch document
        stmt = select(Document).where(Document.id == document_id)
        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            raise ValueError(f"Document {document_id} not found.")

        # Update status
        document.index_status = "INDEXING"
        await db.commit()

        try:
            # 2. Fetch chunks
            chunks = await ChunkRepository.get_chunks_for_document(db, document_id)
            if not chunks:
                raise ValueError(f"No chunks found for document {document_id}. Ensure chunking is complete.")

            # 3. Get Providers
            embedder = registry.get_embedding_provider()
            vector_store = registry.get_vector_store()
            
            # 4. Prepare data for embedding
            texts_to_embed = [chunk.text for chunk in chunks]
            chunk_ids = [str(chunk.id) for chunk in chunks]
            
            payloads = [
                {
                    "document_id": document_id,
                    "chunk_index": chunk.chunk_index,
                    "text": chunk.text,
                    "page_number": chunk.page_number,
                    "heading": chunk.heading
                }
                for chunk in chunks
            ]
            
            # 5. Generate embeddings
            vectors = await embedder.embed_batch(texts_to_embed)
            
            # 6. Ensure collection exists
            collection_name = document.qdrant_collection or "documents"
            await vector_store.create_collection(
                collection_name=collection_name, 
                dimension=embedder.dimension()
            )
            
            # 7. Upsert to vector store
            await vector_store.upsert(
                collection_name=collection_name,
                ids=chunk_ids,
                vectors=vectors,
                payloads=payloads
            )
            
            # 8. Update document metadata
            document.embedding_model = embedder.model_name()
            document.embedding_dimension = embedder.dimension()
            document.vector_count = len(vectors)
            document.indexed_at = datetime.utcnow().isoformat()
            document.index_status = "COMPLETED"
            document.status = DocumentStatus.READY
            document.qdrant_collection = collection_name
            await db.commit()
            
            return {
                "document_id": document_id,
                "status": "success",
                "vectors_indexed": len(vectors),
                "model": embedder.model_name(),
                "collection": collection_name
            }
            
        except Exception as e:
            # Revert status on failure
            document.index_status = "FAILED"
            document.processing_error = str(e)
            document.status = DocumentStatus.FAILED
            await db.commit()
            raise e

    @staticmethod
    async def get_index_status(db: AsyncSession, document_id: str) -> Dict[str, Any]:
        """Get current indexing status of a document."""
        stmt = select(Document).where(Document.id == document_id)
        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            raise ValueError(f"Document {document_id} not found.")
            
        return {
            "document_id": document_id,
            "status": document.status.value,
            "index_status": document.index_status,
            "vectors": document.vector_count or 0,
            "model": document.embedding_model,
            "indexed_at": document.indexed_at
        }
