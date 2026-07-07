from fastapi import APIRouter, Depends, Query, status, HTTPException
from typing import List

from app.api.deps import DBSession, AdminOnly, CurrentUser
from app.security.security_center.schemas import TimelineResponse, AuditLogResponse
from app.security.security_center.repository import SecurityCenterRepository
from app.security.security_center.session_service import SessionService
from app.security.security_center.statistics_service import StatisticsService

router = APIRouter(tags=["Security Center"])

@router.get("/timeline", response_model=TimelineResponse, dependencies=[AdminOnly])
async def get_security_timeline(
    session: DBSession,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Query(None),
    severity: str = Query(None)
):
    """
    Get unified security timeline (AI, Rate Limit, Events).
    """
    repo = SecurityCenterRepository(session)
    events = await repo.get_timeline_events(limit, offset, user_id, severity)
    # Note: total count requires a separate COUNT(*) query in production, omitted for brevity here
    return TimelineResponse(
        events=events,
        total=1000, # Mocked total
        page=(offset // limit) + 1,
        page_size=limit
    )

@router.get("/audit-logs", response_model=List[AuditLogResponse], dependencies=[AdminOnly])
async def get_audit_logs(
    session: DBSession,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    repo = SecurityCenterRepository(session)
    logs = await repo.get_audit_logs(limit, offset)
    return [
        AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            old_value=log.old_value,
            new_value=log.new_value,
            ip_address=log.ip_address,
            created_at=log.created_at
        ) for log in logs
    ]

@router.get("/sessions", dependencies=[AdminOnly])
async def get_active_sessions(
    session: DBSession,
    limit: int = Query(50),
    offset: int = Query(0)
):
    repo = SecurityCenterRepository(session)
    sessions = await repo.get_active_sessions(limit, offset)
    return sessions

@router.post("/sessions/{session_id}/terminate", dependencies=[AdminOnly])
async def terminate_session(
    session_id: str,
    current_user: CurrentUser,
    session: DBSession
):
    service = SessionService(session)
    success = await service.terminate_session(session_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "success", "message": "Session terminated"}

@router.get("/stats", dependencies=[AdminOnly])
async def get_dashboard_stats(
    session: DBSession
):
    service = StatisticsService(session)
    return await service.get_dashboard_stats()
