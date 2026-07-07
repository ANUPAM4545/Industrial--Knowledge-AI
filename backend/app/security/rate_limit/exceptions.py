"""
ForgeMind AI — Rate Limiting Exceptions
"""
from fastapi import HTTPException, status

class RateLimitExceeded(HTTPException):
    def __init__(self, retry_after: int, message: str = "Too many requests. Please try again later."):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "success": False,
                "error": "RATE_LIMIT_EXCEEDED",
                "message": message,
                "retry_after": retry_after
            },
            headers={"Retry-After": str(retry_after)}
        )
