"""
ForgeMind AI — AI Chat Endpoints
POST /chat/conversations           — Create a new conversation
GET  /chat/conversations           — List conversations
GET  /chat/conversations/{id}      — Get conversation with messages
DELETE /chat/conversations/{id}    — Delete a conversation
POST /chat/conversations/{id}/message — Send a message and get AI response
GET  /chat/conversations/{id}/stream  — Stream AI response (SSE)
"""
from fastapi import APIRouter, Query, status
from fastapi.responses import StreamingResponse

from app.schemas.chat import (
    ConversationResponse,
    CreateConversationRequest,
    MessageRequest,
    MessageResponse,
)

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(body: CreateConversationRequest):
    """
    Start a new AI chat conversation.
    Optionally bind specific document IDs to the conversation scope.
    TODO: Create conversation record in DB.
    """
    raise NotImplementedError("Create conversation not yet implemented")


@router.get("/conversations", status_code=status.HTTP_200_OK)
async def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    archived: bool = Query(False),
):
    """
    List the current user's conversations.
    TODO: Implement conversation repository query.
    """
    raise NotImplementedError("List conversations not yet implemented")


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str):
    """
    Retrieve a conversation with its full message history.
    TODO: Join conversations with messages.
    """
    raise NotImplementedError("Get conversation not yet implemented")


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and all associated messages.
    TODO: Cascade delete via DB.
    """
    return None


@router.post("/conversations/{conversation_id}/message", response_model=MessageResponse)
async def send_message(conversation_id: str, body: MessageRequest):
    """
    Send a user message and receive an AI response with citations.
    Calls the AI service RAG pipeline.
    TODO: Call AI service, save messages, return response with citations.
    """
    raise NotImplementedError("Send message not yet implemented")


@router.get("/conversations/{conversation_id}/stream")
async def stream_message(conversation_id: str, message: str = Query(...)):
    """
    Stream an AI response using Server-Sent Events (SSE).
    TODO: Implement SSE streaming from AI service.
    """
    async def event_generator():
        yield "data: placeholder\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
