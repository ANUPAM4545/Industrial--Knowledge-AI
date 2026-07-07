"""
ForgeMind AI — Rate Limiting Middleware
"""
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.api.deps import oauth2_scheme
from app.services.clerk_service import verify_clerk_token
from app.db.session import async_session_maker
from app.models.user import User
from sqlalchemy import select

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Graceful User Extraction (Do not raise exceptions, just populate state if valid token exists)
        request.state.user = None
        
        # We check both Authorization header and query param (for SSE)
        auth_header = request.headers.get("Authorization")
        token = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.query_params.get("token")
            
        if token:
            try:
                clerk_id = verify_clerk_token(token)
                # Quick DB lookup
                async with async_session_maker() as session:
                    stmt = select(User).where(User.clerk_user_id == clerk_id)
                    result = await session.execute(stmt)
                    user = result.scalar_one_or_none()
                    if user and user.is_active:
                        request.state.user = user
            except Exception:
                pass # Invalid token, ignore and proceed (Auth guard will catch it if required)
        
        # 2. Process Request
        response = await call_next(request)
        
        # 3. Inject Rate Limit Headers if decision was made in dependency
        decision = getattr(request.state, "rate_limit_decision", None)
        if decision:
            response.headers["X-RateLimit-Limit"] = str(decision.limit)
            response.headers["X-RateLimit-Remaining"] = str(decision.remaining)
            response.headers["X-RateLimit-Reset"] = str(decision.retry_after)
            if not decision.allowed:
                response.headers["Retry-After"] = str(decision.retry_after)
                
        return response
