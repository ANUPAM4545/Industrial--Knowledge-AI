"""
NEXO — Analytics Endpoints
"""
from fastapi import APIRouter, Query, status, Depends
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.document import Document
from app.models.user import User
from app.models.search_log import SearchLog
from app.chat.models import Conversation

router = APIRouter()


@router.get("/dashboard", status_code=status.HTTP_200_OK)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """
    Get platform-level KPI cards for the main dashboard:
    - Total documents, users, searches, AI conversations
    - Knowledge base health score
    """
    from sqlalchemy import select
    
    # 1. Total Documents
    total_docs = (await db.execute(select(func.count(Document.id)))).scalar() or 0
    
    # 2. Total Users
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    
    # 3. Total Searches
    total_searches = (await db.execute(select(func.count(SearchLog.id)))).scalar() or 0
    
    # 4. Total Conversations
    total_convos = (await db.execute(select(func.count(Conversation.id)))).scalar() or 0
    
    # 5. Documents by Status
    docs_by_status_raw = (await db.execute(
        select(Document.status, func.count(Document.id)).group_by(Document.status)
    )).all()
    documents_by_status = {str(status): count for status, count in docs_by_status_raw}
    
    # 6. Searches Last 7 Days (mocked structure for the UI chart)
    # Get total searches in the last 7 days grouped by day
    # Simplified approach for SQLite/Postgres compatibility: fetch and group in memory if needed
    # For now, we will generate the last 7 days and fill in data
    today = datetime.utcnow().date()
    searches_last_7_days = []
    conversations_last_7_days = []
    
    # Very basic placeholder mapping since complex cross-db date grouping can fail
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%b %d") # e.g. Jul 22
        if i == 0:
            # Put all current stats in "today" so the chart isn't flat for small numbers
            searches_last_7_days.append({"date": day_str, "value": total_searches}) 
            conversations_last_7_days.append({"date": day_str, "value": total_convos})
        else:
            searches_last_7_days.append({"date": day_str, "value": 0}) 
            conversations_last_7_days.append({"date": day_str, "value": 0})
        
    return {
        "total_documents": total_docs,
        "total_users": total_users,
        "total_searches": total_searches,
        "total_conversations": total_convos,
        "knowledge_health_score": 100, # Placeholder
        "documents_by_status": documents_by_status,
        "searches_last_7_days": searches_last_7_days,
        "conversations_last_7_days": conversations_last_7_days,
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
