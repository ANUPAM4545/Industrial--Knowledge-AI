"""
NEXO — Chat API Router
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, CurrentWorkspace, get_db
from app.chat.chat_repository import ChatRepository
from app.chat.chat_service import ChatService
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.services.similarity_service import SimilaritySearchService
from app.security.security_service import SecurityService
from app.security.rate_limit.decorators import rate_limit
from app.security.rate_limit.models import LimitType


router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    citations: List[Dict[str, Any]]
    traces: List[Dict[str, Any]] = []


def get_chat_service(db: AsyncSession = Depends(get_db)) -> ChatService:
    repo = ChatRepository(db)
    doc_repo = DocumentRepository(db)
    sim_service = SimilaritySearchService()
    sec_service = SecurityService(db)
    return ChatService(repository=repo, document_repository=doc_repo, similarity_service=sim_service, security_service=sec_service)


@router.post("", response_model=ChatResponse, dependencies=[Depends(rate_limit(LimitType.CHAT))])
async def process_chat(
    request: ChatRequest,
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    fastapi_req: __import__('fastapi').Request,
    db: AsyncSession = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Send a message to the AI and get a full RAG response.
    """
    try:
        result = await chat_service.process_chat(
            user_id=current_user.id,
            workspace_id=current_workspace.id,
            query=request.query,
            conversation_id=request.conversation_id
        )

        from app.services.audit_service import AuditService
        audit = AuditService(db)
        await audit.log_action(
            action="CHAT_MESSAGE",
            status="SUCCESS",
            workspace_id=current_workspace.id,
            user_id=current_user.id,
            resource_type="CONVERSATION",
            resource_id=result.get("conversation_id"),
            request=fastapi_req
        )
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream", dependencies=[Depends(rate_limit(LimitType.CHAT))])
async def process_chat_stream(
    request: ChatRequest,
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    fastapi_req: __import__('fastapi').Request,
    db: AsyncSession = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Send a message and get an SSE streaming RAG response.
    """
    from app.services.audit_service import AuditService
    audit = AuditService(db)
    # Fire and forget audit for stream start
    import asyncio
    asyncio.create_task(audit.log_action(
        action="CHAT_MESSAGE_STREAM",
        status="SUCCESS",
        workspace_id=current_workspace.id,
        user_id=current_user.id,
        resource_type="CONVERSATION",
        resource_id=request.conversation_id,
        request=fastapi_req
    ))

    return StreamingResponse(
        chat_service.process_chat_stream(
            user_id=current_user.id,
            workspace_id=current_workspace.id,
            query=request.query,
            conversation_id=request.conversation_id
        ),
        media_type="text/event-stream"
    )


@router.get("/history")
async def get_conversations(
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Get the current user's conversation history.
    """
    repo = ChatRepository(db)
    convs = await repo.get_user_conversations(user_id=current_user.id,
            workspace_id=current_workspace.id, limit=limit)
    return [
        {
            "id": c.id,
            "title": c.title,
            "updated_at": c.updated_at
        }
        for c in convs
    ]


@router.get("/{conversation_id}")
async def get_conversation_details(
    conversation_id: str,
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all messages for a specific conversation.
    """
    repo = ChatRepository(db)
    conv = await repo.get_conversation(conversation_id, user_id=current_user.id, workspace_id=current_workspace.id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = [
        {
            "id": m.id,
            "role": m.role.value,
            "content": m.content,
            "context_json": m.context_json,
            "created_at": m.created_at
        }
        for m in conv.messages
    ]
    return {
        "id": conv.id,
        "title": conv.title,
        "messages": messages
    }


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: CurrentUser,
    current_workspace: CurrentWorkspace,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a conversation.
    """
    repo = ChatRepository(db)
    success = await repo.delete_conversation(conversation_id, user_id=current_user.id, workspace_id=current_workspace.id, deleted_by=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found or not owned by user")
    return {"message": "Conversation deleted"}
