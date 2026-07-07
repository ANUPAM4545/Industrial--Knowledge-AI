import pytest
from app.security.rate_limit.models import LimitType, RateLimitPolicy
from app.security.rate_limit.memory_provider import MemoryRateLimiterProvider
from app.security.rate_limit.policy_engine import PolicyEngine
from app.security.rate_limit.adaptive_rate_limiter import AdaptiveRateLimiter
from app.models.user import UserRole

@pytest.mark.asyncio
async def test_memory_provider_standard_limit():
    provider = MemoryRateLimiterProvider()
    policy = RateLimitPolicy(requests=2, window_seconds=10)
    key = "test_key_standard"
    
    # Request 1
    allowed, remaining, retry = await provider.check_limit(key, policy)
    assert allowed is True
    assert remaining == 1
    
    # Request 2
    allowed, remaining, retry = await provider.check_limit(key, policy)
    assert allowed is True
    assert remaining == 0
    
    # Request 3 - should fail
    allowed, remaining, retry = await provider.check_limit(key, policy)
    assert allowed is False
    assert remaining == 0
    assert retry > 0

@pytest.mark.asyncio
async def test_memory_provider_burst_limit():
    provider = MemoryRateLimiterProvider()
    # 5 total requests, but tokens refill at 1 token / 2 seconds
    policy = RateLimitPolicy(requests=5, window_seconds=60, burst_limit=1, burst_window_seconds=2)
    key = "test_key_burst"
    
    # Burst Request 1 - should pass
    allowed, remaining, retry = await provider.check_limit(key, policy)
    assert allowed is True
    
    # Burst Request 2 - immediately should fail due to token bucket empty
    allowed, remaining, retry = await provider.check_limit(key, policy)
    assert allowed is False
    assert retry > 0
    
def test_policy_engine_resolution():
    # Test specific override
    policy = PolicyEngine.get_policy(LimitType.AUTH, endpoint="login")
    assert policy.requests == 5
    
    # Test role base
    policy = PolicyEngine.get_policy(LimitType.CHAT, role=UserRole.ENGINEER)
    assert policy.requests == 40
    
    # Test fallback default
    policy = PolicyEngine.get_policy(LimitType.DASHBOARD)
    assert policy.requests == 120
    
def test_adaptive_rate_limiter():
    base_policy = RateLimitPolicy(requests=100, window_seconds=60)
    
    # Safe score
    adjusted = AdaptiveRateLimiter.adjust_policy(base_policy, 10.0)
    assert adjusted.requests == 100
    
    # Low risk (0.75x)
    adjusted = AdaptiveRateLimiter.adjust_policy(base_policy, 40.0)
    assert adjusted.requests == 75
    
    # Medium risk (0.50x)
    adjusted = AdaptiveRateLimiter.adjust_policy(base_policy, 60.0)
    assert adjusted.requests == 50
    
    # High risk (Emergency)
    adjusted = AdaptiveRateLimiter.adjust_policy(base_policy, 90.0)
    assert adjusted.requests == 5
