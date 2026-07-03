"""
ForgeMind AI — API v1 Router
"""
from fastapi import APIRouter

from app.api.v1 import auth, users, documents, chat, analytics, admin, search

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
