"""
ForgeMind AI — Chat Service
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


class ChatService:
    """
    Orchestrates the entire RAG pipeline.
    """
    def __init__(self, repository: ChatRepository, similarity_service: SimilaritySearchService):
        self.repository = repository
        self.retriever = RAGRetriever(similarity_service)
        self.query_processor = QueryProcessor()
        self.context_builder = ContextBuilder()
        self.prompt_builder = PromptBuilder()
        self.citation_builder = CitationBuilder()
        self.conversation_memory = ConversationMemory()
        
    async def process_chat(
        self, 
        user_id: str, 
        query: str, 
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a chat query non-streaming."""
        # 1. Conversation Management
        if not conversation_id:
            conv = await self.repository.create_conversation(title=query[:50], user_id=user_id)
            conversation_id = conv.id
        else:
            conv = await self.repository.get_conversation(conversation_id, user_id)
            if not conv:
                raise ValueError("Conversation not found")
                
        # Get memory
        chat_history = self.conversation_memory.format_history(conv.messages if conv else [])
        
        # 2. Query Processing
        processed_query = self.query_processor.process(query, chat_history)
        
        # 3. Retrieval
        retrieved_chunks = await self.retriever.retrieve(query=processed_query, limit=5)
        
        # 4. Context Building
        context_text = self.context_builder.build(retrieved_chunks)
        citations = self.citation_builder.build(retrieved_chunks)
        
        # 5. Prompt Building
        system_prompt = self.prompt_builder.build_system_prompt(context_text)
        user_prompt = self.prompt_builder.build_user_prompt(processed_query)
        
        # Append history if we want
        if chat_history:
            history_text = "\n".join([f"{m.role}: {m.content}" for m in chat_history])
            user_prompt = f"Previous conversation:\n{history_text}\n\n{user_prompt}"
            
        # 6. LLM Generation
        llm = registry.get_llm_provider()
        answer = await llm.generate(prompt=user_prompt, system_prompt=system_prompt)
        
        # 7. Save Messages
        await self.repository.add_message(conversation_id, Role.USER.value, query)
        await self.repository.add_message(
            conversation_id=conversation_id, 
            role=Role.ASSISTANT.value, 
            content=answer, 
            context_json={"citations": citations}
        )
        
        return {
            "conversation_id": conversation_id,
            "answer": answer,
            "citations": citations
        }

    async def process_chat_stream(
        self, 
        user_id: str, 
        query: str, 
        conversation_id: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Process a chat query and stream the response via SSE format."""
        
        if not conversation_id:
            conv = await self.repository.create_conversation(title=query[:50], user_id=user_id)
            conversation_id = conv.id
        else:
            conv = await self.repository.get_conversation(conversation_id, user_id)
            if not conv:
                yield f"data: {json.dumps({'error': 'Conversation not found'})}\n\n"
                return
                
        chat_history = self.conversation_memory.format_history(conv.messages if conv else [])
        processed_query = self.query_processor.process(query, chat_history)
        retrieved_chunks = await self.retriever.retrieve(query=processed_query, limit=5)
        context_text = self.context_builder.build(retrieved_chunks)
        citations = self.citation_builder.build(retrieved_chunks)
        
        system_prompt = self.prompt_builder.build_system_prompt(context_text)
        user_prompt = self.prompt_builder.build_user_prompt(processed_query)
        
        if chat_history:
            history_text = "\n".join([f"{m.role}: {m.content}" for m in chat_history])
            user_prompt = f"Previous conversation:\n{history_text}\n\n{user_prompt}"

        # Save user message immediately
        await self.repository.add_message(conversation_id, Role.USER.value, query)
        
        # Yield metadata (citations & convo ID) first
        meta_event = {
            "type": "metadata",
            "conversation_id": conversation_id,
            "citations": citations
        }
        yield f"data: {json.dumps(meta_event)}\n\n"
        
        llm = registry.get_llm_provider()
        
        full_answer = ""
        try:
            async for chunk in llm.stream_generate(prompt=user_prompt, system_prompt=system_prompt):
                full_answer += chunk
                yield f"data: {json.dumps({'type': 'chunk', 'content': chunk})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
            
        # Yield done and save AI response
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
        await self.repository.add_message(
            conversation_id=conversation_id, 
            role=Role.ASSISTANT.value, 
            content=full_answer, 
            context_json={"citations": citations}
        )
