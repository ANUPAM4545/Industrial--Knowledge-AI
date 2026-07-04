"""
ForgeMind AI — RAG Unit Tests
"""
import pytest

from app.rag.context_builder import ContextBuilder
from app.rag.prompt_builder import PromptBuilder
from app.rag.citation_builder import CitationBuilder
from app.rag.query_processor import QueryProcessor

def test_query_processor():
    processor = QueryProcessor()
    # Basic normalization
    assert processor.process("  test query  ") == "test query"
    
def test_context_builder():
    builder = ContextBuilder()
    
    chunks = [
        {
            "id": "1",
            "score": 0.9,
            "payload": {
                "document_name": "Doc A",
                "text": "This is a test chunk."
            }
        },
        {
            "id": "2",
            "score": 0.8,
            "payload": {
                "document_name": "Doc B",
                "text": "Another chunk."
            }
        }
    ]
    
    context = builder.build(chunks)
    assert "Source: Doc A" in context
    assert "This is a test chunk." in context
    assert "Source: Doc B" in context
    
def test_prompt_builder():
    builder = PromptBuilder()
    sys_prompt = builder.build_system_prompt("Context Data")
    assert "Context Data" in sys_prompt
    assert "never hallucinate" in sys_prompt.lower()
    
    user_prompt = builder.build_user_prompt("What is this?")
    assert "Question: What is this?" in user_prompt

def test_citation_builder():
    builder = CitationBuilder()
    
    chunks = [
        {
            "id": "1",
            "score": 0.95,
            "payload": {
                "document_id": "doc123",
                "document_name": "Manual.pdf",
                "page_number": "5",
                "text": "chunk text"
            }
        }
    ]
    
    citations = builder.build(chunks)
    assert len(citations) == 1
    assert citations[0]["document_name"] == "Manual.pdf"
    assert citations[0]["page_number"] == "5"
    assert citations[0]["similarity_score"] == 0.95
