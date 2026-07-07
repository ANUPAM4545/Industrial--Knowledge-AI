"""
NEXO — Chunk Service
"""
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.chunking.models import ChunkProcessingSummary, ParsedDocument
from app.chunking.strategy_factory import ChunkingStrategyType, ChunkStrategyFactory
from app.repositories.chunk_repository import ChunkRepository
from app.models.chunk import Chunk


class ChunkService:
    """Service for semantic chunking operations."""

    @staticmethod
    async def process_document(
        db: AsyncSession,
        document: ParsedDocument,
        strategy_type: ChunkingStrategyType = ChunkingStrategyType.RECURSIVE,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> ChunkProcessingSummary:
        """
        Process a ParsedDocument into chunks and save them to the database.
        
        Args:
            db: Async database session.
            document: The document to chunk.
            strategy_type: Which chunking algorithm to use.
            chunk_size: Target size in characters for each chunk.
            chunk_overlap: Target overlap in characters.
            
        Returns:
            A summary of the processing results.
        """
        # Select strategy
        strategy = ChunkStrategyFactory.get_strategy(
            strategy_type=strategy_type,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )
        
        # Generate chunks
        semantic_chunks = strategy.chunk(document)
        
        # Save chunks
        await ChunkRepository.save_chunks(db, document.document_id, semantic_chunks)
        
        # Get and update summary
        summary = await ChunkRepository.get_chunk_summary(db, document.document_id)
        
        # Update summary with overlap since repository cannot accurately guess it without original text
        summary.average_overlap_chars = chunk_overlap if len(semantic_chunks) > 1 else 0
        
        return summary

    @staticmethod
    async def get_document_chunks(db: AsyncSession, document_id: str) -> List[Chunk]:
        """Retrieve all chunks for a document."""
        chunks = await ChunkRepository.get_chunks_for_document(db, document_id)
        return list(chunks)

    @staticmethod
    async def get_document_chunk_summary(db: AsyncSession, document_id: str) -> ChunkProcessingSummary:
        """Retrieve chunk summary statistics for a document."""
        return await ChunkRepository.get_chunk_summary(db, document_id)
