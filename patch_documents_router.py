import os
file_path = "backend/app/api/v1/documents.py"
with open(file_path, "r") as f:
    content = f.read()

# For Upload
content = content.replace(
    "async def upload_document(\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    session: DBSession,\n    storage: Storage,\n    file: UploadFile = File(..., description=\"PDF or DOCX file, max 50 MB\"),\n    title: str = Form(..., min_length=1, max_length=500),\n    description: str = Form(None),\n    category: str = Form(None),\n    tags: str = Form(None),\n    department: str = Form(None),\n) -> DocumentResponse:\n    \"\"\"\n    Upload a PDF or DOCX document to the knowledge base.\n    \"\"\"",
    "async def upload_document(\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    session: DBSession,\n    storage: Storage,\n    request: __import__('fastapi').Request,\n    file: UploadFile = File(..., description=\"PDF or DOCX file, max 50 MB\"),\n    title: str = Form(..., min_length=1, max_length=500),\n    description: str = Form(None),\n    category: str = Form(None),\n    tags: str = Form(None),\n    department: str = Form(None),\n) -> DocumentResponse:\n    \"\"\"\n    Upload a PDF or DOCX document to the knowledge base.\n    \"\"\""
)
content = content.replace(
    "return DocumentResponse.model_validate(document)",
    "from app.services.audit_service import AuditService\n    audit = AuditService(session)\n    await audit.log_action(\n        action=\"DOCUMENT_UPLOAD\",\n        status=\"SUCCESS\",\n        workspace_id=current_workspace.id,\n        user_id=current_user.id,\n        resource_type=\"DOCUMENT\",\n        resource_id=document.id,\n        request=request\n    )\n    return DocumentResponse.model_validate(document)"
)

# For Delete
content = content.replace(
    "async def delete_document(\n    document_id: str,\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    session: DBSession,\n    storage: Storage,\n) -> None:",
    "async def delete_document(\n    document_id: str,\n    current_user: CurrentUser,\n    current_workspace: CurrentWorkspace,\n    session: DBSession,\n    storage: Storage,\n    request: __import__('fastapi').Request,\n) -> None:"
)
content = content.replace(
    "await service.delete_document(document_id, workspace_id=current_workspace.id, deleted_by=current_user.id)",
    "await service.delete_document(document_id, workspace_id=current_workspace.id, deleted_by=current_user.id)\n\n    from app.services.audit_service import AuditService\n    audit = AuditService(session)\n    await audit.log_action(\n        action=\"DOCUMENT_DELETE\",\n        status=\"SUCCESS\",\n        workspace_id=current_workspace.id,\n        user_id=current_user.id,\n        resource_type=\"DOCUMENT\",\n        resource_id=document_id,\n        request=request\n    )"
)

with open(file_path, "w") as f:
    f.write(content)
