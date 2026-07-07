# Enterprise Security Center

ForgeMind AI features a unified Enterprise Security Center that centralizes observability, threat monitoring, and session management.

## Architecture

The Security Center acts as an aggregation layer over various decentralized security modules:
- **AI Security Layer**: Logs Prompt Injections and Jailbreaks to `security_logs`.
- **Adaptive Rate Limiter**: Logs abuse and token bursts to `rate_limit_logs`.
- **Identity & RBAC**: Logs permission denials and failed logins to `security_events`.

To prevent tightly coupling these modules, the system uses a **SecurityEventBus**. The bus employs an `asyncio.Queue` background worker to fan-out events to Audit Logs, the Threat Timeline, and the Risk Engine without blocking the main FastAPI thread.

## Components

### 1. Unified Threat Timeline
The `SecurityTimelineService` aggregates the 3 underlying logging tables into a single chronological feed using a highly optimized SQL `UNION ALL` query. The frontend consumes this feed via polling (15s intervals).

### 2. Live Risk Engine
Calculates a live risk score for users by aggregating recency-weighted events:
- Failed Logins (20 pts)
- Rate Limit Violations (10 pts)
- Prompt Injections (Variable)

If a user exceeds a score of `90`, they are automatically added to the `blocked_entities` table.

### 3. Active Session Management
Sessions are tracked in the `active_sessions` table. When an administrator revokes a session:
1. The local session is invalidated.
2. An HTTP request is dispatched to the Clerk Backend API to revoke the JWT upstream.
3. An `AuditLog` entry is immutably written.

### 4. Immutable Audit Logging
The `AuditLog` table strictly avoids `ON DELETE CASCADE` constraints, guaranteeing that even if a user is purged from the system, their historical actions and role mutations are preserved forever.
