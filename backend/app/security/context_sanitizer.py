import re
import time
from typing import List

from .interfaces import ContextSanitizer, SecurityScanResult, SecurityDecision
from .security_config import get_decision_from_score

class DefaultContextSanitizer(ContextSanitizer):
    def __init__(self):
        # We strip <system>, <script>, <style> and other obvious XML/HTML tags
        self.tags_to_strip = re.compile(r"<\/?(system|script|style|iframe|object|embed|applet|form|button)[^>]*>", re.IGNORECASE)
        # Check if the document chunk itself contains a prompt injection (Indirect Prompt Injection)
        self.indirect_injection_pattern = re.compile(
            r"(ignore\s+(all\s+)?(previous\s+)?(instructions|directions))|"
            r"(you\s+are\s+now)|(act\s+as\s+dan)|(system\s+override)",
            re.IGNORECASE
        )

    async def sanitize(self, chunks: List[str]) -> List[str]:
        """Strip dangerous tags from context chunks."""
        sanitized = []
        for chunk in chunks:
            # Strip dangerous tags
            clean_chunk = self.tags_to_strip.sub("", chunk)
            sanitized.append(clean_chunk)
        return sanitized

    async def scan_context(self, chunks: List[str]) -> SecurityScanResult:
        """Scan RAG chunks for indirect prompt injection."""
        start_time = time.perf_counter()
        
        triggered_rules = []
        score = 0.0
        
        for chunk in chunks:
            if self.indirect_injection_pattern.search(chunk):
                triggered_rules.append("INDIRECT_PROMPT_INJECTION")
                score = max(score, 85.0) # High risk if the context itself is trying to inject instructions!
                
        latency_ms = (time.perf_counter() - start_time) * 1000
        decision = get_decision_from_score(score)
        
        return SecurityScanResult(
            decision=SecurityDecision(decision),
            risk_score=min(score, 100.0),
            triggered_rules=triggered_rules,
            details={},
            latency_ms=latency_ms
        )
