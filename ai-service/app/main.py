"""
ForgeMind AI — AI Service Entry Point
LangChain-powered RAG microservice.
"""
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import ai_router
from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize AI service resources on startup."""
    logger.info("Starting ForgeMind AI Service", version=settings.APP_VERSION)
    # TODO: Initialize embedding model, Qdrant client, LangChain chains
    # from app.embeddings.manager import EmbeddingManager
    # app.state.embedding_manager = EmbeddingManager()
    # await app.state.embedding_manager.initialize()
    yield
    logger.info("Shutting down ForgeMind AI Service")


app = FastAPI(
    title=f"{settings.APP_NAME} — AI Service",
    description="RAG pipeline, embedding, and vector search service",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Internal service — restricted at nginx level
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/api")


@app.get("/health", include_in_schema=False)
async def health():
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "ai-service",
            "version": settings.APP_VERSION,
        }
    )
