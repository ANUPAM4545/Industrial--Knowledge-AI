import time
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from .interfaces import SecurityScanResult, SecurityDecision
from .fast_input_guard import FastInputGuard
from .heuristic_input_guard import HeuristicInputGuard
from .pii_detector import PIIDetector
from .context_sanitizer import DefaultContextSanitizer
from .output_guard import DefaultOutputGuard
from .security_logger import DBSecurityLogger
from .security_config import get_decision_from_score

class SecurityService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.fast_guard = FastInputGuard()
        self.heuristic_guard = HeuristicInputGuard()
        self.pii_detector = PIIDetector()
        self.context_sanitizer = DefaultContextSanitizer()
        self.output_guard = DefaultOutputGuard()
        self.logger = DBSecurityLogger(session)
        
    def _merge_results(self, results: List[SecurityScanResult]) -> SecurityScanResult:
        if not results:
            return SecurityScanResult(decision=SecurityDecision.ALLOW, risk_score=0.0, triggered_rules=[], details={}, latency_ms=0.0)
            
        max_score = max(r.risk_score for r in results)
        total_latency = sum(r.latency_ms for r in results)
        all_rules = []
        for r in results:
            all_rules.extend(r.triggered_rules)
            
        decision = get_decision_from_score(max_score)
        
        return SecurityScanResult(
            decision=SecurityDecision(decision),
            risk_score=max_score,
            triggered_rules=list(set(all_rules)),
            details={"stages_run": len(results)},
            latency_ms=total_latency
        )

    async def scan_chat_input(self, user_prompt: str, user_id: str, conversation_id: Optional[str] = None) -> SecurityScanResult:
        """Stage 1 & 2: Fast & Heuristic Input Scanning."""
        start_time = time.perf_counter()
        
        # Fast Scan (Stage 1)
        fast_result = await self.fast_guard.scan_input(user_prompt)
        if fast_result.decision == SecurityDecision.BLOCK:
            await self.logger.log_event("chat_input_fast", user_id, fast_result, conversation_id)
            return fast_result
            
        # Heuristic Scan (Stage 2)
        heuristic_result = await self.heuristic_guard.scan_input(user_prompt)
        pii_result = await self.pii_detector.scan_input(user_prompt)
        
        final_result = self._merge_results([fast_result, heuristic_result, pii_result])
        final_result.latency_ms = (time.perf_counter() - start_time) * 1000
        
        await self.logger.log_event("chat_input", user_id, final_result, conversation_id)
        return final_result

    async def scan_and_sanitize_context(self, chunks: List[str], user_id: str, conversation_id: Optional[str] = None) -> tuple[List[str], SecurityScanResult]:
        """Stage 3: Scan and sanitize retrieved context."""
        start_time = time.perf_counter()
        
        scan_result = await self.context_sanitizer.scan_context(chunks)
        sanitized_chunks = await self.context_sanitizer.sanitize(chunks)
        
        scan_result.latency_ms = (time.perf_counter() - start_time) * 1000
        await self.logger.log_event("context_scan", user_id, scan_result, conversation_id)
        
        return sanitized_chunks, scan_result

    async def scan_chat_output(self, llm_response: str, user_id: str, conversation_id: Optional[str] = None) -> SecurityScanResult:
        """Stage 4: Output Scanning."""
        result = await self.output_guard.scan_output(llm_response)
        await self.logger.log_event("chat_output", user_id, result, conversation_id)
        return result
        
    async def scan_document_upload(self, text_content: str, user_id: str) -> SecurityScanResult:
        """Scan uploaded document for malicious payloads."""
        # For documents, we run the fast and heuristic guards against the entire text
        # But we limit the length to prevent DoS
        from .security_config import MAX_DOCUMENT_SCAN_LENGTH
        text_to_scan = text_content[:MAX_DOCUMENT_SCAN_LENGTH]
        
        fast_result = await self.fast_guard.scan_input(text_to_scan)
        heuristic_result = await self.heuristic_guard.scan_input(text_to_scan)
        
        final_result = self._merge_results([fast_result, heuristic_result])
        await self.logger.log_event("document_upload", user_id, final_result)
        return final_result
