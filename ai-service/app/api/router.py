"""
NEXO — AI Service API Router
"""
from fastapi import APIRouter

from app.api import embeddings, rag, search, chat

ai_router = APIRouter()

ai_router.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings"])
ai_router.include_router(rag.router, prefix="/rag", tags=["RAG Pipeline"])
ai_router.include_router(search.router, prefix="/search", tags=["Vector Search"])
ai_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
