"""
NEXO — Analytics Endpoints
"""
from fastapi import APIRouter, Query, status

router = APIRouter()


@router.get("/dashboard", status_code=status.HTTP_200_OK)
async def get_dashboard_stats():
    """
    Get platform-level KPI cards for the main dashboard:
    - Total documents, users, searches, AI conversations
    - Knowledge base health score
    TODO: Aggregate queries across all event tables.
    """
    # Placeholder response structure
    return {
        "total_documents": 0,
        "total_users": 0,
        "total_searches": 0,
        "total_conversations": 0,
        "knowledge_health_score": 0,
        "documents_by_status": {},
        "searches_last_7_days": [],
        "conversations_last_7_days": [],
    }


@router.get("/usage", status_code=status.HTTP_200_OK)
async def get_usage_analytics(
    period: str = Query("7d", regex="^(1d|7d|30d|90d)$"),
):
    """
    Get time-series usage data (searches and chats over time).
    TODO: Implement time-bucket aggregation queries.
    """
    raise NotImplementedError("Usage analytics not yet implemented")


@router.get("/documents", status_code=status.HTTP_200_OK)
async def get_document_analytics():
    """
    Get document-level analytics (most searched, most cited, etc.)
    TODO: Implement document analytics aggregation.
    """
    raise NotImplementedError("Document analytics not yet implemented")


@router.get("/users", status_code=status.HTTP_200_OK)
async def get_user_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d)$"),
):
    """
    Get user engagement analytics.
    Admin only.
    TODO: Implement user activity aggregation.
    """
    raise NotImplementedError("User analytics not yet implemented")
