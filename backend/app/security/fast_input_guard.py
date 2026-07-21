import re
import unicodedata
import time
from typing import Dict, Any

from .interfaces import InputGuard, SecurityScanResult, SecurityDecision
from .security_config import MAX_PROMPT_LENGTH, get_decision_from_score

# Fast regex patterns for obvious injections
FAST_INJECTION_PATTERN = re.compile(
    r"(ignore\s+(all\s+)?(previous\s+)?(instructions|directions|rules))|"
    r"(forget\s+(about\s+)?(your\s+)?(system\s+)?prompt)|"
    r"(you\s+are\s+now)|"
    r"(act\s+as\s+dan)|"
    r"(developer\s+mode)|"
    r"(reveal\s+(your\s+)?(hidden\s+)?(instructions|prompt|rules))|"
    r"(bypass\s+(all\s+)?(security|rules|filters))|"
    r"(disregard\s+(all\s+)?(previous\s+)?(instructions|rules))|"
    r"(\<system\>)|(\<\/system\>)|"
    r"(\<role\>)",
    re.IGNORECASE
)

# Repeated tokens e.g. aaaaaaaaaaaaaaaaaaaaaaaa or very long unbroken words
REPEATED_TOKEN_PATTERN = re.compile(r"([^a-zA-Z0-9\s]){15,}")

class FastInputGuard(InputGuard):
    async def scan_input(self, user_prompt: str, context: Dict[str, Any] = None) -> SecurityScanResult:
        start_time = time.perf_counter()
        
        triggered_rules = []
        score = 0.0
        
        # 1. Unicode Normalization
        normalized_prompt = unicodedata.normalize('NFKC', user_prompt)
        
        # 2. Length check
        if len(normalized_prompt) > MAX_PROMPT_LENGTH:
            triggered_rules.append("MAX_LENGTH_EXCEEDED")
            score += 100.0
            
        # 3. Fast Regex checks
        if FAST_INJECTION_PATTERN.search(normalized_prompt):
            triggered_rules.append("FAST_INJECTION_REGEX_MATCH")
            score += 80.0
            
        if REPEATED_TOKEN_PATTERN.search(normalized_prompt):
            triggered_rules.append("REPEATED_TOKEN_OBFUSCATION")
            score += 60.0
            
        # 4. Invisible character check (zero width spaces, etc.)
        invisible_chars = ['\u200b', '\u200c', '\u200d', '\ufeff']
        if any(char in user_prompt for char in invisible_chars):
            triggered_rules.append("INVISIBLE_CHARS_DETECTED")
            score += 60.0
            
        latency_ms = (time.perf_counter() - start_time) * 1000
        decision = get_decision_from_score(score)
        
        return SecurityScanResult(
            decision=SecurityDecision(decision),
            risk_score=min(score, 100.0),
            triggered_rules=triggered_rules,
            details={"normalized_length": len(normalized_prompt)},
            latency_ms=latency_ms
        )
