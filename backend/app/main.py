"""
ForgeMind AI — Backend Application Entry Point
"""
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.session import engine

configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting ForgeMind AI Backend", version=settings.APP_VERSION)
    # TODO: Initialize DB connection pool, Qdrant client, etc.
    yield
    # TODO: Close connections on shutdown
    logger.info("Shutting down ForgeMind AI Backend")


def create_application() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="ForgeMind AI — Industrial Knowledge Intelligence Platform API",
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.APP_DEBUG else None,
        redoc_url="/redoc" if settings.APP_DEBUG else None,
        openapi_url="/openapi.json" if settings.APP_DEBUG else None,
        lifespan=lifespan,
    )

    # ─── Middleware ───────────────────────────────────────────────
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ─── Routers ─────────────────────────────────────────────────
    app.include_router(api_router, prefix="/api/v1")

    # ─── Health Check ────────────────────────────────────────────
    @app.get("/health", tags=["health"], include_in_schema=False)
    async def health_check():
        return JSONResponse(
            content={
                "status": "healthy",
                "service": settings.APP_NAME,
                "version": settings.APP_VERSION,
            }
        )

    return app


app = create_application()
