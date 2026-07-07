from abc import ABC, abstractmethod
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel

class SecurityDecision(str, Enum):
    ALLOW = "ALLOW"
    REVIEW = "REVIEW"
    BLOCK = "BLOCK"

class SecurityScanResult(BaseModel):
    decision: SecurityDecision
    risk_score: float  # 0 to 100
    triggered_rules: List[str]
    details: Dict[str, Any]
    latency_ms: float = 0.0
    
class InputGuard(ABC):
    @abstractmethod
    async def scan_input(self, user_prompt: str, context: Dict[str, Any] = None) -> SecurityScanResult:
        """Scan incoming user prompt before retrieval."""
        pass

class ContextSanitizer(ABC):
    @abstractmethod
    async def sanitize(self, chunks: List[str]) -> List[str]:
        """Sanitize RAG retrieved chunks before passing to LLM."""
        pass
        
    @abstractmethod
    async def scan_context(self, chunks: List[str]) -> SecurityScanResult:
        """Scan RAG chunks for indirect prompt injection."""
        pass

class OutputGuard(ABC):
    @abstractmethod
    async def scan_output(self, llm_response: str, context: Dict[str, Any] = None) -> SecurityScanResult:
        """Scan LLM response before returning to user."""
        pass
        
class DocumentGuard(ABC):
    @abstractmethod
    async def scan_document(self, text_content: str) -> SecurityScanResult:
        """Scan uploaded document for embedded attacks."""
        pass

class PolicyValidator(ABC):
    @abstractmethod
    def validate_policy(self, scan_result: SecurityScanResult) -> SecurityDecision:
        """Apply business policies to raw scan results."""
        pass

class SecurityLogger(ABC):
    @abstractmethod
    async def log_event(self, event_type: str, user_id: str, scan_result: SecurityScanResult, conversation_id: Optional[str] = None) -> None:
        """Persist security events to the database."""
        pass
