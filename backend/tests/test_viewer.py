import os
os.environ["UPLOAD_DIR"] = "/tmp/mock_uploads"

import structlog
from unittest.mock import MagicMock
structlog.get_logger = lambda *args, **kwargs: MagicMock()

import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone
import io
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
settings.UPLOAD_DIR = "/tmp/mock_uploads"

from app.db.base import Base
from app.main import app
from app.models.document import Document, DocumentStatus
from app.models.chunk import Chunk
from app.document_viewer.viewer_service import DocumentViewerService
from app.document_viewer.highlight_service import HighlightService
from app.document_viewer.models import (
    DocumentViewerInfo,
    DocumentPageData,
    DocumentHighlight,
    DocumentSearchMatch
)
from app.storage.base import StorageProvider

client = TestClient(app)


class MockPdfPage:
    def extract_text(self):
        return "Safety standard procedures. Check valve trigger indicator."


class MockPdfReader:
    def __init__(self, stream):
        self.pages = [MockPdfPage(), MockPdfPage()]


class MockParagraph:
    def __init__(self, text):
        self.text = text


class MockDocxDocument:
    def __init__(self, stream):
        self.paragraphs = [
            MockParagraph("Safety standard valve procedures."),
            MockParagraph("Troubleshoot safety sensors trigger checklist."),
            MockParagraph("Ensure backup power limits.")
        ]


@pytest.fixture
def mock_document():
    return Document(
        id="doc_viewer_1",
        title="Industrial Safety SOP",
        original_filename="Safety_Manual.pdf",
        stored_filename="stored_safety.pdf",
        file_size=2048,
        status=DocumentStatus.READY,
        mime_type="application/pdf",
        owner_id="owner_123",
        created_at=datetime.now(timezone.utc)
    )


@pytest.fixture
def mock_docx_document():
    return Document(
        id="doc_viewer_2",
        title="Valve Specs DOCX",
        original_filename="Specs.docx",
        stored_filename="stored_specs.docx",
        file_size=4096,
        status=DocumentStatus.READY,
        mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        owner_id="owner_123",
        created_at=datetime.now(timezone.utc)
    )



@pytest.mark.asyncio
async def test_viewer_info_pdf(mock_document):
    session = AsyncMock(spec=AsyncSession)
    repo_mock = AsyncMock()
    repo_mock.get_by_id.return_value = mock_document
    
    storage = AsyncMock(spec=StorageProvider)
    storage.download.return_value = b"%PDF-1.4 mock bytes"

    service = DocumentViewerService(session, storage)
    service.repo = repo_mock

    with patch("pypdf.PdfReader", side_effect=MockPdfReader):
        info = await service.get_viewer_info("doc_viewer_1")
        assert info.document_id == "doc_viewer_1"
        assert info.total_pages == 2
        assert info.mime_type == "application/pdf"


@pytest.mark.asyncio
async def test_viewer_info_docx(mock_docx_document):
    session = AsyncMock(spec=AsyncSession)
    repo_mock = AsyncMock()
    repo_mock.get_by_id.return_value = mock_docx_document
    
    storage = AsyncMock(spec=StorageProvider)
    storage.download.return_value = b"docx mock bytes"

    service = DocumentViewerService(session, storage)
    service.repo = repo_mock

    with patch("docx.Document", side_effect=MockDocxDocument):
        info = await service.get_viewer_info("doc_viewer_2")
        assert info.document_id == "doc_viewer_2"
        assert info.total_pages == 1


@pytest.mark.asyncio
async def test_get_page_content_pdf(mock_document):
    session = AsyncMock(spec=AsyncSession)
    repo_mock = AsyncMock()
    repo_mock.get_by_id.return_value = mock_document

    storage = AsyncMock(spec=StorageProvider)
    storage.download.return_value = b"%PDF-1.4 mock bytes"

    service = DocumentViewerService(session, storage)
    service.repo = repo_mock

    with patch("pypdf.PdfReader", side_effect=MockPdfReader):
        data = await service.get_page_content("doc_viewer_1", 1)
        assert data.page_number == 1
        assert "Safety standard procedures" in data.text_content


@pytest.mark.asyncio
async def test_search_document(mock_document):
    session = AsyncMock(spec=AsyncSession)
    repo_mock = AsyncMock()
    repo_mock.get_by_id.return_value = mock_document

    storage = AsyncMock(spec=StorageProvider)
    storage.download.return_value = b"%PDF-1.4 mock bytes"

    service = DocumentViewerService(session, storage)
    service.repo = repo_mock

    with patch("pypdf.PdfReader", side_effect=MockPdfReader):
        matches = await service.search_document("doc_viewer_1", "valve")
        assert len(matches) > 0
        assert matches[0].page_number == 1
        assert "valve" in matches[0].snippet.lower()


@pytest.mark.asyncio
async def test_highlight_service_match():
    session = AsyncMock(spec=AsyncSession)
    
    mock_chunk = Chunk(
        id="chunk_99",
        document_id="doc_viewer_1",
        page_number=1,
        text="valve trigger indicator",
        chunk_index=0
    )
    
    mock_execute = MagicMock()
    mock_execute.scalars.return_value.all.return_value = [mock_chunk]
    session.execute.return_value = mock_execute

    highlights = await HighlightService.get_highlights_for_page(
        session, "doc_viewer_1", 1, "Safety standard procedures. Check valve trigger indicator."
    )
    assert len(highlights) == 1
    assert highlights[0].chunk_id == "chunk_99"
    assert highlights[0].start_offset > 0


@pytest.mark.asyncio
async def test_highlight_service_resolve_citation():
    session = AsyncMock(spec=AsyncSession)
    
    mock_chunk = Chunk(
        id="chunk_99",
        document_id="doc_viewer_1",
        page_number=1,
        text="valve trigger indicator",
        chunk_index=0
    )
    
    mock_execute = MagicMock()
    mock_execute.scalars.return_value.first.return_value = mock_chunk
    session.execute.return_value = mock_execute

    res = await HighlightService.resolve_citation(session, "doc_viewer_1", "chunk_99")
    assert res["page_number"] == 1
    assert res["chunk_id"] == "chunk_99"


@pytest.mark.asyncio
async def test_viewer_endpoints_mock(monkeypatch):
    async def mock_info(*args, **kwargs):
        return DocumentViewerInfo(
            document_id="doc_viewer_1",
            title="SOP",
            mime_type="application/pdf",
            total_pages=2,
            status="ready",
            file_size=2048
        )
    monkeypatch.setattr(DocumentViewerService, "get_viewer_info", mock_info)

    async def mock_page(*args, **kwargs):
        return DocumentPageData(
            page_number=1,
            text_content="Page contents",
            highlights=[]
        )
    monkeypatch.setattr(DocumentViewerService, "get_page_content", mock_page)

    async def mock_highlights(*args, **kwargs):
        return [
            DocumentHighlight(
                text="Page segment",
                start_offset=0,
                end_offset=10,
                chunk_id="chunk_1",
                similarity=0.9,
                confidence=95.0,
                retrieval_method="hybrid"
            )
        ]
    monkeypatch.setattr(HighlightService, "get_highlights_for_page", mock_highlights)

    async def mock_search(*args, **kwargs):
        return [
            DocumentSearchMatch(
                page_number=1,
                snippet="test snippet",
                text_match="test"
            )
        ]
    monkeypatch.setattr(DocumentViewerService, "search_document", mock_search)

    # Route checks
    resp = client.get("/api/v1/documents/doc_viewer_1/viewer")
    assert resp.status_code == 200

    resp = client.get("/api/v1/documents/doc_viewer_1/page/1")
    assert resp.status_code == 200

    resp = client.get("/api/v1/documents/doc_viewer_1/citation/chunk_1")
    assert resp.status_code == 200

    resp = client.get("/api/v1/documents/doc_viewer_1/search?q=test")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_viewer_failures():
    with patch("app.document_viewer.viewer_service.DocumentViewerService.get_viewer_info", side_effect=Exception("Database failure")):
        resp = client.get("/api/v1/documents/doc_viewer_1/viewer")
        assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_page_content_docx(mock_docx_document):
    session = AsyncMock(spec=AsyncSession)
    repo_mock = AsyncMock()
    repo_mock.get_by_id.return_value = mock_docx_document

    storage = AsyncMock(spec=StorageProvider)
    storage.download.return_value = b"mock docx content"

    service = DocumentViewerService(session, storage)
    service.repo = repo_mock

    with patch("docx.Document", side_effect=MockDocxDocument):
        data = await service.get_page_content("doc_viewer_2", 1)
        assert data.page_number == 1
        assert "Safety standard valve" in data.text_content


@pytest.mark.asyncio
async def test_get_page_content_text_fallback():
    session = AsyncMock(spec=AsyncSession)
    repo_mock = AsyncMock()
    doc = Document(
        id="doc_viewer_3",
        title="Notes",
        original_filename="notes.txt",
        stored_filename="notes.txt",
        file_size=100,
        status=DocumentStatus.READY,
        mime_type="text/plain",
        owner_id="owner_123"
    )
    repo_mock.get_by_id.return_value = doc

    storage = AsyncMock(spec=StorageProvider)
    storage.download.return_value = b"Plain text file data checks"

    service = DocumentViewerService(session, storage)
    service.repo = repo_mock

    data = await service.get_page_content("doc_viewer_3", 1)
    assert "Plain text file data checks" in data.text_content


@pytest.mark.asyncio
async def test_highlight_service_db_failures():
    session = AsyncMock(spec=AsyncSession)
    session.execute.side_effect = Exception("DB execute error")

    highlights = await HighlightService.get_highlights_for_page(
        session, "doc_viewer_1", 1, "Some page text"
    )
    assert len(highlights) == 0

    res = await HighlightService.resolve_citation(session, "doc_viewer_1", "chunk_id")
    assert res["page_number"] == 1
    assert "placeholder" in res["text"]

