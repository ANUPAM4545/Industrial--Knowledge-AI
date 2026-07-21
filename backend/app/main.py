"""
NEXO — Backend Application Entry Point
"""
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from app.security.event_bus import SecurityEventBus
from app.security.security_center.event_handlers import register_security_handlers
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.security.rate_limit.middleware import RateLimitMiddleware
from app.security.rate_limit.exceptions import RateLimitExceeded

configure_logging()
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting NEXO Backend", version=settings.APP_VERSION)
    register_security_handlers()
    await SecurityEventBus.start_worker()
    # TODO: Initialize DB connection pool, Qdrant client, etc.
    yield
    # TODO: Close connections on shutdown
    await SecurityEventBus.stop_worker()
    logger.info("Shutting down NEXO Backend")


def create_application() -> FastAPI:
    """Application factory."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="NEXO — Industrial Knowledge Intelligence Platform API",
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.APP_DEBUG else None,
        redoc_url="/redoc" if settings.APP_DEBUG else None,
        openapi_url="/openapi.json" if settings.APP_DEBUG else None,
        lifespan=lifespan,
    )

    # ─── Middleware ───────────────────────────────────────────────
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ─── Exception Handlers ──────────────────────────────────────
    register_exception_handlers(app)
    
    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_exception_handler(request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail,
            headers=exc.headers
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
