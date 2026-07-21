"""
NEXO — Chunk Repository
"""
from typing import List, Sequence

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.chunking.models import ChunkProcessingSummary, SemanticChunk
from app.models.chunk import Chunk


class ChunkRepository:
    """Repository for accessing and storing chunk data."""

    @staticmethod
    async def save_chunks(db: AsyncSession, document_id: str, semantic_chunks: List[SemanticChunk]) -> None:
        """
        Delete any existing chunks for the document and save the new ones.
        """
        # Clear existing chunks
        stmt = delete(Chunk).where(Chunk.document_id == document_id)
        await db.execute(stmt)

        # Insert new chunks
        db_chunks = []
        for sc in semantic_chunks:
            metadata_json = sc.metadata.model_dump_json()
            db_chunk = Chunk(
                document_id=sc.document_id,
                chunk_index=sc.chunk_index,
                text=sc.text,
                token_count=sc.metadata.token_count,
                character_count=sc.metadata.character_count,
                page_number=sc.metadata.page_number,
                heading=sc.metadata.section_heading,
                metadata_json=metadata_json,
            )
            db_chunks.append(db_chunk)
            
        db.add_all(db_chunks)
        await db.flush()

    @staticmethod
    async def get_chunks_for_document(db: AsyncSession, document_id: str) -> Sequence[Chunk]:
        """Retrieve all chunks for a document ordered by index."""
        stmt = select(Chunk).where(Chunk.document_id == document_id).order_by(Chunk.chunk_index)
        result = await db.execute(stmt)
        return result.scalars().all()

    @staticmethod
    async def search_keyword(db: AsyncSession, query: str, document_ids: List[str], limit: int = 20) -> List[dict]:
        """
        Perform a keyword (lexical) search using PostgreSQL Full Text Search.
        Returns dictionaries compatible with the similarity search results.
        """
        if not document_ids:
            return []
            
        # Use websearch_to_tsquery for better user query handling (handles quotes, OR, -, etc.)
        # and plainto_tsquery as fallback or just use plainto_tsquery
        
        stmt = (
            select(
                Chunk,
                func.ts_rank_cd(
                    func.to_tsvector('english', Chunk.text), 
                    func.plainto_tsquery('english', query)
                ).label('rank')
            )
            .where(Chunk.document_id.in_(document_ids))
            .where(
                func.to_tsvector('english', Chunk.text).op('@@')(func.plainto_tsquery('english', query))
            )
            .order_by(func.ts_rank_cd(
                func.to_tsvector('english', Chunk.text), 
                func.plainto_tsquery('english', query)
            ).desc())
            .limit(limit)
        )
        
        result = await db.execute(stmt)
        rows = result.all()
        
        formatted_results = []
        for chunk, rank in rows:
            formatted_results.append({
                "score": float(rank), # We use rank as the lexical score
                "chunk_id": chunk.id, # Internal DB ID or just use index
                "document_id": chunk.document_id,
                "chunk_index": chunk.chunk_index,
                "text": chunk.text,
                "page_number": chunk.page_number,
                "heading": chunk.heading
            })
            
        return formatted_results

    @staticmethod
    async def get_chunk_summary(db: AsyncSession, document_id: str) -> ChunkProcessingSummary:
        """
        Calculate and return a summary of chunk quality metrics for a document.
        """
        chunks = await ChunkRepository.get_chunks_for_document(db, document_id)
        
        if not chunks:
            return ChunkProcessingSummary(
                document_id=document_id,
                total_chunks=0,
                average_chunk_size_chars=0,
                largest_chunk_chars=0,
                smallest_chunk_chars=0,
                average_overlap_chars=0,
                estimated_embedding_cost_usd=0.0
            )
            
        sizes = [c.character_count for c in chunks]
        total_chunks = len(sizes)
        avg_size = sum(sizes) // total_chunks
        largest = max(sizes)
        smallest = min(sizes)
        
        # Estimate embedding cost
        # Roughly 1 token = 4 chars. BAAI/bge cost is negligible if local, 
        # but standard OpenAI ada v2 is $0.0001 / 1k tokens for reference.
        # Let's say we use a conservative estimate: $0.0001 per 1000 tokens.
        total_tokens = sum(c.token_count for c in chunks)
        cost_usd = (total_tokens / 1000) * 0.0001

        # Calculate average overlap (rough approximation from consecutive chunks)
        # Not perfectly possible without original text, but we can return an estimated overlap
        # since it's configurable. We'll leave it as 0 in DB summary if we don't have the explicit overlap.
        # But wait, we can just say 0 or compute it if we kept track. We'll set it to 0 for now.
        
        return ChunkProcessingSummary(
            document_id=document_id,
            total_chunks=total_chunks,
            average_chunk_size_chars=avg_size,
            largest_chunk_chars=largest,
            smallest_chunk_chars=smallest,
            average_overlap_chars=0,
            estimated_embedding_cost_usd=round(cost_usd, 6)
        )
