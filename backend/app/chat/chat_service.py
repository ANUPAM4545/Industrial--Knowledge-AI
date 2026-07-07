"""
NEXO — Chat Service
"""
import json
from typing import Any, AsyncGenerator, Dict, Optional

from app.ai.registry import registry
from app.chat.chat_repository import ChatRepository
from app.chat.models import Role
from app.rag.citation_builder import CitationBuilder
from app.rag.context_builder import ContextBuilder
from app.rag.conversation_memory import ConversationMemory
from app.rag.prompt_builder import PromptBuilder
from app.rag.query_processor import QueryProcessor
from app.rag.retriever import RAGRetriever
from app.services.similarity_service import SimilaritySearchService
from app.agents.orchestrator import Orchestrator
from app.agents.interfaces import CopilotState


from app.security.security_service import SecurityService
from app.security.interfaces import SecurityDecision

class ChatService:
    """
    Orchestrates the entire RAG pipeline.
    """
    def __init__(self, repository: ChatRepository, similarity_service: SimilaritySearchService, security_service: SecurityService = None):
        self.repository = repository
        self.retriever = RAGRetriever(similarity_service)
        self.security_service = security_service
        self.query_processor = QueryProcessor()
        self.context_builder = ContextBuilder()
        self.prompt_builder = PromptBuilder()
        self.citation_builder = CitationBuilder()
        self.conversation_memory = ConversationMemory()
        self.orchestrator = Orchestrator()
        
    async def process_chat(
        self, 
        user_id: str, 
        query: str, 
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a chat query non-streaming."""
        # 1. Security Scan (Input) Stage 1 & 2
        if self.security_service:
            sec_result = await self.security_service.scan_chat_input(query, user_id, conversation_id)
            if sec_result.decision == SecurityDecision.BLOCK:
                return {
                    "conversation_id": conversation_id or "blocked",
                    "answer": "This request could not be completed because it conflicts with the platform's safety and security policies.",
                    "citations": [],
                    "traces": []
                }
            elif sec_result.decision == SecurityDecision.REVIEW:
                return {
                    "conversation_id": conversation_id or "review",
                    "answer": "This request is potentially sensitive. Please rephrase.",
                    "citations": [],
                    "traces": []
                }

        # 2. Conversation Management
        if not conversation_id:
            conv = await self.repository.create_conversation(title=query[:50], user_id=user_id)
            conversation_id = conv.id
        else:
            conv = await self.repository.get_conversation(conversation_id, user_id)
            if not conv:
                raise ValueError("Conversation not found")
                
        # Get memory
        chat_history = self.conversation_memory.format_history(conv.messages if conv else [])
        
        # 2. Convert history to dicts for state
        state_messages = []
        if conv and conv.messages:
            for m in conv.messages:
                state_messages.append({"role": m.role.value, "content": m.content})
        state_messages.append({"role": "user", "content": query})
        
        # 3. Build Initial State
        initial_state: CopilotState = {
            "conversation_id": conversation_id,
            "messages": state_messages,
            "current_intent": "",
            "extracted_entities": [],
            "retrieved_chunks": [],
            "knowledge_graph_paths": [],
            "traces": [],
            "final_answer": "",
            "confidence_score": 0.0,
            "next_action": ""
        }
        
        # 4. Run Orchestrator
        final_state = await self.orchestrator.run(initial_state)
        
        # 5. Context Sanitization (Stage 3) - Assuming orchestrator retrieved chunks
        chunks = final_state.get("retrieved_chunks", [])
        if chunks and self.security_service:
            # We just do a quick scan here to log. In a true RAG, we'd sanitize before prompt building.
            # But since Orchestrator is a black box, we scan post-retrieval here for logging.
            text_chunks = [c.page_content if hasattr(c, "page_content") else str(c) for c in chunks]
            sanitized_chunks, ctx_res = await self.security_service.scan_and_sanitize_context(text_chunks, user_id, conversation_id)
        
        answer = final_state.get("final_answer", "I could not process that request.")
        
        # 6. Security Scan (Output) Stage 4
        if self.security_service:
            out_res = await self.security_service.scan_chat_output(answer, user_id, conversation_id)
            if out_res.decision == SecurityDecision.BLOCK:
                answer = "This request could not be completed because it conflicts with the platform's safety and security policies."
        
        traces = final_state.get("traces", [])
        
        # We can extract citations from the retrieved_chunks in the state
        chunks = final_state.get("retrieved_chunks", [])
        citations = self.citation_builder.build(chunks) if chunks else []
        
        # 5. Save Messages
        await self.repository.add_message(conversation_id, Role.USER.value, query)
        await self.repository.add_message(
            conversation_id=conversation_id, 
            role=Role.ASSISTANT.value, 
            content=answer, 
            context_json={"citations": citations, "traces": traces}
        )
        
        return {
            "conversation_id": conversation_id,
            "answer": answer,
            "citations": citations,
            "traces": traces
        }

    async def process_chat_stream(
        self, 
        user_id: str, 
        query: str, 
        conversation_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Process a chat query and stream the response via SSE format."""
        
        # 1. Security Scan (Input)
        if self.security_service:
            sec_result = await self.security_service.scan_chat_input(query, user_id, conversation_id)
            if sec_result.decision == SecurityDecision.BLOCK:
                yield f"data: {json.dumps({'type': 'chunk', 'content': 'This request could not be completed because it conflicts with the platform\\'s safety and security policies.'})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                return
            elif sec_result.decision == SecurityDecision.REVIEW:
                yield f"data: {json.dumps({'type': 'chunk', 'content': 'This request is potentially sensitive. Please rephrase.'})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                return

        if not conversation_id:
            conv = await self.repository.create_conversation(title=query[:50], user_id=user_id)
            conversation_id = conv.id
        else:
            conv = await self.repository.get_conversation(conversation_id, user_id)
            if not conv:
                yield f"data: {json.dumps({'error': 'Conversation not found'})}\n\n"
                return
                
        # 2. Convert history to dicts for state
        state_messages = []
        if conv and conv.messages:
            for m in conv.messages:
                state_messages.append({"role": m.role.value, "content": m.content})
        state_messages.append({"role": "user", "content": query})
        
        # 3. Build Initial State
        initial_state: CopilotState = {
            "conversation_id": conversation_id,
            "messages": state_messages,
            "current_intent": "",
            "extracted_entities": [],
            "retrieved_chunks": [],
            "knowledge_graph_paths": [],
            "traces": [],
            "final_answer": "",
            "confidence_score": 0.0,
            "next_action": ""
        }

        # Save user message immediately
        await self.repository.add_message(conversation_id, Role.USER.value, query)
        
        # Run Orchestrator
        final_state = await self.orchestrator.run(initial_state)
        
        chunks = final_state.get("retrieved_chunks", [])
        if chunks and self.security_service:
            text_chunks = [c.page_content if hasattr(c, "page_content") else str(c) for c in chunks]
            await self.security_service.scan_and_sanitize_context(text_chunks, user_id, conversation_id)
        
        answer = final_state.get("final_answer", "I could not process that request.")
        
        if self.security_service:
            out_res = await self.security_service.scan_chat_output(answer, user_id, conversation_id)
            if out_res.decision == SecurityDecision.BLOCK:
                answer = "This request could not be completed because it conflicts with the platform's safety and security policies."
                
        traces = final_state.get("traces", [])
        chunks = final_state.get("retrieved_chunks", [])
        citations = self.citation_builder.build(chunks) if chunks else []
        
        # Yield metadata (citations, convo ID, traces) first
        meta_event = {
            "type": "metadata",
            "conversation_id": conversation_id,
            "citations": citations,
            "traces": traces
        }
        yield f"data: {json.dumps(meta_event)}\n\n"
        
        # Yield the answer in one go (or chunk it manually for visual effect)
        # In a full langgraph stream, we'd use astream() instead of run()
        for i in range(0, len(answer), 20):
            yield f"data: {json.dumps({'type': 'chunk', 'content': answer[i:i+20]})}\n\n"
            
        # Yield done and save AI response
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        await self.repository.add_message(
            conversation_id=conversation_id, 
            role=Role.ASSISTANT.value, 
            content=answer, 
            context_json={"citations": citations, "traces": traces}
        )
