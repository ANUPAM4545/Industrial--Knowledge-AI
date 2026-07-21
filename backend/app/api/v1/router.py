"""
NEXO — API v1 Router
"""
from fastapi import APIRouter

from app.api.v1 import (
    admin,
    analytics,
    auth,
    chat,
    chunks,
    dashboard,
    documents,
    embeddings,
    evaluation,
    graph,
    marketing,
    notifications,
    observability,
    search,
    users,
    viewer,
    security,
    workspaces,
    workflows,
)
from app.security.security_center import router as security_center_router

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(chunks.router, prefix="/documents", tags=["chunks"])
api_router.include_router(embeddings.router, prefix="/documents", tags=["indexing"])
api_router.include_router(viewer.router, prefix="/documents", tags=["viewer"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(graph.router, prefix="/graph", tags=["graph"])
api_router.include_router(search.router, prefix="/search", tags=["Search"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["Evaluation"])
api_router.include_router(observability.router, prefix="/ai", tags=["Observability"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(marketing.router, prefix="/marketing", tags=["Marketing"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(security.router, prefix="/security", tags=["Security"])
api_router.include_router(security_center_router.router, prefix="/security-center", tags=["Security Center"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
