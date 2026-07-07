"""
ForgeMind AI — Rate Limiting Policy Engine
"""
from typing import Optional
from app.models.user import UserRole
from app.security.rate_limit.models import LimitType, RateLimitPolicy
from app.security.rate_limit.config import POLICY_MATRIX

class PolicyEngine:
    """
    Resolves the correct rate limit policy based on endpoint, user role, and defaults.
    """
    
    @staticmethod
    def get_policy(limit_type: LimitType, role: Optional[UserRole] = None, endpoint: Optional[str] = None) -> RateLimitPolicy:
        """
        Get the base policy for the given type and role.
        """
        category_policies = POLICY_MATRIX.get(limit_type)
        if not category_policies:
            # Fallback safe limit
            return RateLimitPolicy(requests=10, window_seconds=60)
            
        # 1. Check if specific endpoint override exists (like "login")
        if endpoint and endpoint in category_policies:
            return category_policies[endpoint]
            
        # 2. Check role-based policy
        if role and role in category_policies:
            return category_policies[role]
            
        # 3. Fallback to default
        if "default" in category_policies:
            return category_policies["default"]
            
        # Fallback safe limit
        return RateLimitPolicy(requests=10, window_seconds=60)
