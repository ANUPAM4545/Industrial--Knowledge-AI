from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

class StatisticsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """
        Gathers high-level stats for the Security Dashboard.
        """
        stats = {}
        
        # 1. Total Prompt Injections (Last 24h)
        query = text("""
            SELECT COUNT(*) FROM security_logs 
            WHERE event_type IN ('prompt_injection', 'PROMPT_INJECTION')
            AND created_at > NOW() - INTERVAL '24 hours'
        """)
        result = await self.session.execute(query)
        stats["prompt_injections_24h"] = result.scalar() or 0
        
        # 2. Blocked Requests (Last 24h)
        query = text("""
            SELECT COUNT(*) FROM rate_limit_logs 
            WHERE decision = 'BLOCKED'
            AND created_at > NOW() - INTERVAL '24 hours'
        """)
        result = await self.session.execute(query)
        stats["blocked_requests_24h"] = result.scalar() or 0
        
        # 3. Active Sessions
        query = text("""
            SELECT COUNT(*) FROM active_sessions 
            WHERE is_active = True
        """)
        result = await self.session.execute(query)
        stats["active_sessions"] = result.scalar() or 0
        
        # 4. Average System Risk Score
        # For a real implementation, we'd average active users' risk scores,
        # but as a proxy, we'll average recent AI risk scores.
        query = text("""
            SELECT AVG(risk_score) FROM security_logs
            WHERE created_at > NOW() - INTERVAL '24 hours'
        """)
        result = await self.session.execute(query)
        avg_risk = result.scalar() or 0.0
        stats["average_risk_score"] = round(avg_risk, 1)
        
        return stats
