"""
ForgeMind AI — Database Index Statistics Telemetry
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document
from app.models.chunk import Chunk


class RuntimeService:
    """Queries DB to report document and vector indexing quantities."""

    @staticmethod
    async def get_index_statistics(db: AsyncSession) -> dict:
        try:
            # Count documents
            doc_query = select(func.count()).select_from(Document)
            doc_result = await db.execute(doc_query)
            doc_count = doc_result.scalar() or 0
        except Exception:
            doc_count = 0

        try:
            # Count chunks (matching vectors stored)
            chunk_query = select(func.count()).select_from(Chunk)
            chunk_result = await db.execute(chunk_query)
            chunk_count = chunk_result.scalar() or 0
        except Exception:
            chunk_count = 0

        return {
            "documents_indexed": doc_count,
            "vectors_stored": chunk_count
        }
