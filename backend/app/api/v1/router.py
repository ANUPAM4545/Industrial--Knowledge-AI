"""
ForgeMind AI — API v1 Router
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, documents, chat, analytics, admin, search, chunks, embeddings, evaluation

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chunks.router, prefix="/documents", tags=["chunks"])
api_router.include_router(embeddings.router, prefix="/documents", tags=["indexing"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["Evaluation"])

