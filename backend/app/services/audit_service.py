import structlog
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.security_center import AuditLog
from fastapi import Request

logger = structlog.get_logger("audit")

class AuditService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_action(
        self,
        action: str,
        status: str,
        workspace_id: str,
        severity: str = "INFO",
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        metadata_json: Optional[Dict[str, Any]] = None,
        request: Optional[Request] = None,
    ):
        ip_address = None
        user_agent = None
        if request:
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")

        # 1. Structured JSON stdout logging via structlog
        logger.info(
            f"Audit: {action}",
            action=action,
            status=status,
            severity=severity,
            user_id=user_id,
            workspace_id=workspace_id,
            session_id=session_id,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            **metadata_json if metadata_json else {}
        )

        # 2. PostgreSQL audit log insertion
        audit = AuditLog(
            user_id=user_id,
            workspace_id=workspace_id,
            session_id=session_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
            severity=severity,
            metadata_json=metadata_json
        )
        self.session.add(audit)
        await self.session.commit()
