"""
NEXO — Rate Limiting Configuration
"""
from typing import Dict, Any
from app.models.user import UserRole
from app.security.rate_limit.models import LimitType, RateLimitPolicy

# Default configuration can be overridden by env vars in production
RATE_LIMIT_PROVIDER = "redis" # "redis" or "memory"

# Policy Matrix (Requests, Window_Seconds, Burst_Limit, Burst_Window)
POLICY_MATRIX: Dict[LimitType, Dict[str, RateLimitPolicy]] = {
    LimitType.AUTH: {
        "login": RateLimitPolicy(requests=5, window_seconds=900), # 5 per 15 min
        "register": RateLimitPolicy(requests=3, window_seconds=3600), # 3 per hour
        "forgot_password": RateLimitPolicy(requests=5, window_seconds=3600),
    },
    LimitType.CHAT: {
        UserRole.VIEWER: RateLimitPolicy(requests=10, window_seconds=60),
        UserRole.OPERATOR: RateLimitPolicy(requests=20, window_seconds=60),
        UserRole.ENGINEER: RateLimitPolicy(requests=40, window_seconds=60),
        UserRole.MANAGER: RateLimitPolicy(requests=60, window_seconds=60, burst_limit=10, burst_window_seconds=3),
        UserRole.ADMIN: RateLimitPolicy(requests=100, window_seconds=60),
        UserRole.SUPER_ADMIN: RateLimitPolicy(requests=200, window_seconds=60),
    },
    LimitType.DOCUMENT: {
        UserRole.VIEWER: RateLimitPolicy(requests=0, window_seconds=3600), # Not Allowed
        UserRole.OPERATOR: RateLimitPolicy(requests=100, window_seconds=3600),
        UserRole.ENGINEER: RateLimitPolicy(requests=30, window_seconds=3600),
        UserRole.MANAGER: RateLimitPolicy(requests=50, window_seconds=3600),
        UserRole.ADMIN: RateLimitPolicy(requests=100, window_seconds=3600),
        UserRole.SUPER_ADMIN: RateLimitPolicy(requests=99999, window_seconds=3600),
    },
    LimitType.SEARCH: {
        UserRole.OPERATOR: RateLimitPolicy(requests=60, window_seconds=60),
        UserRole.ENGINEER: RateLimitPolicy(requests=120, window_seconds=60),
        UserRole.MANAGER: RateLimitPolicy(requests=180, window_seconds=60),
        UserRole.ADMIN: RateLimitPolicy(requests=300, window_seconds=60),
        UserRole.SUPER_ADMIN: RateLimitPolicy(requests=500, window_seconds=60),
    },
    LimitType.DASHBOARD: {
        "default": RateLimitPolicy(requests=120, window_seconds=60)
    },
    LimitType.CONTACT: {
        "default": RateLimitPolicy(requests=5, window_seconds=3600) # per IP
    }
}

# Adaptive Limits based on Security Risk Score
# Score mapping to reduction multiplier
ADAPTIVE_RISK_MULTIPLIERS = {
    "safe": 1.0,         # 0-20
    "low": 0.75,         # 21-50 -> Reduce by 25%
    "medium": 0.50,      # 51-70 -> Reduce by 50%
    "high": 0.0,         # 71-100 -> Emergency mode handled separately
}

EMERGENCY_RATE_LIMIT = RateLimitPolicy(requests=5, window_seconds=60)
