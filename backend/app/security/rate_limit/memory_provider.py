"""
NEXO — Memory Rate Limiter Provider (Development)
"""
import time
from typing import Dict, Tuple
from app.security.rate_limit.interfaces import RateLimiterProvider
from app.security.rate_limit.models import RateLimitPolicy

class MemoryRateLimiterProvider(RateLimiterProvider):
    """
    In-memory rate limiter using sliding window and token bucket concepts.
    Suitable for development or single-instance deployments.
    """
    def __init__(self):
        # Format: {key: {"tokens": float, "last_updated": float, "window_start": float, "count": int}}
        self._store: Dict[str, dict] = {}

    async def check_limit(self, key: str, policy: RateLimitPolicy) -> Tuple[bool, int, int]:
        now = time.time()
        
        # 1. Standard Window Rate Limiting (Sliding Window Log simplified)
        # For memory, we'll do a simple fixed window reset for the standard requests limit
        record = self._store.get(key, {
            "tokens": float(policy.burst_limit) if policy.burst_limit else float(policy.requests),
            "last_updated": now,
            "window_start": now,
            "count": 0
        })

        # Check if window expired
        if now - record["window_start"] >= policy.window_seconds:
            record["window_start"] = now
            record["count"] = 0
            if not policy.burst_limit:
                record["tokens"] = float(policy.requests)

        # 2. Burst Token Bucket Logic
        if policy.burst_limit and policy.burst_window_seconds:
            # Token refill rate
            rate = policy.burst_limit / policy.burst_window_seconds
            time_passed = now - record["last_updated"]
            record["tokens"] = min(float(policy.burst_limit), record["tokens"] + time_passed * rate)
            record["last_updated"] = now

        # Standard check
        if record["count"] >= policy.requests:
            self._store[key] = record
            retry_after = int(policy.window_seconds - (now - record["window_start"]))
            return False, 0, max(0, retry_after)

        # Burst check
        if policy.burst_limit:
            if record["tokens"] >= 1.0:
                record["tokens"] -= 1.0
                record["count"] += 1
                self._store[key] = record
                remaining = int(min(record["tokens"], policy.requests - record["count"]))
                return True, remaining, 0
            else:
                self._store[key] = record
                # Calculate time until next token
                rate = policy.burst_limit / policy.burst_window_seconds
                retry_after = int((1.0 - record["tokens"]) / rate) + 1
                return False, 0, retry_after
        else:
            record["count"] += 1
            self._store[key] = record
            remaining = policy.requests - record["count"]
            return True, remaining, 0

    async def get_limit_status(self, key: str) -> Tuple[int, int]:
        if key not in self._store:
            return -1, 0 # Unknown remaining
        
        now = time.time()
        record = self._store[key]
        retry_after = 0
        remaining = 0
        
        # Approximate values
        time_passed = now - record["window_start"]
        if time_passed > 0:
            retry_after = max(0, int(record.get("window_length", 60) - time_passed))
            
        return remaining, retry_after

    async def reset_limit(self, key: str) -> None:
        if key in self._store:
            del self._store[key]
