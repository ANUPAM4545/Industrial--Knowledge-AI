# Enterprise Rate Limiting & Abuse Protection System

NEXO implements a robust, multi-layered Rate Limiting System to protect endpoints from abuse, scraping, brute-force attacks, and resource exhaustion.

## Architecture Highlights

- **Provider Agnostic**: The architecture supports multiple backend providers. Currently, we utilize `RedisRateLimiterProvider` for production (capable of handling distributed workloads via Lua scripts) and `MemoryRateLimiterProvider` for development.
- **Adaptive Rate Limiting**: Limit policies adjust dynamically based on a user's or IP's `Security Risk Score` (calculated by the `SecurityReputationTracker` pulling telemetry from the AI Security Layer).
- **Token Bucket + Sliding Window**: Provides strict rolling limits while gracefully handling legitimate traffic bursts.
- **Asynchronous Telemetry**: Limit violations are captured and logged non-blockingly via `asyncio.create_task` ensuring <2ms overhead.

## Configuration (Policy Matrix)

The `POLICY_MATRIX` defines base limits per `LimitType` and `UserRole`:

1. **Authentication Limits** (Protects against brute force and credential stuffing)
2. **Chat & Search Limits** (Protects expensive vector and LLM processing)
3. **Document Limits** (Protects storage bounds)
4. **Dashboard & Contact Limits** (Protects miscellaneous APIs)

## Adding Rate Limits to Endpoints

FastAPI endpoints can be protected easily using the `rate_limit` dependency factory.

```python
from app.security.rate_limit.decorators import rate_limit
from app.security.rate_limit.models import LimitType
from fastapi import APIRouter, Depends

router = APIRouter()

@router.post("/chat", dependencies=[Depends(rate_limit(LimitType.CHAT))])
async def chat_completion():
    return {"status": "success"}
```

## Security Headers

Any endpoint protected by the middleware will automatically return X-RateLimit headers indicating the current policy bounds and remaining limits. When the limit is reached, a `429 Too Many Requests` is returned.
