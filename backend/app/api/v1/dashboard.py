"""
NEXO — Dashboard REST Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dashboard.dashboard_service import DashboardService
from app.dashboard.analytics_service import DashboardAnalyticsService
from app.dashboard.insights_service import DashboardInsightsService
from app.dashboard.models import (
    DashboardOverview,
    KnowledgeHealth,
    SearchAnalytics,
    SystemHealth,
    DashboardTrends,
    SmartInsight,
)
from sqlalchemy import select
from app.models.document import Document
from sqlalchemy import func
from app.models.chunk import Chunk

router = APIRouter()


@router.get("/overview", response_model=DashboardOverview, status_code=status.HTTP_200_OK)
async def get_overview(db: AsyncSession = Depends(get_db)):
    """
    Get general dashboard KPI and database totals.
    """
    try:
        return await DashboardService.get_overview(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/knowledge", response_model=KnowledgeHealth, status_code=status.HTTP_200_OK)
async def get_knowledge(db: AsyncSession = Depends(get_db)):
    """
    Get quality breakdown of ingested documents.
    """
    try:
        return await DashboardService.get_knowledge_health(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search", response_model=SearchAnalytics, status_code=status.HTTP_200_OK)
async def get_search():
    """
    Get user query frequencies, keywords, and citations metrics.
    """
    try:
        return DashboardAnalyticsService.get_search_analytics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/system", response_model=SystemHealth, status_code=status.HTTP_200_OK)
async def get_system():
    """
    Get configured AI providers and component heartbeats.
    """
    try:
        return await DashboardService.get_system_health()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends", response_model=DashboardTrends, status_code=status.HTTP_200_OK)
async def get_trends(db: AsyncSession = Depends(get_db)):
    """
    Get time-series trends values for charts rendering.
    """
    try:
        return await DashboardAnalyticsService.get_trends(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights", response_model=List[SmartInsight], status_code=status.HTTP_200_OK)
async def get_insights(db: AsyncSession = Depends(get_db)):
    """
    Get automated quality insights.
    """
    try:
        return await DashboardInsightsService.get_insights(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
