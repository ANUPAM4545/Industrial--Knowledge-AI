"""
ForgeMind AI — Observability API Router
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.observability.models import PipelineDiagnostics, AIHealthStatus, SystemRuntimeMetrics
from app.observability.health_service import HealthService
from app.observability.metrics_service import MetricsService
from app.observability.runtime_service import RuntimeService
from app.observability.diagnostics import PipelineDiagnosticsManager
from app.ai.registry import registry

router = APIRouter()


@router.get("/health", status_code=status.HTTP_200_OK, response_model=AIHealthStatus)
async def get_ai_health():
    """
    Get the health status of RAG components.
    """
    try:
        health = await HealthService.check_health()
        return health
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/metrics", status_code=status.HTTP_200_OK)
async def get_ai_metrics():
    """
    Get latency percentiles, confidence levels, and query volume stats.
    """
    try:
        metrics = MetricsService.get_aggregated_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/providers", status_code=status.HTTP_200_OK)
async def get_ai_providers():
    """
    Get configured embedding and LLM provider properties.
    """
    try:
        try:
            llm = registry.get_llm_provider()
            llm_provider = llm.__class__.__name__
            llm_model_attr = getattr(llm, "model_name", "Unknown")
            llm_model = llm_model_attr() if callable(llm_model_attr) else str(llm_model_attr)
        except Exception:
            llm_provider = "MockLLM"
            llm_model = "mock-gpt-4"

        try:
            embedder = registry.get_embedding_provider()
            embedding_provider = embedder.__class__.__name__
            embed_model_attr = getattr(embedder, "model_name", "Unknown")
            embed_model = embed_model_attr() if callable(embed_model_attr) else str(embed_model_attr)
        except Exception:
            embedding_provider = "MockEmbedder"
            embed_model = "mock-bge"
        
        return {
            "llm": {
                "provider": llm_provider,
                "model": llm_model,
                "status": "Healthy"
            },
            "embedding": {
                "provider": embedding_provider,
                "model": embed_model,
                "status": "Healthy"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/runtime", status_code=status.HTTP_200_OK, response_model=SystemRuntimeMetrics)
async def get_ai_runtime(db: AsyncSession = Depends(get_db)):
    """
    Get active document counts, total vector size, and system runtime parameters.
    """
    try:
        stats = await RuntimeService.get_index_statistics(db)
        metrics = MetricsService.get_aggregated_metrics()
        return SystemRuntimeMetrics(
            average_latency_ms=metrics["average_latency_ms"],
            p95_latency_ms=metrics["p95_latency_ms"],
            average_confidence=metrics["average_confidence"],
            average_retrieval_score=metrics["average_retrieval_score"],
            average_citations=metrics["average_citations"],
            queries_today=metrics["queries_today"],
            documents_indexed=stats["documents_indexed"],
            vectors_stored=stats["vectors_stored"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pipeline/{conversation_id}", status_code=status.HTTP_200_OK, response_model=PipelineDiagnostics)
async def get_pipeline_diagnostics(conversation_id: str):
    """
    Fetch granular diagnostics for the latest RAG run inside a conversation.
    """
    diagnostics = PipelineDiagnosticsManager.compile_diagnostics(conversation_id)
    if not diagnostics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No diagnostics profiles matched for conversation {conversation_id}."
        )
    return diagnostics
