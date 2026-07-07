"""
ForgeMind AI — Rate Limiting Service
"""
import structlog
from typing import Optional, Dict, Any
from app.models.user import UserRole, User
from app.security.rate_limit.interfaces import RateLimiterProvider
from app.security.rate_limit.models import LimitType, RateLimitDecision
from app.security.rate_limit.policy_engine import PolicyEngine
from app.security.rate_limit.adaptive_rate_limiter import AdaptiveRateLimiter
from app.security.rate_limit.security_logger import SecurityLogger

logger = structlog.get_logger(__name__)

class RateLimitService:
    def __init__(self, provider: RateLimiterProvider):
        self.provider = provider
        
    async def check_rate_limit(
        self,
        limit_type: LimitType,
        ip_address: str,
        user: Optional[User] = None,
        endpoint_override: Optional[str] = None,
        security_score: Optional[float] = None
    ) -> RateLimitDecision:
        """
        Evaluate if a request is allowed based on multiple dimensions.
        """
        
        # 1. Resolve Base Policy
        role = user.role if user else None
        base_policy = PolicyEngine.get_policy(limit_type, role, endpoint_override)
        
        # 2. Apply Adaptive Limits if Security Score is provided
        policy = base_policy
        if security_score is not None:
            policy = AdaptiveRateLimiter.adjust_policy(base_policy, security_score)
            
        # 3. Formulate identifier key
        # Usually we bucket by User if authenticated, else IP
        identifier = user.id if user else ip_address
        key = f"{limit_type.value}:{endpoint_override or 'default'}:{identifier}"
        
        # 4. Check Provider
        allowed, remaining, retry_after = await self.provider.check_limit(key, policy)
        
        decision = "ALLOWED" if allowed else "BLOCKED"
        violation_type = "STANDARD" if not policy.burst_limit else "BURST_LIMIT"
        
        # 5. Async Logging
        # We might not want to log EVERY allowed request to DB, maybe just blocks or samples
        if not allowed or remaining < (policy.requests * 0.1): # Log if blocked or very close to limit
            SecurityLogger.log(
                ip_address=ip_address,
                endpoint=endpoint_override or limit_type.value,
                limit_value=policy.requests,
                remaining=remaining,
                decision=decision,
                violation_type=violation_type,
                user_id=user.id if user else None,
                role=user.role.value if user else None,
                security_score=security_score
            )
            
        return RateLimitDecision(
            allowed=allowed,
            limit=policy.requests,
            remaining=remaining,
            retry_after=retry_after,
            violation_type=violation_type if not allowed else None,
            ip_address=ip_address,
            user_id=user.id if user else None
        )
