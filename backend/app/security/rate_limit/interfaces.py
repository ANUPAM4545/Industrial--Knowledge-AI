"""
ForgeMind AI — Rate Limiting Interfaces
"""
from abc import ABC, abstractmethod
from app.security.rate_limit.models import RateLimitPolicy

class RateLimiterProvider(ABC):
    """
    Abstract base class for rate limiter providers (Memory, Redis).
    """

    @abstractmethod
    async def check_limit(self, key: str, policy: RateLimitPolicy) -> tuple[bool, int, int]:
        """
        Check if the key has exceeded the limit.
        Returns:
            (allowed: bool, remaining: int, retry_after: int)
        """
        pass

    @abstractmethod
    async def get_limit_status(self, key: str) -> tuple[int, int]:
        """
        Get the current limit status for a key without consuming a token.
        Returns:
            (remaining: int, retry_after: int)
        """
        pass
    
    @abstractmethod
    async def reset_limit(self, key: str) -> None:
        """
        Reset the limit for a specific key.
        """
        pass
