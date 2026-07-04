"""
Document Processing Worker — background task placeholder.

This module defines the entry-point that will be invoked after a document
is uploaded. The actual OCR, text extraction, chunking, and embedding
pipeline will be implemented in a future milestone.

For now it:
1. Updates the document status to PROCESSING (hook for future work)
2. Logs the event so it is visible in structured logs

The function signature and database interaction pattern are final —
only the body will be expanded in Milestone 3.
"""
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import DocumentStatus
from app.repositories.document_repository import DocumentRepository

logger = structlog.get_logger(__name__)


async def process_document(document_id: str, session: AsyncSession) -> None:
    """
    Entry-point for the document processing pipeline.

    Called immediately after a successful upload. Future milestones will
    expand this to:
      - OCR (Tesseract / pdf2image)
      - Text extraction (pypdf2 / python-docx)
      - Chunking (LangChain TextSplitter)
      - Embedding (BAAI/bge via AI service)
      - Qdrant vector ingestion

    Args:
        document_id: UUID of the newly uploaded Document record.
        session:     Async DB session for status updates.
    """
    repo = DocumentRepository(session)
    document = await repo.get_by_id(document_id)

    if document is None:
        logger.error("process_document: document not found", document_id=document_id)
        return

    # Transition to PROCESSING so the UI shows activity immediately
    await repo.update_status(document, DocumentStatus.PROCESSING)

    logger.info(
        "Document queued for processing",
        document_id=document_id,
        title=document.title,
        # TODO Milestone 3: dispatch to Celery worker here
    )

    # ── Milestone 3 hook ──────────────────────────────────────────────
    # from app.workers.celery_app import celery
    # celery.send_task("tasks.ingest_document", args=[document_id])
    # ─────────────────────────────────────────────────────────────────
