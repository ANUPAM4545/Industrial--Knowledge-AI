"""
ForgeMind AI — Document Endpoints
GET    /documents/       — List documents (paginated)
POST   /documents/upload — Upload a document
GET    /documents/{id}   — Get document details
DELETE /documents/{id}   — Delete a document
GET    /documents/{id}/status — Get processing status
"""
from fastapi import APIRouter, File, Form, Query, UploadFile, status

from app.schemas.document import DocumentResponse, DocumentListResponse

router = APIRouter()


@router.get("/", response_model=DocumentListResponse, status_code=status.HTTP_200_OK)
async def list_documents(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: str = Query(None),
    document_type: str = Query(None),
    search: str = Query(None),
):
    """
    List all documents accessible to the current user.
    Supports pagination, filtering by status/type, and text search.
    TODO: Implement document repository query with filters.
    """
    raise NotImplementedError("List documents not yet implemented")


@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(None),
    document_type: str = Form(None),
    tags: str = Form(None),
    category: str = Form(None),
):
    """
    Upload a new industrial document for processing.
    Accepts PDF, DOCX, TXT, and image files.
    TODO: Validate file, save to disk, create DB record, dispatch Celery task.
    """
    raise NotImplementedError("Document upload not yet implemented")


@router.get("/{document_id}", response_model=DocumentResponse, status_code=status.HTTP_200_OK)
async def get_document(document_id: str):
    """
    Get details and metadata for a specific document.
    TODO: Implement document repository lookup.
    """
    raise NotImplementedError("Get document not yet implemented")


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: str):
    """
    Delete a document and its associated vectors from Qdrant.
    TODO: Remove from DB, delete file from disk, clean Qdrant vectors.
    """
    return None


@router.get("/{document_id}/status", status_code=status.HTTP_200_OK)
async def get_document_status(document_id: str):
    """
    Get the processing pipeline status for a specific document.
    TODO: Return current processing stage and progress.
    """
    raise NotImplementedError("Document status not yet implemented")
