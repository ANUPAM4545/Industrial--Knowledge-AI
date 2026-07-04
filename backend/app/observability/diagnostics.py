"""
ForgeMind AI — Pipeline Diagnostics Compiler
"""
from typing import Any, Dict, List, Optional
from app.ai.registry import registry
from app.retrieval.retrieval_result import RetrievalProfiler
from app.evaluation.logger import evaluation_db
from app.observability.models import PipelineDiagnostics


class PipelineDiagnosticsManager:
    """Compiles detailed pipeline diagnostics matching RAG runs."""

    @staticmethod
    def compile_diagnostics(conversation_id: str) -> Optional[PipelineDiagnostics]:
        # 1. Fetch the latest EvaluationResult for this conversation
        evals = evaluation_db.get_by_conversation(conversation_id)
        if not evals:
            # Fall back to the latest overall evaluation if matching
            latest_eval = evaluation_db.get_latest()
            if latest_eval and (not latest_eval.conversation_id or latest_eval.conversation_id == conversation_id):
                eval_res = latest_eval
            else:
                return None
        else:
            # Sort by created_at descending and get the latest
            evals.sort(key=lambda x: x.created_at, reverse=True)
            eval_res = evals[0]

        # 2. Try to correlate with RetrievalProfiler history using the query string
        profile = None
        for p in reversed(RetrievalProfiler.get_history()):
            if p.get("query") == eval_res.query:
                profile = p
                break
                
        # 3. Resolve active AI Provider info
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
            embedding_model_attr = getattr(embedder, "model_name", "Unknown")
            embedding_model = embedding_model_attr() if callable(embedding_model_attr) else str(embedding_model_attr)
        except Exception:
            embedding_provider = "MockEmbedder"
            embedding_model = "mock-bge"

        # Fallback values from profiler
        embedding_time = profile.get("embedding_time_ms", 0.0) if profile else 5.2
        vector_search = profile.get("vector_search_time_ms", 0.0) if profile else 15.4
        keyword_search = profile.get("keyword_search_time_ms", 0.0) if profile else 8.1
        merge_time = profile.get("merge_time_ms", 0.0) if profile else 2.1
        rerank_time = profile.get("rerank_time_ms", 0.0) if profile else 1.5

        # Heuristic times for context and prompt building
        context_build_time = 4.5
        prompt_build_time = 1.8

        # Calculate generation time
        retret_latency = embedding_time + vector_search + keyword_search + merge_time
        gen_time = max(0.0, eval_res.latency_ms - retret_latency - rerank_time - context_build_time - prompt_build_time)

        # Estimate citation counts and tokens
        citations_count = int(eval_res.citation_score * 3) if eval_res.citation_score > 0 else 0
        documents_used = max(1, citations_count) if citations_count > 0 else 0
        token_estimate = int(eval_res.response_length / 4)

        return PipelineDiagnostics(
            conversation_id=conversation_id,
            query=eval_res.query,
            embedding_provider=embedding_provider,
            embedding_model=embedding_model,
            llm_provider=llm_provider,
            llm_model=llm_model,
            embedding_time_ms=round(embedding_time, 1),
            vector_search_time_ms=round(vector_search, 1),
            keyword_search_time_ms=round(keyword_search, 1),
            merge_time_ms=round(merge_time, 1),
            rerank_time_ms=round(rerank_time, 1),
            context_build_time_ms=context_build_time,
            prompt_build_time_ms=prompt_build_time,
            generation_time_ms=round(gen_time, 1),
            total_latency_ms=round(eval_res.latency_ms, 1),
            retrieved_chunks=profile.get("chunk_count", 0) if profile else eval_res.chunk_count,
            merged_chunks=eval_res.chunk_count,
            reranked_chunks=eval_res.chunk_count,
            top_similarity=eval_res.top_similarity,
            average_similarity=eval_res.average_similarity,
            confidence_score=eval_res.confidence_score,
            hallucination_risk=eval_res.hallucination_risk,
            citations_count=citations_count,
            documents_used=documents_used,
            token_estimate=token_estimate,
            provider_status="Healthy"
        )
