"""
NEXO — AI Health Checker Service
"""
from typing import Any, Dict
from app.ai.registry import registry


class HealthService:
    """Queries AI layers to assess overall service health status."""

    @staticmethod
    async def check_health() -> Dict[str, Any]:
        # 1. Embedding health
        try:
            embedder = registry.get_embedding_provider()
            embed_health = await embedder.health_check()
            status_val = embed_health.get("status", "").lower()
            embedding_status = "Healthy" if status_val in ["healthy", "ok", "active"] else "Degraded"
        except Exception:
            embedding_status = "Unavailable"

        # 2. Vector store health
        try:
            store = registry.get_vector_store()
            store_health = await store.health_check()
            status_val = store_health.get("status", "").lower()
            vector_status = "Healthy" if status_val in ["healthy", "ok", "active"] else "Degraded"
        except Exception:
            vector_status = "Unavailable"

        # 3. LLM health
        try:
            llm = registry.get_llm_provider()
            llm_health = await llm.health_check()
            status_val = llm_health.get("status", "").lower()
            llm_status = "Healthy" if status_val in ["healthy", "ok", "active"] else "Degraded"
        except Exception:
            llm_status = "Unavailable"

        # 4. Retriever health
        try:
            kw_provider = registry.get_keyword_provider()
            kw_health = await kw_provider.health_check()
            status_val = kw_health.get("status", "").lower()
            retriever_status = "Healthy" if status_val in ["healthy", "ok", "active"] else "Degraded"
        except Exception:
            retriever_status = "Unavailable"

        # 5. Evaluation framework health (In-memory storage is always healthy)
        evaluation_status = "Healthy"

        # Calculate overall status
        statuses = [embedding_status, vector_status, llm_status, retriever_status]
        if all(s == "Healthy" for s in statuses):
            overall = "Healthy"
        elif "Unavailable" in statuses:
            overall = "Unavailable"
        else:
            overall = "Degraded"

        return {
            "embedding_status": embedding_status,
            "vector_store_status": vector_status,
            "retriever_status": retriever_status,
            "llm_status": llm_status,
            "evaluation_status": evaluation_status,
            "overall_status": overall
        }
