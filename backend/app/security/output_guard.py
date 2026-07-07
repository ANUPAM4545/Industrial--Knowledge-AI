import re
import time
from typing import Dict, Any

from .interfaces import OutputGuard, SecurityScanResult, SecurityDecision
from .security_config import get_decision_from_score

class DefaultOutputGuard(OutputGuard):
    def __init__(self):
        self.leak_pattern = re.compile(
            r"(I\s+am\s+programmed\s+to)|"
            r"(My\s+instructions\s+are)|"
            r"(Here\s+is\s+my\s+system\s+prompt)|"
            r"(As\s+an\s+AI\s+language\s+model)",
            re.IGNORECASE
        )
        self.secrets_pattern = re.compile(
            r"(sk-[a-zA-Z0-9]{32,})|"  # OpenAI like keys
            r"(AIza[0-9A-Za-z-_]{35})|" # Google API Keys
            r"(ey[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)" # JWT tokens
        )

    async def scan_output(self, llm_response: str, context: Dict[str, Any] = None) -> SecurityScanResult:
        start_time = time.perf_counter()
        
        triggered_rules = []
        score = 0.0
        
        if self.leak_pattern.search(llm_response):
            triggered_rules.append("SYSTEM_PROMPT_LEAK")
            score += 90.0 # Very high risk
            
        if self.secrets_pattern.search(llm_response):
            triggered_rules.append("SECRETS_LEAK")
            score += 95.0
            
        latency_ms = (time.perf_counter() - start_time) * 1000
        decision = get_decision_from_score(score)
        
        return SecurityScanResult(
            decision=SecurityDecision(decision),
            risk_score=min(score, 100.0),
            triggered_rules=triggered_rules,
            details={},
            latency_ms=latency_ms
        )
