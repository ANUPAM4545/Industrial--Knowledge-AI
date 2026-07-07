from typing import Dict, Any

SECURITY_THRESHOLDS: Dict[str, float] = {
    "safe_max": 20.0,
    "low_risk_max": 50.0,
    "medium_risk_max": 70.0,
}

def get_decision_from_score(score: float) -> str:
    """Map a risk score 0-100 to a SecurityDecision."""
    if score <= SECURITY_THRESHOLDS["safe_max"]:
        return "ALLOW"
    elif score <= SECURITY_THRESHOLDS["low_risk_max"]:
        return "ALLOW"
    elif score <= SECURITY_THRESHOLDS["medium_risk_max"]:
        return "REVIEW"
    else:
        return "BLOCK"

MAX_PROMPT_LENGTH = 10000
MAX_CHUNK_LENGTH = 3000
MAX_DOCUMENT_SCAN_LENGTH = 1000000

REDACT_PII = True
