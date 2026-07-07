import pytest
from app.security.event_bus import SecurityEventBus, EventType
import asyncio

@pytest.mark.asyncio
async def test_event_bus_publish_subscribe():
    received_payload = None

    async def mock_handler(event_type: EventType, payload: dict):
        nonlocal received_payload
        received_payload = payload

    SecurityEventBus.subscribe(EventType.LOGIN_FAILED, mock_handler)
    
    # Publish event
    SecurityEventBus.publish(EventType.LOGIN_FAILED, {"user_id": "usr_123", "ip_address": "127.0.0.1"})
    
    # Start worker and process queue
    worker_task = asyncio.create_task(SecurityEventBus._process_events())
    
    # Give it a moment to process the queue
    await asyncio.sleep(0.1)
    
    # Stop worker
    worker_task.cancel()
    
    assert received_payload is not None
    assert received_payload["user_id"] == "usr_123"
    assert received_payload["ip_address"] == "127.0.0.1"

def test_schemas():
    from app.security.security_center.schemas import AggregatedSecurityEvent
    from datetime import datetime
    
    event = AggregatedSecurityEvent(
        id="test-id",
        source_table="security_logs",
        event_type="PROMPT_INJECTION",
        severity="HIGH",
        timestamp=datetime.now(),
        action_taken="BLOCK"
    )
    
    assert event.severity == "HIGH"
    assert event.action_taken == "BLOCK"
