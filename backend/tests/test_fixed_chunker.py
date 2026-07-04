"""
Tests for Fixed Size Chunker
"""
from app.chunking.fixed_chunker import FixedSizeChunker
from app.chunking.models import ParsedDocument


def test_fixed_chunker_empty_document():
    chunker = FixedSizeChunker(chunk_size=10, chunk_overlap=0)
    doc = ParsedDocument(document_id="1", title="test", full_text="")
    chunks = chunker.chunk(doc)
    assert len(chunks) == 0


def test_fixed_chunker_basic():
    chunker = FixedSizeChunker(chunk_size=10, chunk_overlap=2)
    text = "0123456789ABCDEF"
    doc = ParsedDocument(document_id="1", title="test", full_text=text)
    
    chunks = chunker.chunk(doc)
    
    # 0123456789 (len 10)
    # step size = 10 - 2 = 8
    # chunk 1: 0 to 10 -> "0123456789"
    # chunk 2: 8 to 18 -> "89ABCDEF"
    
    assert len(chunks) == 2
    assert chunks[0].text == "0123456789"
    assert chunks[1].text == "89ABCDEF"
    assert chunks[0].metadata.chunk_number == 1
    assert chunks[1].metadata.chunk_number == 2
    assert chunks[0].document_id == "1"


def test_fixed_chunker_invalid_overlap():
    import pytest
    with pytest.raises(ValueError):
        FixedSizeChunker(chunk_size=10, chunk_overlap=15)
