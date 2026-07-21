import re
import time
from typing import Dict, Any

from .interfaces import InputGuard, SecurityScanResult, SecurityDecision
from .security_config import get_decision_from_score

class HeuristicInputGuard(InputGuard):
    def __init__(self):
        # Additional heuristic rules
        self.rules = {
            "markdown_injection": re.compile(r"(\!\[.*?\]\((javascript:|vbscript:|data:).*?\))|(\<img.*?src=[\'\"]?(javascript:|vbscript:|data:).*?[\'\"]?\>)"),
            "role_confusion": re.compile(r"(now\s+act\s+as|pretend\s+to\s+be|you\s+are\s+an?\s+(hacker|unrestricted|jailbroken|AI\s+that\s+doesn't\s+care))", re.IGNORECASE),
            "system_override": re.compile(r"(new\s+system\s+prompt|override\s+instructions|disable\s+safety|bypass\s+filters|ignore\s+all\s+security\s+rules)", re.IGNORECASE),
            "chain_of_thought_leak": re.compile(r"(reveal\s+chain\s+of\s+thought|show\s+your\s+reasoning|print\s+instructions|print\s+out\s+your\s+initial\s+instructions|what\s+is\s+your\s+system\s+prompt)", re.IGNORECASE),
        }

    async def scan_input(self, user_prompt: str, context: Dict[str, Any] = None) -> SecurityScanResult:
        start_time = time.perf_counter()
        
        triggered_rules = []
        score = 0.0
        
        # Test each rule
        for rule_name, pattern in self.rules.items():
            if pattern.search(user_prompt):
                triggered_rules.append(rule_name.upper())
                score += 60.0 # Heuristic matches are usually medium/high risk
                
        # Look for suspicious combinations of words that might indicate an evasion attempt
        if "ignore" in user_prompt.lower() and "previous" in user_prompt.lower():
            triggered_rules.append("SUSPICIOUS_WORD_COMBINATION")
            score += 30.0

        latency_ms = (time.perf_counter() - start_time) * 1000
        decision = get_decision_from_score(score)
        
        return SecurityScanResult(
            decision=SecurityDecision(decision),
            risk_score=min(score, 100.0),
            triggered_rules=triggered_rules,
            details={},
            latency_ms=latency_ms
        )
