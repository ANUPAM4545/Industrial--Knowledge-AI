"""
NEXO — RAG Pipeline Endpoints
POST /rag/query — Full RAG query with citations
"""
from typing import List, Optional
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter()


class RAGQueryRequest(BaseModel):
    query: str
    document_ids: Optional[List[str]] = None
    top_k: int = 5
    conversation_history: Optional[List[dict]] = None
    stream: bool = False


class CitationResult(BaseModel):
    document_id: str
    document_title: str
    page_number: Optional[int]
    chunk_text: str
    score: float


class RAGQueryResponse(BaseModel):
    answer: str
    citations: List[CitationResult]
    model_used: str
    tokens_input: int
    tokens_output: int
    retrieval_time_ms: int
    generation_time_ms: int


@router.post("/query", response_model=RAGQueryResponse, status_code=status.HTTP_200_OK)
async def rag_query(body: RAGQueryRequest):
    """
    Execute the full RAG pipeline:
    1. Embed the user query using BAAI/bge
    2. Retrieve top-K relevant chunks from Qdrant
    3. Build prompt with retrieved context + conversation history
    4. Generate answer using the LLM
    5. Return answer with source citations
    TODO: Implement LangChain RAG chain.
    """
    raise NotImplementedError("RAG query not yet implemented")
