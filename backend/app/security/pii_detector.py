import re
import time
from typing import Dict, Any

from .interfaces import InputGuard, SecurityScanResult, SecurityDecision
from .security_config import REDACT_PII, get_decision_from_score

class PIIDetector(InputGuard):
    def __init__(self):
        self.pii_patterns = {
            "email": re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"),
            "ssn": re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
            "credit_card": re.compile(r"\b(?:\d[ -]*?){13,16}\b"),
            "phone": re.compile(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b")
        }

    async def scan_input(self, user_prompt: str, context: Dict[str, Any] = None) -> SecurityScanResult:
        start_time = time.perf_counter()
        
        triggered_rules = []
        score = 0.0
        
        for rule_name, pattern in self.pii_patterns.items():
            if pattern.search(user_prompt):
                triggered_rules.append(f"PII_{rule_name.upper()}")
                # PII isn't necessarily an "attack", but it might be a policy violation
                score += 15.0 # Low/Medium risk depending on combination
                
        latency_ms = (time.perf_counter() - start_time) * 1000
        decision = get_decision_from_score(score)
        
        return SecurityScanResult(
            decision=SecurityDecision(decision),
            risk_score=min(score, 100.0),
            triggered_rules=triggered_rules,
            details={"redacted": REDACT_PII},
            latency_ms=latency_ms
        )
