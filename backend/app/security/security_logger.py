import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.security_log import SecurityLog
from .interfaces import SecurityScanResult, SecurityLogger
from app.security.event_bus import SecurityEventBus, EventType

class DBSecurityLogger(SecurityLogger):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_event(self, event_type: str, user_id: str, scan_result: SecurityScanResult, conversation_id: Optional[str] = None) -> None:
        log_entry = SecurityLog(
            user_id=user_id,
            conversation_id=conversation_id,
            event_type=event_type,
            action_taken=scan_result.decision.value,
            risk_score=scan_result.risk_score,
            triggered_rules=scan_result.triggered_rules,
            details=scan_result.details,
            processing_time_ms=scan_result.latency_ms
        )
        self.session.add(log_entry)
        await self.session.commit()
        
        # Publish to event bus for downstream consumers (Security Center)
        if scan_result.decision.value == "BLOCK" or scan_result.risk_score > 50:
            SecurityEventBus.publish(
                EventType.PROMPT_INJECTION if "prompt" in event_type.lower() else EventType.JAILBREAK_ATTEMPT,
                {
                    "user_id": user_id,
                    "event_type": event_type,
                    "action_taken": scan_result.decision.value,
                    "risk_score": scan_result.risk_score,
                    "triggered_rules": scan_result.triggered_rules
                }
            )
