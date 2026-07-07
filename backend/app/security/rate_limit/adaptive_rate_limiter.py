"""
NEXO — Adaptive Rate Limiter
"""
from app.security.rate_limit.models import RateLimitPolicy
from app.security.rate_limit.config import ADAPTIVE_RISK_MULTIPLIERS, EMERGENCY_RATE_LIMIT

class AdaptiveRateLimiter:
    """
    Adjusts policies dynamically based on security risk scores.
    """
    
    @staticmethod
    def adjust_policy(base_policy: RateLimitPolicy, risk_score: float) -> RateLimitPolicy:
        """
        Adjust the base policy according to the user's risk score.
        """
        if risk_score <= 20.0:
            multiplier = ADAPTIVE_RISK_MULTIPLIERS["safe"]
        elif risk_score <= 50.0:
            multiplier = ADAPTIVE_RISK_MULTIPLIERS["low"]
        elif risk_score <= 70.0:
            multiplier = ADAPTIVE_RISK_MULTIPLIERS["medium"]
        else:
            # 71-100: Emergency mode
            return EMERGENCY_RATE_LIMIT
            
        if multiplier == 1.0:
            return base_policy
            
        return RateLimitPolicy(
            requests=max(1, int(base_policy.requests * multiplier)),
            window_seconds=base_policy.window_seconds,
            burst_limit=max(1, int(base_policy.burst_limit * multiplier)) if base_policy.burst_limit else None,
            burst_window_seconds=base_policy.burst_window_seconds
        )
