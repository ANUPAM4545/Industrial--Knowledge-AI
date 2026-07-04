"""
Tests for Heading Chunker
"""
from app.chunking.heading_chunker import HeadingChunker
from app.chunking.models import ParsedDocument, ParsedSection


def test_heading_chunker_basic():
    chunker = HeadingChunker(max_chunk_size=100, chunk_overlap=0)
    
    doc = ParsedDocument(
        document_id="1",
        title="test",
        full_text="",
        sections=[
            ParsedSection(heading="Introduction", text="This is intro."),
            ParsedSection(heading="Conclusion", text="This is conclusion.")
        ]
    )
    
    chunks = chunker.chunk(doc)
    
    assert len(chunks) == 2
    assert chunks[0].text == "This is intro."
    assert chunks[0].metadata.section_heading == "Introduction"
    
    assert chunks[1].text == "This is conclusion."
    assert chunks[1].metadata.section_heading == "Conclusion"


def test_heading_chunker_fallback():
    chunker = HeadingChunker(max_chunk_size=10, chunk_overlap=0)
    
    doc = ParsedDocument(
        document_id="1",
        title="test",
        full_text="1234567890ABCD",
        sections=[]
    )
    
    chunks = chunker.chunk(doc)
    
    # Fallback to recursive chunker
    assert len(chunks) == 2
    assert chunks[0].text == "1234567890"
    assert chunks[1].text == "ABCD"
