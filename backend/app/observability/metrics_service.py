"""
NEXO — System Quality Telemetry Metrics
"""
from datetime import datetime, timezone
import math
from typing import Any, Dict
from app.evaluation.logger import evaluation_db


class MetricsService:
    """Aggregates telemetry and query metrics for evaluation dashboards."""

    @staticmethod
    def get_aggregated_metrics() -> Dict[str, Any]:
        db_records = evaluation_db._records
        if not db_records:
            return {
                "average_latency_ms": 0.0,
                "p95_latency_ms": 0.0,
                "average_confidence": 0.0,
                "average_retrieval_score": 0.0,
                "average_citations": 0.0,
                "queries_today": 0
            }
            
        latencies = [r.latency_ms for r in db_records]
        confidences = [r.confidence_score for r in db_records]
        retrievals = [r.retrieval_score for r in db_records]
        citations = [int(r.citation_score * 3) for r in db_records]  # Estimate count from citation score
        
        # Average Latency
        avg_lat = sum(latencies) / len(latencies)
        
        # P95 Latency
        sorted_latencies = sorted(latencies)
        p95_idx = max(0, min(len(sorted_latencies) - 1, math.ceil(len(sorted_latencies) * 0.95) - 1))
        p95_lat = sorted_latencies[p95_idx]
        
        # Average Confidence
        avg_conf = sum(confidences) / len(confidences)
        
        # Average Retrieval
        avg_ret = sum(retrievals) / len(retrievals)
        
        # Average Citations
        avg_cite = sum(citations) / len(citations)
        
        # Queries Today
        today = datetime.now(timezone.utc).date()
        queries_today = sum(1 for r in db_records if r.created_at.date() == today)
        
        return {
            "average_latency_ms": round(avg_lat, 1),
            "p95_latency_ms": round(p95_lat, 1),
            "average_confidence": round(avg_conf, 1),
            "average_retrieval_score": round(avg_ret, 2),
            "average_citations": round(avg_cite, 1),
            "queries_today": queries_today
        }
