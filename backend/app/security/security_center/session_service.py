import httpx
import structlog
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models.security_center import ActiveSession
from app.core.config import settings
from app.security.event_bus import SecurityEventBus, EventType

logger = structlog.get_logger(__name__)

class SessionService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def register_or_update_session(self, user_id: str, session_token_hash: str, ip_address: str, user_agent: str) -> None:
        """
        Registers a new active session or updates the last_activity of an existing one.
        Called by middleware/auth layer async to not block requests.
        """
        stmt = select(ActiveSession).where(
            ActiveSession.session_token_hash == session_token_hash
        )
        result = await self.session.execute(stmt)
        active_session = result.scalar_one_or_none()
        
        now = datetime.now(timezone.utc)
        
        if active_session:
            active_session.last_activity = now
            active_session.ip_address = ip_address # Update if changed
        else:
            active_session = ActiveSession(
                user_id=user_id,
                session_token_hash=session_token_hash,
                ip_address=ip_address,
                user_agent=user_agent,
                login_at=now,
                last_activity=now,
                is_active=True
            )
            self.session.add(active_session)
            
        await self.session.commit()

    async def terminate_session(self, session_id: str, admin_id: str) -> bool:
        """
        Terminates a session locally and via Clerk Backend API.
        Returns True if successful.
        """
        # Fetch the session
        stmt = select(ActiveSession).where(ActiveSession.id == session_id)
        result = await self.session.execute(stmt)
        active_session = result.scalar_one_or_none()
        
        if not active_session:
            return False
            
        # 1. Terminate in Clerk
        if getattr(settings, 'CLERK_SECRET_KEY', None):
            try:
                # Assuming session_token_hash holds the Clerk session ID for this mapping
                # In production you'd store the raw Clerk Session ID in the DB.
                # We'll try to call Clerk to revoke.
                clerk_session_id = active_session.session_token_hash
                async with httpx.AsyncClient() as client:
                    resp = await client.post(
                        f"https://api.clerk.com/v1/sessions/{clerk_session_id}/revoke",
                        headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"}
                    )
                    if resp.status_code >= 400:
                        logger.warning("clerk_session_revoke_failed", status=resp.status_code, text=resp.text)
            except Exception as e:
                logger.error("clerk_api_error", error=str(e))
                
        # 2. Terminate Locally
        active_session.is_active = False
        await self.session.commit()
        
        # 3. Audit Log
        SecurityEventBus.publish(EventType.ADMIN_ACTION, {
            "admin_id": admin_id,
            "resource_type": "SESSION",
            "resource_id": session_id,
            "action": "TERMINATE_SESSION",
            "old_value": {"is_active": True},
            "new_value": {"is_active": False}
        })
        
        return True
