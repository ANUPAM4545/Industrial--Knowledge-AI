"""
NEXO — Retrieval Agent
Queries the Vector Database (Qdrant) for semantic matches.
"""
from typing import Dict, Any

from app.agents.interfaces import BaseAgent, CopilotState, AgentTrace
from app.services.similarity_service import SimilaritySearchService
from app.core.config import settings

from app.rag.reranker import RRFReranker
from app.repositories.chunk_repository import ChunkRepository
from app.db.session import AsyncSessionLocal
import asyncio

class RetrievalAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Semantic Retrieval Agent"

    async def process(self, state: CopilotState) -> dict:
        import time
        start_time = time.time()
        
        messages = state.get("messages", [])
        query = messages[-1]["content"] if messages else ""
        valid_document_ids = state.get("valid_document_ids", [])
        
        async def fetch_dense():
            try:
                return await SimilaritySearchService.search(query=query, limit=20, document_ids=valid_document_ids)
            except Exception as e:
                print(f"Dense retrieval failed: {e}")
                return []
                
        async def fetch_keyword():
            try:
                async with AsyncSessionLocal() as db:
                    return await ChunkRepository.search_keyword(db, query=query, document_ids=valid_document_ids, limit=20)
            except Exception as e:
                print(f"Keyword retrieval failed: {e}")
                return []
        
        # Execute dense and keyword search in parallel
        dense_chunks, keyword_chunks = await asyncio.gather(fetch_dense(), fetch_keyword())
            
        retrieval_latency = round((time.time() - start_time) * 1000, 2)
        
        # Combine unique chunks based on chunk_id and filter by workspace
        combined_dict = {}
        for c in dense_chunks:
            payload = c.get("payload") if "payload" in c else c
            doc_id = payload.get("document_id")
            if doc_id not in valid_document_ids:
                continue
            chunk_id = c.get("id") or payload.get("chunk_id") or payload.get("chunk_index")
            combined_dict[chunk_id] = payload
            combined_dict[chunk_id]["score"] = c.get("score", 0.0)
            
        for c in keyword_chunks:
            doc_id = c.get("document_id")
            if doc_id not in valid_document_ids:
                continue
            chunk_id = c.get("chunk_id")
            if chunk_id not in combined_dict:
                combined_dict[chunk_id] = c
                combined_dict[chunk_id]["score"] = 0.0
                
        combined_chunks = list(combined_dict.values())
        
        # Rerank using RRF
        reranker_start = time.time()
        reranker = RRFReranker(k=60)
        # Enforce token budget by limiting to top 5 chunks
        reranked_chunks = await reranker.rerank(query, combined_chunks, top_k=5)
        
        rrf_latency = round((time.time() - reranker_start) * 1000, 2)
        
        # Deduplicate identical text (near-duplicates)
        unique_chunks = []
        seen_texts = set()
        for chunk in reranked_chunks:
            text = chunk.get("text", "").strip()
            if text not in seen_texts:
                seen_texts.add(text)
                unique_chunks.append(chunk)
        reranked_chunks = unique_chunks
        
        dense_max_score = max((c.get("score", 0.0) for c in reranked_chunks), default=0.0)
        rrf_max_score = max((c.get("rrf_score", 0.0) for c in reranked_chunks), default=0.0)
        num_chunks = len(reranked_chunks)
        
        # Confidence Calibration
        confidence_level = "Low"
        min_confidence = getattr(settings, "MIN_CONFIDENCE_SCORE", 0.70)
        if num_chunks >= 1 and (dense_max_score >= min_confidence or rrf_max_score >= 0.02):
            if dense_max_score >= min_confidence + 0.05 and num_chunks >= 2:
                confidence_level = "High"
            else:
                confidence_level = "Medium"
        
        validation_passed = True
        no_context_found = False
        
        # Verify minimum retrieval confidence and at least one chunk
        if num_chunks == 0 or confidence_level == "Low":
            validation_passed = False
            no_context_found = True
            reranked_chunks = []
        
        trace = AgentTrace(
            agent_name=self.name,
            action="Executed Hybrid Dense + BM25 Reciprocal Rank Fusion Retrieval.",
            latency_ms=retrieval_latency + rrf_latency,
            confidence=confidence_level,
            metadata={
                "dense_candidates": len(dense_chunks),
                "keyword_candidates": len(keyword_chunks),
                "combined_candidates": len(combined_chunks),
                "chunks_retrieved": len(reranked_chunks), 
                "dense_max_score": dense_max_score, 
                "rrf_max_score": rrf_max_score,
                "validation_passed": validation_passed,
                "latencies_ms": {"dense_and_bm25": retrieval_latency, "rrf": rrf_latency}
            }
        )
        
        return {
            "retrieved_chunks": reranked_chunks,
            "next_action": "reasoning_agent",
            "validation_passed": validation_passed,
            "no_context_found": no_context_found,
            "traces": [trace]
        }
