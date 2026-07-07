"""
ForgeMind AI — Rate Limiting FastAPI Dependencies / Decorators
"""
from typing import Callable, Optional
from fastapi import Request, Depends, HTTPException
from app.models.user import User
from app.api.deps import get_current_user, get_db
from app.security.rate_limit.models import LimitType
from app.security.rate_limit.config import RATE_LIMIT_PROVIDER
from app.security.rate_limit.memory_provider import MemoryRateLimiterProvider
from app.security.rate_limit.service import RateLimitService
from app.security.rate_limit.exceptions import RateLimitExceeded
from app.security.rate_limit.trackers import SecurityReputationTracker
from app.core.config import settings

# Global Singleton Providers (to preserve state in memory/redis)
_memory_provider = MemoryRateLimiterProvider()
_redis_provider = None

async def get_rate_limiter_provider():
    if RATE_LIMIT_PROVIDER == "redis":
        global _redis_provider
        if _redis_provider is None:
            from redis.asyncio import Redis
            from app.security.rate_limit.redis_provider import RedisRateLimiterProvider
            redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
            _redis_provider = RedisRateLimiterProvider(redis_client)
        return _redis_provider
    return _memory_provider

async def get_rate_limit_service(provider = Depends(get_rate_limiter_provider)) -> RateLimitService:
    return RateLimitService(provider)

def rate_limit(limit_type: LimitType, endpoint_override: Optional[str] = None):
    """
    Dependency factory to enforce rate limiting on a specific endpoint.
    Usage:
        @router.post("/login", dependencies=[Depends(rate_limit(LimitType.AUTH, "login"))])
    """
    async def _rate_limit_dependency(
        request: Request,
        service: RateLimitService = Depends(get_rate_limit_service)
    ):
        # Determine if user is authenticated (we gracefully attempt to fetch it, but auth routes might not have a token)
        user = getattr(request.state, "user", None)
        
        # If not set in middleware/state, try to extract manually or fallback to IP
        # Actually, for standard endpoints we might want to resolve get_current_user, but we don't want to enforce it if it's a public endpoint.
        # We will rely on request.state.user which can be set by a middleware, or just fallback to IP
        ip_address = request.client.host if request.client else "127.0.0.1"
        
        # We look for the forwarded IP just in case
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip_address = forwarded.split(",")[0].strip()

        # Fetch security score for adaptive rate limiting
        security_score = 0.0
        if user:
            security_score = await SecurityReputationTracker.get_user_risk_score(user.id)
        else:
            security_score = await SecurityReputationTracker.get_ip_risk_score(ip_address)

        decision = await service.check_rate_limit(
            limit_type=limit_type,
            ip_address=ip_address,
            user=user,
            endpoint_override=endpoint_override,
            security_score=security_score
        )
        
        if not decision.allowed:
            raise RateLimitExceeded(retry_after=decision.retry_after)
            
        # We inject headers into the response via middleware or by mutating response directly
        # For simplicity, we can inject it into request state so middleware can add it
        request.state.rate_limit_decision = decision
        
        return decision

    return _rate_limit_dependency
