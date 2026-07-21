from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, text
from sqlalchemy.sql import text

from app.models.security_center import AuditLog, ActiveSession

class SecurityCenterRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_timeline_events(
        self,
        limit: int = 50,
        offset: int = 0,
        user_id: Optional[str] = None,
        min_severity: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetches an aggregated timeline from security_logs, rate_limit_logs, and security_events.
        We use raw SQL UNION ALL to perform this efficiently across the tables.
        """
        
        # Build raw SQL for UNION ALL
        query = """
        SELECT 
            id::text, 
            'security_logs' as source_table, 
            event_type, 
            CASE 
                WHEN risk_score > 70 THEN 'CRITICAL'
                WHEN risk_score > 40 THEN 'HIGH'
                WHEN risk_score > 10 THEN 'MEDIUM'
                ELSE 'LOW'
            END as severity,
            created_at as timestamp, 
            user_id, 
            NULL as ip_address, 
            action_taken, 
            risk_score, 
            details
        FROM security_logs
        
        UNION ALL
        
        SELECT 
            id::text, 
            'rate_limit_logs' as source_table, 
            violation_type as event_type, 
            CASE 
                WHEN decision = 'BLOCKED' THEN 'HIGH'
                ELSE 'MEDIUM'
            END as severity,
            created_at as timestamp, 
            user_id, 
            ip_address, 
            decision as action_taken, 
            security_score as risk_score, 
            jsonb_build_object('endpoint', endpoint, 'limit', limit_value) as details
        FROM rate_limit_logs
        
        UNION ALL
        
        SELECT 
            id::text, 
            'security_events' as source_table, 
            event_type, 
            severity,
            created_at as timestamp, 
            user_id, 
            ip_address, 
            'LOGGED' as action_taken, 
            NULL as risk_score, 
            details
        FROM security_events
        """
        
        # Basic filtering (can be optimized further with CTEs if needed)
        where_clauses = []
        params = {}
        
        if user_id:
            where_clauses.append("user_id = :user_id")
            params["user_id"] = user_id
            
        if min_severity:
            # Not a perfect filter due to ENUM vs STRING ordering, but works for exact match filtering
            where_clauses.append("severity = :severity")
            params["severity"] = min_severity
            
        final_query = f"SELECT * FROM ({query}) AS timeline_view"
        if where_clauses:
            final_query += " WHERE " + " AND ".join(where_clauses)
            
        final_query += " ORDER BY timestamp DESC LIMIT :limit OFFSET :offset"
        params["limit"] = limit
        params["offset"] = offset
        
        result = await self.session.execute(text(final_query), params)
        rows = result.mappings().all()
        
        return [dict(row) for row in rows]

    async def get_audit_logs(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> List[AuditLog]:
        stmt = select(AuditLog).order_by(desc(AuditLog.created_at)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
        
    async def get_active_sessions(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> List[ActiveSession]:
        stmt = select(ActiveSession).where(ActiveSession.is_active == True).order_by(desc(ActiveSession.last_activity)).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
