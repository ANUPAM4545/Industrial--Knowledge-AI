from fastapi import APIRouter, Depends, status, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.api.deps import get_db, CurrentUser
from app.security.security_service import SecurityService
from app.security.interfaces import SecurityDecision
from app.models.security_log import SecurityLog

router = APIRouter()

# ─── Schemas ────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    prompt: str
    conversation_id: Optional[str] = None
    
class AnalyzeResponse(BaseModel):
    decision: SecurityDecision
    risk_score: float
    triggered_rules: List[str]
    latency_ms: float
    user_message: str

class ScanDocumentRequest(BaseModel):
    text_content: str
    
class StatisticsResponse(BaseModel):
    total_scans: int
    blocked_requests: int
    average_risk_score: float

class LogEntry(BaseModel):
    id: str
    event_type: str
    action_taken: str
    risk_score: float
    triggered_rules: List[str]
    created_at: str

class LogsResponse(BaseModel):
    items: List[LogEntry]
    total: int

# ─── Endpoints ──────────────────────────────────────────────────────

def get_security_service(session: AsyncSession = Depends(get_db)) -> SecurityService:
    return SecurityService(session)

@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analyze a prompt for security threats",
)
async def analyze_prompt(
    payload: AnalyzeRequest,
    current_user: CurrentUser,
    security_service: SecurityService = Depends(get_security_service)
) -> AnalyzeResponse:
    
    result = await security_service.scan_chat_input(
        user_prompt=payload.prompt,
        user_id=current_user.id,
        conversation_id=payload.conversation_id
    )
    
    user_message = "Safe"
    if result.decision == SecurityDecision.BLOCK:
        user_message = "This request could not be completed because it conflicts with the platform's safety and security policies."
    elif result.decision == SecurityDecision.REVIEW:
        user_message = "This request is potentially sensitive. Please rephrase."
        
    return AnalyzeResponse(
        decision=result.decision,
        risk_score=result.risk_score,
        triggered_rules=result.triggered_rules,
        latency_ms=result.latency_ms,
        user_message=user_message
    )

@router.post(
    "/scan-document",
    response_model=AnalyzeResponse,
    summary="Scan document text for malicious payloads",
)
async def scan_document(
    payload: ScanDocumentRequest,
    current_user: CurrentUser,
    security_service: SecurityService = Depends(get_security_service)
) -> AnalyzeResponse:
    result = await security_service.scan_document_upload(
        text_content=payload.text_content,
        user_id=current_user.id
    )
    
    user_message = "Safe"
    if result.decision == SecurityDecision.BLOCK:
        user_message = "Document blocked due to malicious payload."
        
    return AnalyzeResponse(
        decision=result.decision,
        risk_score=result.risk_score,
        triggered_rules=result.triggered_rules,
        latency_ms=result.latency_ms,
        user_message=user_message
    )

@router.get(
    "/logs",
    response_model=LogsResponse,
    summary="Get recent security logs",
)
async def get_logs(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db),
    limit: int = 50
) -> LogsResponse:
    # Only admins should see all logs, but for now we'll allow access for demo
    stmt = select(SecurityLog).order_by(desc(SecurityLog.created_at)).limit(limit)
    result = await session.execute(stmt)
    logs = result.scalars().all()
    
    items = []
    for log in logs:
        items.append(LogEntry(
            id=str(log.id),
            event_type=log.event_type,
            action_taken=log.action_taken,
            risk_score=log.risk_score,
            triggered_rules=log.triggered_rules or [],
            created_at=log.created_at.isoformat()
        ))
        
    return LogsResponse(items=items, total=len(items))

@router.get(
    "/statistics",
    response_model=StatisticsResponse,
    summary="Get aggregate security statistics",
)
async def get_statistics(
    current_user: CurrentUser,
    session: AsyncSession = Depends(get_db)
) -> StatisticsResponse:
    
    # Total scans
    count_stmt = select(func.count(SecurityLog.id))
    total_scans = (await session.execute(count_stmt)).scalar() or 0
    
    # Blocked requests
    blocked_stmt = select(func.count(SecurityLog.id)).where(SecurityLog.action_taken == SecurityDecision.BLOCK.value)
    blocked_requests = (await session.execute(blocked_stmt)).scalar() or 0
    
    # Avg risk score
    avg_stmt = select(func.avg(SecurityLog.risk_score))
    avg_score = (await session.execute(avg_stmt)).scalar() or 0.0
    
    return StatisticsResponse(
        total_scans=total_scans,
        blocked_requests=blocked_requests,
        average_risk_score=round(avg_score, 2)
    )
