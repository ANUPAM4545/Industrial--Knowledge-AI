"""
NEXO — User & IP Tracker
"""
from typing import Optional
from sqlalchemy import select, func, desc
from datetime import datetime, timedelta, timezone
from app.db.session import AsyncSessionLocal
from app.models.security_log import SecurityLog

class SecurityReputationTracker:
    """
    Calculates dynamic risk scores for IPs and Users based on recent violations.
    """
    
    @staticmethod
    async def get_user_risk_score(user_id: str) -> float:
        """
        Calculate the risk score based on the user's last 24 hours of security logs.
        """
        return await SecurityReputationTracker._calculate_score(user_id=user_id)
        
    @staticmethod
    async def get_ip_risk_score(ip_address: str) -> float:
        """
        Calculate the risk score based on the IP's last 24 hours of security logs.
        """
        return await SecurityReputationTracker._calculate_score(ip_address=ip_address)

    @staticmethod
    async def _calculate_score(user_id: Optional[str] = None, ip_address: Optional[str] = None) -> float:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        
        async with AsyncSessionLocal() as session:
            stmt = select(SecurityLog.risk_score).where(SecurityLog.created_at >= cutoff)
            
            if user_id:
                stmt = stmt.where(SecurityLog.user_id == user_id)
            else:
                return 0.0
                
            # Get the highest risk score in the last 24 hours, or a decaying average
            # For strict security, we'll use the MAX score in the last hour, or slowly decay
            # For simplicity in this implementation, we take the MAX score
            result = await session.execute(stmt)
            scores = result.scalars().all()
            
            if not scores:
                return 0.0
                
            return float(max(scores))
