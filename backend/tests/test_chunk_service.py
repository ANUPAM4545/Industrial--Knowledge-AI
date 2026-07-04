"""
Tests for Chunk Service
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

from app.chunking.models import ParsedDocument, ChunkProcessingSummary
from app.services.chunk_service import ChunkService


@pytest.mark.asyncio
@patch("app.repositories.chunk_repository.ChunkRepository.save_chunks")
@patch("app.repositories.chunk_repository.ChunkRepository.get_chunk_summary")
async def test_process_document(mock_get_summary, mock_save_chunks):
    mock_get_summary.return_value = ChunkProcessingSummary(
        document_id="1",
        total_chunks=2,
        average_chunk_size_chars=50,
        largest_chunk_chars=60,
        smallest_chunk_chars=40,
        average_overlap_chars=0,
        estimated_embedding_cost_usd=0.01,
    )
    
    doc = ParsedDocument(
        document_id="1",
        title="test",
        full_text="This is a test document. It is very short.",
    )
    
    mock_db = MagicMock()
    
    summary = await ChunkService.process_document(
        db=mock_db,
        document=doc,
    )
    
    mock_save_chunks.assert_called_once()
    mock_get_summary.assert_called_once()
    
    assert summary.total_chunks == 2
