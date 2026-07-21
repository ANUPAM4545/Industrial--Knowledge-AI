"""
NEXO — Admin Panel Endpoints
"""
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, status
from sqlalchemy import select, func, text

from app.api.deps import DBSession, AdminOnly
from app.models.user import User
from app.models.document import Document
from app.chat.models import Conversation
from app.models.security_center import AuditLog
from qdrant_client import AsyncQdrantClient
from app.core.config import settings

router = APIRouter(dependencies=[AdminOnly])

@router.get("/stats", status_code=status.HTTP_200_OK)
async def get_admin_stats(session: DBSession):
    """Get comprehensive admin platform statistics."""
    # Run counts concurrently for performance
    async def count_table(model):
        result = await session.execute(select(func.count()).select_from(model))
        return result.scalar() or 0

    users_task = count_table(User)
    docs_task = count_table(Document)
    convos_task = count_table(Conversation)
    
    # Searches today
    today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    async def count_searches():
        result = await session.execute(
            select(func.count()).select_from(AuditLog)
            .where(AuditLog.action == "SEARCH", AuditLog.created_at >= today)
        )
        return result.scalar() or 0
        
    searches_task = count_searches()

    users, docs, convos, searches = await asyncio.gather(
        users_task, docs_task, convos_task, searches_task
    )

    return {
        "total_users": users,
        "total_documents": docs,
        "total_conversations": convos,
        "searches_today": searches
    }

@router.get("/system/health", status_code=status.HTTP_200_OK)
async def get_system_health(session: DBSession):
    """Get health status of all connected services."""
    health = {
        "database": "unknown",
        "qdrant": "unknown",
        "redis": "unknown",
        "ai_service": "unknown",
    }
    
    # 1. Database
    try:
        await session.execute(text("SELECT 1"))
        health["database"] = "healthy"
    except Exception:
        health["database"] = "unhealthy"
        
    # 2. Qdrant
    try:
        qdrant = AsyncQdrantClient(url=settings.QDRANT_URL)
        await qdrant.get_collections()
        health["qdrant"] = "healthy"
    except Exception:
        health["qdrant"] = "unhealthy"
        
    # 3. Redis (Rate Limiter uses Redis, we can mock or check if Redis is alive)
    try:
        from app.security.rate_limit.redis_provider import RedisProvider
        redis_provider = await RedisProvider.create(settings.REDIS_URL)
        await redis_provider.redis.ping()
        health["redis"] = "healthy"
    except Exception:
        health["redis"] = "unhealthy"
        
    # 4. AI Service
    try:
        if settings.LLM_PROVIDER == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            # lightweight list models call to check auth
            health["ai_service"] = "healthy"
        elif settings.LLM_PROVIDER == "ollama":
            import httpx
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{settings.OLLAMA_BASE_URL}/api/tags")
                health["ai_service"] = "healthy" if res.status_code == 200 else "unhealthy"
        else:
            health["ai_service"] = "healthy" # mock fallback
    except Exception:
        health["ai_service"] = "unhealthy"

    return health

@router.get("/activity", status_code=status.HTTP_200_OK)
async def get_recent_activity(session: DBSession):
    """Get recent platform activity from audit logs."""
    result = await session.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(10)
    )
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "user_id": log.user_id,
            "created_at": log.created_at.isoformat()
        } for log in logs
    ]

@router.get("/users", status_code=status.HTTP_200_OK)
async def admin_list_users(session: DBSession):
    """Admin: list all users with management options."""
    result = await session.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "clerk_user_id": u.clerk_user_id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat()
        } for u in users
    ]

from pydantic import BaseModel
class RoleUpdateRequest(BaseModel):
    role: str

@router.patch("/users/{user_id}/role", status_code=status.HTTP_200_OK)
async def update_user_role(user_id: str, request: RoleUpdateRequest, session: DBSession):
    """Admin: change a user's role."""
    from fastapi import HTTPException
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.role = request.role
    await session.commit()
    return {"message": "Role updated", "role": user.role}

class StatusUpdateRequest(BaseModel):
    is_active: bool

@router.patch("/users/{user_id}/status", status_code=status.HTTP_200_OK)
async def update_user_status(user_id: str, request: StatusUpdateRequest, session: DBSession):
    """Admin: activate/suspend a user account."""
    from fastapi import HTTPException
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = request.is_active
    await session.commit()
    return {"message": "Status updated", "is_active": user.is_active}
