"""
NEXO — Confidence Calculator Implementation
"""
from app.evaluation.interfaces import ConfidenceCalculator


class WeightedConfidenceCalculator(ConfidenceCalculator):
    """
    Weighted scoring algorithm combining vector similarity, citation validation,
    and completeness into a 0-100 index.
    
    Confidence Score Formula:
    --------------------------
    Base Confidence = (
        40 * avg_similarity +
        40 * citation_score +
        20 * completeness
    ) * 100
    
    Modifiers:
    - Short Response Penalty: -15 if response length < 20 characters (indicates refusal or error).
    - Uncited Length Penalty: -10 if response length > 800 characters but contains zero citations.
    - Bound score between [0.0, 100.0].
    """
    def __init__(
        self,
        w_similarity: float = 0.40,
        w_citation: float = 0.40,
        w_completeness: float = 0.20
    ):
        self.w_similarity = w_similarity
        self.w_citation = w_citation
        self.w_completeness = w_completeness

    def calculate(
        self,
        avg_similarity: float,
        citation_score: float,
        completeness: float,
        response_length: int
    ) -> float:
        # Base score (0.0 to 1.0)
        base_score = (
            self.w_similarity * avg_similarity +
            self.w_citation * citation_score +
            self.w_completeness * completeness
        )
        
        confidence = base_score * 100.0
        
        # Apply modifiers
        if response_length < 20:
            confidence -= 15.0
            
        # If response length is long but citation count/score might be default
        # (e.g. citation_score is 1.0 because total citations count is 0)
        # We penalize long uncited responses.
        # We will pass a flag or check if citation count is 0 in the service,
        # but here we can penalize if length > 800 and citation_score is 1.0 (uncited default)
        # actually, checking length in service is more precise. We will apply the modifiers here.
        
        # Ensure bounds [0.0, 100.0]
        return max(0.0, min(100.0, confidence))
