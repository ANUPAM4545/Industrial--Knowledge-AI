"""
NEXO — Security Center Event Handlers

These listeners are bound to the SecurityEventBus and fan out
security events into the unified timeline and audit logs.
"""
import structlog
from typing import Any, Dict

from app.security.event_bus import EventType, SecurityEventBus
from app.db.session import async_session_maker
from app.models.security_center import SecurityEvent, AuditLog

logger = structlog.get_logger(__name__)

async def handle_timeline_event(event_type: EventType, payload: Dict[str, Any]):
    """
    Logs generic security events into the unified security timeline.
    (AI and Rate Limit events are already in their own tables, so this handles the rest)
    """
    if event_type in [EventType.LOGIN_FAILED, EventType.PERMISSION_DENIED, EventType.USER_BLOCKED]:
        try:
            async with async_session_maker() as session:
                event = SecurityEvent(
                    event_type=event_type.value,
                    severity="MEDIUM" if event_type != EventType.USER_BLOCKED else "HIGH",
                    user_id=payload.get("user_id"),
                    ip_address=payload.get("ip_address"),
                    details=payload
                )
                session.add(event)
                await session.commit()
        except Exception as e:
            logger.error("failed_to_log_security_event", error=str(e), event_type=event_type)

async def handle_audit_event(event_type: EventType, payload: Dict[str, Any]):
    """
    Immutable audit logging for mutations.
    """
    if event_type in [EventType.ROLE_CHANGED, EventType.ADMIN_ACTION]:
        try:
            async with async_session_maker() as session:
                audit = AuditLog(
                    user_id=payload.get("admin_id") or payload.get("user_id"),
                    action=event_type.value,
                    resource_type=payload.get("resource_type"),
                    resource_id=payload.get("resource_id"),
                    old_value=payload.get("old_value"),
                    new_value=payload.get("new_value"),
                    ip_address=payload.get("ip_address")
                )
                session.add(audit)
                await session.commit()
        except Exception as e:
            logger.error("failed_to_log_audit_event", error=str(e), event_type=event_type)

def register_security_handlers():
    """
    Register all listeners to the Event Bus.
    Call this during startup in main.py.
    """
    SecurityEventBus.subscribe(EventType.LOGIN_FAILED, handle_timeline_event)
    SecurityEventBus.subscribe(EventType.PERMISSION_DENIED, handle_timeline_event)
    SecurityEventBus.subscribe(EventType.USER_BLOCKED, handle_timeline_event)
    
    SecurityEventBus.subscribe(EventType.ROLE_CHANGED, handle_audit_event)
    SecurityEventBus.subscribe(EventType.ADMIN_ACTION, handle_audit_event)
    
    # We will add RiskEngineUpdater later
