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


async def process_document(document_id: str, workspace_id: str, session: AsyncSession) -> None:
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
        workspace_id: UUID of the workspace.
        session:     Async DB session for status updates.
    """
    repo = DocumentRepository(session)
    document = await repo.get_by_id(document_id, workspace_id)

    if document is None:
        logger.error("process_document: document not found", document_id=document_id, workspace_id=workspace_id)
        return

    # Transition to PROCESSING so the UI shows activity immediately
    await repo.update_status(document, DocumentStatus.PROCESSING)

    logger.info(
        "Document queued for processing",
        document_id=document_id,
        title=document.title,
    )

    try:
        from app.storage.local_storage import LocalStorageProvider
        from app.chunking.models import ParsedDocument, ParsedPage
        from app.services.chunk_service import ChunkService
        from app.services.embedding_service import EmbeddingService
        import pypdf
        import io

        # 1. Download file bytes
        storage = LocalStorageProvider()
        data = await storage.download(document.stored_filename)

        # 2. Extract Text using pypdf
        pdf_reader = pypdf.PdfReader(io.BytesIO(data))
        pages = []
        full_text = ""
        for i, page in enumerate(pdf_reader.pages):
            text = page.extract_text() or ""
            pages.append(ParsedPage(page_number=i + 1, text=text))
            full_text += text + "\n"

        parsed_doc = ParsedDocument(
            document_id=document_id,
            title=document.title,
            full_text=full_text,
            pages=pages,
            sections=[],
            metadata={"source": "dummy_pipeline"}
        )

        # 3. Chunk Document
        await ChunkService.process_document(session, parsed_doc)

        # 4. Embed and Index Document
        await EmbeddingService.index_document(session, document_id)
        
        logger.info(
            "Document processing complete",
            document_id=document_id,
            title=document.title,
        )
    except Exception as e:
        logger.error("Error processing document", document_id=document_id, error=str(e))
        await repo.update_status(document, DocumentStatus.FAILED)

