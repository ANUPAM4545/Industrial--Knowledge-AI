from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text

from app.models.security_center import BlockedEntity
from app.security.event_bus import SecurityEventBus, EventType
import structlog

logger = structlog.get_logger(__name__)

class RiskEngine:
    """
    Computes a live Security Risk Score.
    This implementation polls recent events to determine risk.
    In a more advanced implementation, this could maintain a running sum in Redis.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

    async def calculate_user_risk(self, user_id: str) -> float:
        """
        Calculates risk score (0-100) based on recent activity.
        """
        risk_score = 0.0
        
        # 1. Prompt Injections / Jailbreaks (High Risk)
        query = text("""
            SELECT SUM(risk_score) FROM security_logs 
            WHERE user_id = :user_id 
            AND created_at > NOW() - INTERVAL '1 hour'
        """)
        result = await self.session.execute(query, {"user_id": user_id})
        ai_risk = result.scalar() or 0.0
        risk_score += ai_risk
        
        # 2. Rate Limit Violations (Medium Risk)
        query = text("""
            SELECT COUNT(*) FROM rate_limit_logs 
            WHERE user_id = :user_id 
            AND created_at > NOW() - INTERVAL '1 hour'
        """)
        result = await self.session.execute(query, {"user_id": user_id})
        rate_limit_count = result.scalar() or 0
        risk_score += (rate_limit_count * 10.0) # 10 pts per violation
        
        # 3. Failed Logins (High Risk)
        query = text("""
            SELECT COUNT(*) FROM security_events 
            WHERE user_id = :user_id 
            AND event_type = 'LOGIN_FAILED'
            AND created_at > NOW() - INTERVAL '1 hour'
        """)
        result = await self.session.execute(query, {"user_id": user_id})
        failed_logins = result.scalar() or 0
        risk_score += (failed_logins * 20.0) # 20 pts per failed login
        
        # Cap at 100
        final_score = min(risk_score, 100.0)
        
        # Auto-block if critical
        if final_score >= 90.0:
            await self._auto_block_user(user_id, reason="Critical Risk Score Exceeded")
            
        return final_score

    async def _auto_block_user(self, user_id: str, reason: str):
        # Check if already blocked
        stmt = select(BlockedEntity).where(
            BlockedEntity.entity_type == "USER",
            BlockedEntity.entity_value == user_id,
            BlockedEntity.is_active == True
        )
        result = await self.session.execute(stmt)
        if result.scalar_one_or_none():
            return
            
        block = BlockedEntity(
            entity_type="USER",
            entity_value=user_id,
            reason=reason
        )
        self.session.add(block)
        await self.session.commit()
        
        SecurityEventBus.publish(EventType.USER_BLOCKED, {
            "user_id": user_id,
            "reason": reason
        })
