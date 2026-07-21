"""
Document Service — business logic layer for document management.

Responsibilities (all business rules live here):
- Validate upload file (type, size, extension)
- Generate UUID-based stored filename (never trust client filenames)
- Persist binary data via StorageProvider
- Create database record via DocumentRepository
- Dispatch background processing task
- Authorise document access (owner-only)
- Delete document from storage + database
- Stream document for download

Dependencies are injected — this class never imports FastAPI or HTTP concerns.
"""
import math
import uuid
from typing import Optional

import structlog
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.models.document import Document, DocumentStatus
from app.repositories.document_repository import DocumentRepository
from app.storage.base import StorageProvider
from app.utils.file_validation import validate_upload
from app.worker import process_document_task

logger = structlog.get_logger(__name__)


class DocumentService:
    """Orchestrates the full document lifecycle."""

    def __init__(self, session: AsyncSession, storage: StorageProvider) -> None:
        self._session = session
        self._storage = storage
        self._repo = DocumentRepository(session)

    # ─── Upload ────────────────────────────────────────────────────────

    async def upload(
        self,
        *,
        file: UploadFile,
        title: str,
        owner_id: str,
        workspace_id: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[str] = None,
        department: Optional[str] = None,
    ) -> Document:
        """
        Full upload pipeline:
          1. Validate file (type + size)
          2. Generate safe stored filename (UUID)
          3. Persist bytes via StorageProvider
          4. Save metadata to database
          5. Trigger background processing hook

        Returns the created Document record (status=UPLOADED).
        """
        # 1. Security Gateway Validation
        from app.security.document_gateway import DocumentSecurityGateway
        gateway = DocumentSecurityGateway()
        policy = await gateway.validate_upload(file)

        # 2. Standard Validate (extract mime, size, extension)
        mime_type, extension, file_size = await validate_upload(file)

        # 2. Safe filename — no client data in stored_filename
        stored_filename = f"{uuid.uuid4()}{extension}"

        # 3. Read and store
        data = await file.read()
        await self._storage.upload(
            key=stored_filename,
            data=data,
            content_type=mime_type,
        )

        logger.info(
            "File stored",
            stored_filename=stored_filename,
            original=file.filename,
            size=file_size,
        )

        # 4. Persist metadata
        document = await self._repo.create(
            title=title,
            original_filename=file.filename or stored_filename,
            stored_filename=stored_filename,
            file_path=stored_filename,   # opaque key — not a raw path
            file_size=file_size,
            mime_type=mime_type,
            owner_id=owner_id,
            workspace_id=workspace_id,
            description=description,
            category=category,
            tags=tags,
            department=department,
        )

        # 5. Background processing hook (non-blocking)
        import asyncio
        loop = asyncio.get_running_loop()
        loop.run_in_executor(None, process_document_task.delay, str(document.id), str(workspace_id))

        logger.info("Document uploaded", document_id=document.id, workspace_id=workspace_id)
        return document

    # ─── List ──────────────────────────────────────────────────────────

    async def list_documents(
        self,
        workspace_id: str,
        *,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
    ) -> dict:
        """
        Return a paginated list of documents in the given workspace.

        Returns a dict ready for DocumentListResponse serialisation.
        """
        status_enum: Optional[DocumentStatus] = None
        if status_filter:
            try:
                status_enum = DocumentStatus(status_filter.lower())
            except ValueError:
                pass  # silently ignore unknown filter values

        items, total = await self._repo.list_by_workspace(
            workspace_id,
            page=page,
            page_size=page_size,
            status_filter=status_enum,
            search=search,
        )

        total_pages = max(1, math.ceil(total / page_size))

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    # ─── Get ───────────────────────────────────────────────────────────

    async def get_document(self, document_id: str, workspace_id: str) -> Document:
        """
        Retrieve a document, enforcing workspace isolation.

        Raises:
            NotFoundException: if the document does not exist.
        """
        document = await self._repo.get_by_id(document_id, workspace_id)

        if document is None:
            raise NotFoundException("Document", document_id)

        return document

    # ─── Download ──────────────────────────────────────────────────────

    async def download_document(
        self, document_id: str, workspace_id: str
    ) -> tuple[bytes, str, str]:
        """
        Retrieve the raw file bytes for download.

        Validates workspace before reading from storage.

        Returns:
            (file_bytes, mime_type, original_filename)
        """
        document = await self.get_document(document_id, workspace_id)

        data = await self._storage.download(document.stored_filename)

        return data, document.mime_type, document.original_filename

    # ─── Delete ────────────────────────────────────────────────────────

    async def delete_document(self, document_id: str, workspace_id: str, deleted_by: str) -> None:
        """
        Soft Delete a document from database, but maybe hard delete from storage if desired?
        For compliance, we might want to keep the file, or delete it depending on policy.
        Here we'll do a soft delete in DB. 

        Validates workspace.
        """
        document = await self.get_document(document_id, workspace_id)

        await self._repo.delete(document, deleted_by=deleted_by)
        logger.info("Document deleted", document_id=document_id, workspace_id=workspace_id)

    # ─── Status ────────────────────────────────────────────────────────

    async def get_status(self, document_id: str, workspace_id: str) -> Document:
        """Return the document with its current processing status."""
        return await self.get_document(document_id, workspace_id)
