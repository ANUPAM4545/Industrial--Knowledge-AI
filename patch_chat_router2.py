import os
file_path = "backend/app/api/v1/chat.py"
with open(file_path, "r") as f:
    content = f.read()

# For Chat
content = content.replace(
    "async def process_chat(\n    request: ChatRequest,\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    chat_service: ChatService = Depends(get_chat_service)\n):",
    "async def process_chat(\n    request: ChatRequest,\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    fastapi_req: __import__('fastapi').Request,\n    db: AsyncSession = Depends(get_db),\n    chat_service: ChatService = Depends(get_chat_service)\n):"
)
content = content.replace(
    "        result = await chat_service.process_chat(\n            user_id=current_user.id,\n            workspace_id=current_workspace.id,\n            query=request.query,\n            conversation_id=request.conversation_id\n        )\n        return result",
    "        result = await chat_service.process_chat(\n            user_id=current_user.id,\n            workspace_id=current_workspace.id,\n            query=request.query,\n            conversation_id=request.conversation_id\n        )\n\n        from app.services.audit_service import AuditService\n        audit = AuditService(db)\n        await audit.log_action(\n            action=\"CHAT_MESSAGE\",\n            status=\"SUCCESS\",\n            workspace_id=current_workspace.id,\n            user_id=current_user.id,\n            resource_type=\"CONVERSATION\",\n            resource_id=result.get(\"conversation_id\"),\n            request=fastapi_req\n        )\n        return result"
)

# For Chat Stream
content = content.replace(
    "async def process_chat_stream(\n    request: ChatRequest,\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    chat_service: ChatService = Depends(get_chat_service)\n):",
    "async def process_chat_stream(\n    request: ChatRequest,\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    fastapi_req: __import__('fastapi').Request,\n    db: AsyncSession = Depends(get_db),\n    chat_service: ChatService = Depends(get_chat_service)\n):"
)

content = content.replace(
    "    return StreamingResponse(\n        chat_service.process_chat_stream(\n            user_id=current_user.id,\n            workspace_id=current_workspace.id,\n            query=request.query,\n            conversation_id=request.conversation_id\n        ),\n        media_type=\"text/event-stream\"\n    )",
    "    from app.services.audit_service import AuditService\n    audit = AuditService(db)\n    # Fire and forget audit for stream start\n    import asyncio\n    asyncio.create_task(audit.log_action(\n        action=\"CHAT_MESSAGE_STREAM\",\n        status=\"SUCCESS\",\n        workspace_id=current_workspace.id,\n        user_id=current_user.id,\n        resource_type=\"CONVERSATION\",\n        resource_id=request.conversation_id,\n        request=fastapi_req\n    ))\n\n    return StreamingResponse(\n        chat_service.process_chat_stream(\n            user_id=current_user.id,\n            workspace_id=current_workspace.id,\n            query=request.query,\n            conversation_id=request.conversation_id\n        ),\n        media_type=\"text/event-stream\"\n    )"
)

with open(file_path, "w") as f:
    f.write(content)
