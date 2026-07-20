"""
NEXO — Reasoning Agent
Synthesizes retrieved chunks and graph data using an LLM.
"""
from typing import Dict, Any

from app.agents.interfaces import BaseAgent, CopilotState, AgentTrace
from app.ai.registry import registry

class ReasoningAgent(BaseAgent):
    @property
    def name(self) -> str:
        return "Advanced Reasoning Agent"

    async def process(self, state: CopilotState) -> dict:
        import time
        import re
        start_time = time.time()
        
        refusal_msg = "I couldn't find information related to your question in your current knowledge base. Try uploading additional documents or ask a question about one of your indexed documents."
        
        if state.get("no_context_found", False):
            return {
                "final_answer": refusal_msg,
                "confidence_score": 0.0,
                "next_action": "end",
                "traces": []
            }
            
        chunks = state.get("retrieved_chunks", [])
        document_titles = state.get("document_titles", {})
        
        valid_citation_tags = set()
        
        # Build Context String
        context_text = ""
        for i, c in enumerate(chunks):
            doc_id = c.get("document_id", "Unknown")
            doc_title = document_titles.get(doc_id, f"Document {doc_id[:8]}")
            page = c.get("page_number")
            page_str = f"Page {page}" if page else "Section 1"
            citation_tag = f"{doc_title} • {page_str}"
            valid_citation_tags.add(citation_tag)
            
            text = c.get("text", "")
            context_text += f"\n[{citation_tag}]:\n{text}\n"
            
        messages = state.get("messages", [])
        user_query = messages[-1]["content"] if messages else ""
        
        prompt = f"""You are NEXO AI, a Strict Enterprise Knowledge Workspace Assistant.

RULES:
1. You MUST answer the user's question ONLY using the provided Context.
2. MULTI-DOCUMENT SYNTHESIS: If the answer requires synthesizing information across multiple documents in the Context, combine them logically.
3. NEVER use your own background knowledge. NEVER hallucinate, guess, or fabricate information.
4. If the Context is insufficient to answer the question in full, explicitly state what is missing or politely refuse by saying:
   "{refusal_msg}"
5. MANDATORY CITATIONS: Every factual claim MUST be followed by an exact citation in the format [Document Name • Page X].
   Example: The system supports vector search [AI Marketing Suite • Page 3].

CONTEXT:
{context_text}

USER QUESTION:
{user_query}
"""

        llm = registry.get_llm_provider("gemini")
        try:
            # Use stream_generate but consume it for validation before exposing it
            generator = llm.stream_generate(prompt)
            answer = ""
            async for chunk_text in generator:
                answer += chunk_text
                
            # Citation Verification
            # Find all citations like [Title • Page X]
            citations_found = re.findall(r'\[([^\]]+)\]', answer)
            # Filter out ones that don't have the bullet to avoid matching normal brackets
            citations_found = [c for c in citations_found if "•" in c]
            
            invalid_citations = []
            for cit in citations_found:
                if cit not in valid_citation_tags:
                    invalid_citations.append(cit)
                    
            if invalid_citations:
                # Strict mode: Reject the entire response if any citation is hallucinated
                answer = refusal_msg
                
            # Basic validation for hallucination refusal
            if "I couldn't find" in answer and len(answer) < 200:
                answer = refusal_msg
                
        except Exception as e:
            answer = refusal_msg
            
        latency = round((time.time() - start_time) * 1000, 2)
        
        trace = AgentTrace(
            agent_name=self.name,
            action="Synthesized contexts and validated citations via Gemini LLM stream generation.",
            latency_ms=latency,
            confidence="High" if answer != refusal_msg else "Low",
            metadata={"model": "gemini", "tokens_used": len(prompt.split()), "valid_citations": len(valid_citation_tags)}
        )
        
        return {
            "final_answer": answer,
            "confidence_score": 0.95,
            "next_action": "end",
            "traces": [trace]
        }
