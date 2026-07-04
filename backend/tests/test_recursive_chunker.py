"""
Tests for Recursive Chunker
"""
from app.chunking.recursive_chunker import RecursiveChunker
from app.chunking.models import ParsedDocument


def test_recursive_chunker_basic():
    chunker = RecursiveChunker(chunk_size=15, chunk_overlap=0)
    
    # "Hello world.\n\nThis is a test." -> len = 29
    # Paragraph 1: "Hello world." (12)
    # Paragraph 2: "This is a test." (15)
    text = "Hello world.\n\nThis is a test."
    doc = ParsedDocument(document_id="1", title="test", full_text=text)
    
    chunks = chunker.chunk(doc)
    
    assert len(chunks) == 2
    assert chunks[0].text == "Hello world."
    assert chunks[1].text == "This is a test."


def test_recursive_chunker_fallback_to_words():
    chunker = RecursiveChunker(chunk_size=5, chunk_overlap=0)
    
    # "Hello world"
    text = "Hello world"
    doc = ParsedDocument(document_id="1", title="test", full_text=text)
    
    chunks = chunker.chunk(doc)
    
    # "Hello" (5)
    # " world" (6 -> splits to " wor" and "ld" etc if space split fails? Wait, space splits "Hello" and "world")
    # Actually chunk 1: "Hello"
    # chunk 2: "world"
    assert len(chunks) == 2
    assert chunks[0].text.strip() == "Hello"
    assert chunks[1].text.strip() == "world"
