import os
file_path = "backend/app/api/v1/chat.py"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    "from app.api.deps import get_current_user, get_db",
    "from app.api.deps import CurrentUser, CurrentWorkspace, get_db"
)
content = content.replace(
    "current_user: User = Depends(get_current_user),",
    "current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,"
)
content = content.replace(
    "user_id=current_user.id,",
    "user_id=current_user.id,\n            workspace_id=current_workspace.id,"
)
content = content.replace(
    "convs = await repo.get_user_conversations(user_id=current_user.id, limit=limit)",
    "convs = await repo.get_user_conversations(user_id=current_user.id, workspace_id=current_workspace.id, limit=limit)"
)
content = content.replace(
    "conv = await repo.get_conversation(conversation_id, user_id=current_user.id)",
    "conv = await repo.get_conversation(conversation_id, user_id=current_user.id, workspace_id=current_workspace.id)"
)
content = content.replace(
    "success = await repo.delete_conversation(conversation_id, user_id=current_user.id)",
    "success = await repo.delete_conversation(conversation_id, user_id=current_user.id, workspace_id=current_workspace.id, deleted_by=current_user.id)"
)

with open(file_path, "w") as f:
    f.write(content)
