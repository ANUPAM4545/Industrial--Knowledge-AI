"""
Document Repository — data-access layer for the documents table.

Responsibilities:
- All SQL queries for the Document model
- Zero business logic — pure persistence operations
- Returns ORM instances; callers decide how to serialise
"""
from typing import Optional

import structlog
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document, DocumentStatus

logger = structlog.get_logger(__name__)


class DocumentRepository:
    """Async repository for the Document model."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ─── Read ──────────────────────────────────────────────────────────

    async def get_by_id(self, document_id: str, workspace_id: str) -> Optional[Document]:
        """Fetch a single document by primary key and workspace."""
        result = await self._session.execute(
            select(Document).where(
                Document.id == document_id,
                Document.workspace_id == workspace_id,
                Document.deleted_at.is_(None)
            )
        )
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self,
        workspace_id: str,
        *,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[DocumentStatus] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Document], int]:
        """
        Paginated list of documents for a given workspace.

        Returns (items, total_count).
        """
        base_query = select(Document).where(
            Document.workspace_id == workspace_id,
            Document.deleted_at.is_(None)
        )

        if status_filter is not None:
            base_query = base_query.where(Document.status == status_filter)

        if search:
            term = f"%{search.lower()}%"
            base_query = base_query.where(
                Document.title.ilike(term)
                | Document.original_filename.ilike(term)
            )

        # Total count (without pagination)
        count_result = await self._session.execute(
            select(func.count()).select_from(base_query.subquery())
        )
        total = count_result.scalar_one()

        # Paginated results, newest first
        offset = (page - 1) * page_size
        items_result = await self._session.execute(
            base_query.order_by(Document.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items = list(items_result.scalars().all())

        return items, total

    # ─── Write ─────────────────────────────────────────────────────────

    async def create(
        self,
        *,
        title: str,
        original_filename: str,
        stored_filename: str,
        file_path: str,
        file_size: int,
        mime_type: str,
        owner_id: str,
        workspace_id: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[str] = None,
        department: Optional[str] = None,
    ) -> Document:
        """Insert a new Document record and return the persisted instance."""
        from app.models.document import DocumentStatus, DocumentType

        # Derive document_type from MIME
        type_map = {
            "application/pdf": DocumentType.PDF,
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": DocumentType.DOCX,
            "application/msword": DocumentType.DOCX,
        }
        doc_type = type_map.get(mime_type, DocumentType.OTHER)

        doc = Document(
            title=title,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,  # internal only — never sent to clients
            file_size=file_size,
            mime_type=mime_type,
            document_type=doc_type,
            status=DocumentStatus.UPLOADED,
            owner_id=owner_id,
            workspace_id=workspace_id,
            description=description,
            category=category,
            tags=tags,
            department=department,
            is_ocr_processed=False,
            language="en",
        )
        self._session.add(doc)
        await self._session.flush()
        await self._session.refresh(doc)

        logger.info(
            "Document record created",
            document_id=doc.id,
            owner_id=owner_id,
            workspace_id=workspace_id,
            size=file_size,
        )
        return doc

    async def update_status(
        self,
        document: Document,
        status: DocumentStatus,
        *,
        error: Optional[str] = None,
    ) -> Document:
        """Update the processing pipeline status of a document."""
        document.status = status
        if error is not None:
            document.processing_error = error
        self._session.add(document)
        await self._session.flush()
        await self._session.refresh(document)

        logger.info(
            "Document status updated",
            document_id=document.id,
            status=status.value,
        )
        return document

    async def delete(self, document: Document, deleted_by: str) -> None:
        """Soft remove a document record from the database."""
        from datetime import datetime, timezone
        document.deleted_at = datetime.now(timezone.utc)
        document.deleted_by = deleted_by
        
        self._session.add(document)
        await self._session.flush()
        logger.info("Document record soft deleted", document_id=document.id)
