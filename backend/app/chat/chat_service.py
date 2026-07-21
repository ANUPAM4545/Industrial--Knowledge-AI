"""
NEXO — Chat Service
"""
import json
from typing import Any, AsyncGenerator, Dict, Optional

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
    def __init__(self, repository: ChatRepository, document_repository, similarity_service: SimilaritySearchService, security_service: SecurityService = None):
        self.repository = repository
        self.document_repository = document_repository
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
        workspace_id: str,
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

        # 1.5 Document Base Check
        user_docs, _ = await self.document_repository.list_by_workspace(workspace_id=workspace_id, page_size=1)
        if not user_docs:
            return {
                "conversation_id": conversation_id or "blocked",
                "answer": "No documents have been indexed yet. Upload a document to start chatting.",
                "citations": [],
                "traces": []
            }
        
        has_ready = any(d.status.value == "ready" for d in user_docs) if user_docs else False
        if not has_ready:
            # Let's get the full list to check processing vs failed
            all_docs, _ = await self.document_repository.list_by_workspace(workspace_id=workspace_id, page_size=100)
            if all_docs and any(d.status.value in ["uploaded", "processing"] for d in all_docs):
                msg = "Your documents are still being processed. Please wait until indexing is complete."
            else:
                msg = "No documents have been successfully indexed yet. Upload a document to start chatting."
                
            return {
                "conversation_id": conversation_id or "blocked",
                "answer": msg,
                "citations": [],
                "traces": []
            }
            
        valid_document_ids = [d.id for d in user_docs if d.status.value == "ready"]
        document_titles = {d.id: d.title for d in user_docs}

        # 2. Conversation Management
        if not conversation_id:
            conv = await self.repository.create_conversation(title=query[:50], user_id=user_id, workspace_id=workspace_id)
            conversation_id = conv.id
        else:
            conv = await self.repository.get_conversation(conversation_id, user_id, workspace_id)
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
            "user_id": user_id,
            "workspace_id": workspace_id,
            "messages": state_messages,
            "current_intent": "",
            "extracted_entities": [],
            "retrieved_chunks": [],
            "knowledge_graph_paths": [],
            "traces": [],
            "final_answer": "",
            "confidence_score": 0.0,
            "next_action": "",
            "validation_passed": False,
            "no_context_found": False,
            "citations": [],
            "valid_document_ids": valid_document_ids,
            "document_titles": document_titles
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
        document_titles = final_state.get("document_titles", {})
        citations = self.citation_builder.build(chunks, document_titles) if chunks else []
        
        # 5. Save Messages
        await self.repository.add_message(conversation_id, Role.USER.value, query, workspace_id)
        await self.repository.add_message(
            conversation_id=conversation_id, 
            role=Role.ASSISTANT.value, 
            content=answer, 
            workspace_id=workspace_id,
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
        workspace_id: str,
        query: str, 
        conversation_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Process a chat query and stream the response via SSE format."""
        import time
        import asyncio
        
        start_time = time.time()
        
        # 1. Security Scan (Input)
        if self.security_service:
            sec_result = await self.security_service.scan_chat_input(query, user_id, conversation_id)
            if sec_result.decision == SecurityDecision.BLOCK:
                msg = "This request could not be completed because it conflicts with the platform's safety and security policies."
                yield f"data: {json.dumps({'type': 'chunk', 'content': msg})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                return
            elif sec_result.decision == SecurityDecision.REVIEW:
                msg = "This request is potentially sensitive. Please rephrase."
                yield f"data: {json.dumps({'type': 'chunk', 'content': msg})}\n\n"
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
                return

        # 1.5 Document Base Check
        user_docs, _ = await self.document_repository.list_by_workspace(workspace_id=workspace_id, page_size=1)
        if not user_docs:
            msg = "No documents have been indexed yet. Upload a document to start chatting."
            yield f"data: {json.dumps({'type': 'chunk', 'content': msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            return
            
        has_ready = any(d.status.value == "ready" for d in user_docs) if user_docs else False
        if not has_ready:
            all_docs, _ = await self.document_repository.list_by_workspace(workspace_id=workspace_id, page_size=100)
            if all_docs and any(d.status.value in ["uploaded", "processing"] for d in all_docs):
                msg = "Your documents are still being processed. Please wait until indexing is complete."
            else:
                msg = "No documents have been successfully indexed yet. Upload a document to start chatting."
            yield f"data: {json.dumps({'type': 'chunk', 'content': msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            return
            
        valid_document_ids = [d.id for d in user_docs if d.status.value == "ready"]
        document_titles = {d.id: d.title for d in user_docs}

        if not conversation_id:
            conv = await self.repository.create_conversation(title=query[:50], user_id=user_id, workspace_id=workspace_id)
            conversation_id = conv.id
        else:
            conv = await self.repository.get_conversation(conversation_id, user_id, workspace_id)
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
            "user_id": user_id,
            "workspace_id": workspace_id,
            "messages": state_messages,
            "current_intent": "",
            "extracted_entities": [],
            "retrieved_chunks": [],
            "knowledge_graph_paths": [],
            "traces": [],
            "final_answer": "",
            "confidence_score": 0.0,
            "next_action": "",
            "validation_passed": False,
            "no_context_found": False,
            "citations": [],
            "valid_document_ids": valid_document_ids,
            "document_titles": document_titles
        }

        # Save user message immediately
        await self.repository.add_message(conversation_id, Role.USER.value, query, workspace_id)
        
        try:
            # Run Orchestrator. The reasoning agent inside generates and validates the entire response
            # to guarantee no unverified output is exposed.
            final_state = await self.orchestrator.run(initial_state)
            
            ttft = time.time() - start_time
            
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
            document_titles = final_state.get("document_titles", {})
            citations = self.citation_builder.build(chunks, document_titles) if chunks else []
            
            # Update traces with overall streaming metrics
            completion_time = time.time() - start_time
            tokens_sec = len(answer.split()) / completion_time if completion_time > 0 else 0
            for t in traces:
                if t.get("agent_name") == "Advanced Reasoning Agent":
                    if "metadata" not in t:
                        t["metadata"] = {}
                    t["metadata"]["ttft_sec"] = round(ttft, 2)
                    t["metadata"]["total_generation_time"] = round(completion_time, 2)
                    t["metadata"]["tokens_per_sec"] = round(tokens_sec, 2)
            
            # Yield metadata (citations, convo ID, traces) first
            meta_event = {
                "type": "metadata",
                "conversation_id": conversation_id,
                "citations": citations,
                "traces": traces
            }
            yield f"data: {json.dumps(meta_event)}\n\n"
            
            # Stream the validated answer to simulate real-time typing safely
            for i in range(0, len(answer), 20):
                yield f"data: {json.dumps({'type': 'chunk', 'content': answer[i:i+20]})}\n\n"
                await asyncio.sleep(0.01) # Backpressure/disconnect yield point
                
            # Yield done and save AI response
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            await self.repository.add_message(
                conversation_id=conversation_id, 
                role=Role.ASSISTANT.value, 
                content=answer, 
                workspace_id=workspace_id,
                context_json={"citations": citations, "traces": traces}
            )
        except asyncio.CancelledError:
            # Client disconnected mid-stream
            print(f"Stream cancelled by client for conversation {conversation_id}")
            raise
        except Exception as e:
            print(f"Streaming error: {e}")
            yield f"data: {json.dumps({'type': 'chunk', 'content': 'An error occurred during generation.'})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
