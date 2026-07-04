"""
Document Management Endpoints

POST   /documents/upload         — Upload a new document
GET    /documents/               — List documents (paginated + filtered)
GET    /documents/{id}           — Get document details
DELETE /documents/{id}           — Delete a document
GET    /documents/{id}/status    — Get processing pipeline status
GET    /documents/{id}/download  — Download the original file

All routes are JWT-protected via CurrentUser.
Business logic lives in DocumentService — routers only handle HTTP.
"""
from fastapi import APIRouter, File, Form, Query, Response, UploadFile, status
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser, DBSession, Storage
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    DocumentStatusResponse,
)
from app.services.document_service import DocumentService

router = APIRouter()


# ─── Upload ───────────────────────────────────────────────────────────────────

@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a new industrial document",
)
async def upload_document(
    current_user: CurrentUser,
    session: DBSession,
    storage: Storage,
    file: UploadFile = File(..., description="PDF or DOCX file, max 50 MB"),
    title: str = Form(..., min_length=1, max_length=500),
    description: str = Form(None),
    category: str = Form(None),
    tags: str = Form(None),
    department: str = Form(None),
) -> DocumentResponse:
    """
    Upload a PDF or DOCX document to the knowledge base.

    - Validates file type (PDF / DOCX only) and size (≤ 50 MB).
    - Stores the file under a UUID-based key (never exposes paths).
    - Creates a database record with status **uploaded**.
    - Triggers the background processing hook (status → processing).

    Returns the created document metadata immediately (202 Accepted).
    """
    service = DocumentService(session, storage)
    document = await service.upload(
        file=file,
        title=title,
        owner_id=current_user.id,
        description=description,
        category=category,
        tags=tags,
        department=department,
    )
    return DocumentResponse.model_validate(document)


# ─── List ─────────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=DocumentListResponse,
    status_code=status.HTTP_200_OK,
    summary="List documents for the current user",
)
async def list_documents(
    current_user: CurrentUser,
    session: DBSession,
    storage: Storage,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: str = Query(None, description="Filter by status"),
    search: str = Query(None, description="Search by title or filename"),
) -> DocumentListResponse:
    """
    Return a paginated list of documents owned by the current user.

    - Supports filtering by `status` (uploaded, processing, ready, failed).
    - Supports keyword search over title and original filename.
    - Results are ordered by `created_at` descending.
    """
    service = DocumentService(session, storage)
    result = await service.list_documents(
        owner_id=current_user.id,
        page=page,
        page_size=page_size,
        status_filter=status_filter,
        search=search,
    )
    return DocumentListResponse(
        items=[DocumentResponse.model_validate(d) for d in result["items"]],
        total=result["total"],
        page=result["page"],
        page_size=result["page_size"],
        total_pages=result["total_pages"],
    )


# ─── Get ──────────────────────────────────────────────────────────────────────

@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    status_code=status.HTTP_200_OK,
    summary="Get document details",
)
async def get_document(
    document_id: str,
    current_user: CurrentUser,
    session: DBSession,
    storage: Storage,
) -> DocumentResponse:
    """
    Return full metadata for a specific document.

    Raises **403 Forbidden** if the document belongs to a different user.
    Raises **404 Not Found** if the document does not exist.
    """
    service = DocumentService(session, storage)
    document = await service.get_document(document_id, owner_id=current_user.id)
    return DocumentResponse.model_validate(document)


# ─── Status ───────────────────────────────────────────────────────────────────

@router.get(
    "/{document_id}/status",
    response_model=DocumentStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get document processing status",
)
async def get_document_status(
    document_id: str,
    current_user: CurrentUser,
    session: DBSession,
    storage: Storage,
) -> DocumentStatusResponse:
    """
    Return the current processing pipeline status for a document.

    Poll this endpoint after upload to track: uploaded → processing → ready.
    """
    service = DocumentService(session, storage)
    document = await service.get_status(document_id, owner_id=current_user.id)
    return DocumentStatusResponse.model_validate(document)


# ─── Download ─────────────────────────────────────────────────────────────────

@router.get(
    "/{document_id}/download",
    status_code=status.HTTP_200_OK,
    summary="Download the original document file",
)
async def download_document(
    document_id: str,
    current_user: CurrentUser,
    session: DBSession,
    storage: Storage,
) -> Response:
    """
    Stream the original document file to the client.

    Returns the file with the correct Content-Type and a
    Content-Disposition header so browsers trigger a download.
    """
    service = DocumentService(session, storage)
    data, mime_type, original_filename = await service.download_document(
        document_id, owner_id=current_user.id
    )

    safe_filename = original_filename.replace('"', "")
    return Response(
        content=data,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Content-Length": str(len(data)),
        },
    )


# ─── Delete ───────────────────────────────────────────────────────────────────

@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a document",
)
async def delete_document(
    document_id: str,
    current_user: CurrentUser,
    session: DBSession,
    storage: Storage,
) -> None:
    """
    Permanently delete a document from storage and the database.

    Raises **403 Forbidden** if the requester is not the document owner.
    """
    service = DocumentService(session, storage)
    await service.delete_document(document_id, owner_id=current_user.id)
