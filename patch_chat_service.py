import os
file_path = "backend/app/chat/chat_service.py"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    "async def process_chat(\n        self, \n        user_id: str, \n        query: str, \n        conversation_id: Optional[str] = None\n    ) -> Dict[str, Any]:",
    "async def process_chat(\n        self, \n        user_id: str, \n        workspace_id: str,\n        query: str, \n        conversation_id: Optional[str] = None\n    ) -> Dict[str, Any]:"
)

content = content.replace(
    "async def process_chat_stream(\n        self, \n        user_id: str, \n        query: str, \n        conversation_id: Optional[str] = None\n    ) -> AsyncGenerator[str, None]:",
    "async def process_chat_stream(\n        self, \n        user_id: str, \n        workspace_id: str,\n        query: str, \n        conversation_id: Optional[str] = None\n    ) -> AsyncGenerator[str, None]:"
)

content = content.replace(
    "await self.document_repository.list_by_owner(owner_id=user_id, page_size=1)",
    "await self.document_repository.list_by_workspace(workspace_id=workspace_id, page_size=1)"
)
content = content.replace(
    "await self.document_repository.list_by_owner(owner_id=user_id, page_size=100)",
    "await self.document_repository.list_by_workspace(workspace_id=workspace_id, page_size=100)"
)

content = content.replace(
    "await self.repository.create_conversation(title=query[:50], user_id=user_id)",
    "await self.repository.create_conversation(title=query[:50], user_id=user_id, workspace_id=workspace_id)"
)
content = content.replace(
    "await self.repository.get_conversation(conversation_id, user_id)",
    "await self.repository.get_conversation(conversation_id, user_id, workspace_id)"
)
content = content.replace(
    "await self.repository.add_message(conversation_id, Role.USER.value, query)",
    "await self.repository.add_message(conversation_id, Role.USER.value, query, workspace_id)"
)
content = content.replace(
    "await self.repository.add_message(\n            conversation_id=conversation_id, \n            role=Role.ASSISTANT.value, \n            content=answer, \n            context_json={\"citations\": citations, \"traces\": traces}\n        )",
    "await self.repository.add_message(\n            conversation_id=conversation_id, \n            role=Role.ASSISTANT.value, \n            content=answer, \n            workspace_id=workspace_id,\n            context_json={\"citations\": citations, \"traces\": traces}\n        )"
)
content = content.replace(
    "initial_state: CopilotState = {\n            \"conversation_id\": conversation_id,\n            \"user_id\": user_id,",
    "initial_state: CopilotState = {\n            \"conversation_id\": conversation_id,\n            \"user_id\": user_id,\n            \"workspace_id\": workspace_id,"
)

with open(file_path, "w") as f:
    f.write(content)
