"""
Tests — DocumentRepository

Unit tests for the DocumentRepository using an in-memory SQLite
database (no Docker/Postgres needed to run the test suite).
"""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.document import Document, DocumentStatus
from app.models.user import User, UserRole, UserStatus
from app.models.workspace import Workspace
from app.repositories.document_repository import DocumentRepository

# ── Fixtures ───────────────────────────────────────────────────────────────────

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def async_session():
    """Provide a fresh in-memory SQLite session for each test."""
    engine = create_async_engine(TEST_DB_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_factory = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session_factory() as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture
async def owner(async_session: AsyncSession) -> User:
    """Insert a test user and return the instance."""
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password="hashed",
        role=UserRole.OPERATOR,
        status=UserStatus.ACTIVE,
        is_verified=True,
    )
    async_session.add(user)
    await async_session.flush()
    await async_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def workspace(async_session: AsyncSession, owner: User) -> Workspace:
    """Insert a test workspace."""
    ws = Workspace(
        name="Test Workspace"
    )
    async_session.add(ws)
    await async_session.flush()
    await async_session.refresh(ws)
    return ws


@pytest_asyncio.fixture
async def repo(async_session: AsyncSession) -> DocumentRepository:
    return DocumentRepository(async_session)


# ── Tests ──────────────────────────────────────────────────────────────────────

class TestDocumentRepository:
    @pytest.mark.asyncio
    async def test_create_document(self, repo: DocumentRepository, owner: User, workspace: Workspace):
        doc = await repo.create(
            title="Safety Manual",
            original_filename="safety.pdf",
            stored_filename="abc123.pdf",
            file_path="abc123.pdf",
            file_size=1024,
            mime_type="application/pdf",
            owner_id=owner.id,
            workspace_id=workspace.id,
        )
        assert doc.id is not None
        assert doc.title == "Safety Manual"
        assert doc.status == DocumentStatus.UPLOADED
        assert doc.owner_id == owner.id
        assert doc.workspace_id == workspace.id

    @pytest.mark.asyncio
    async def test_get_by_id(self, repo: DocumentRepository, owner: User, workspace: Workspace):
        doc = await repo.create(
            title="Manual",
            original_filename="m.pdf",
            stored_filename="x.pdf",
            file_path="x.pdf",
            file_size=512,
            mime_type="application/pdf",
            owner_id=owner.id,
            workspace_id=workspace.id,
        )
        fetched = await repo.get_by_id(doc.id, workspace.id)
        assert fetched is not None
        assert fetched.id == doc.id

    @pytest.mark.asyncio
    async def test_get_by_id_missing_returns_none(self, repo: DocumentRepository, workspace: Workspace):
        result = await repo.get_by_id("nonexistent-uuid", workspace.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_id_wrong_workspace(
        self, repo: DocumentRepository, owner: User, workspace: Workspace
    ):
        doc = await repo.create(
            title="Doc",
            original_filename="d.pdf",
            stored_filename="d.pdf",
            file_path="d.pdf",
            file_size=100,
            mime_type="application/pdf",
            owner_id=owner.id,
            workspace_id=workspace.id,
        )
        result = await repo.get_by_id(doc.id, "other-workspace-id")
        assert result is None

    @pytest.mark.asyncio
    async def test_list_by_workspace_pagination(self, repo: DocumentRepository, owner: User, workspace: Workspace):
        for i in range(5):
            await repo.create(
                title=f"Doc {i}",
                original_filename=f"doc{i}.pdf",
                stored_filename=f"doc{i}.pdf",
                file_path=f"doc{i}.pdf",
                file_size=100,
                mime_type="application/pdf",
                owner_id=owner.id,
                workspace_id=workspace.id,
            )
        items, total = await repo.list_by_workspace(workspace.id, page=1, page_size=3)
        assert total == 5
        assert len(items) == 3

    @pytest.mark.asyncio
    async def test_update_status(self, repo: DocumentRepository, owner: User, workspace: Workspace):
        doc = await repo.create(
            title="Doc",
            original_filename="d.pdf",
            stored_filename="d.pdf",
            file_path="d.pdf",
            file_size=100,
            mime_type="application/pdf",
            owner_id=owner.id,
            workspace_id=workspace.id,
        )
        updated = await repo.update_status(doc, DocumentStatus.PROCESSING)
        assert updated.status == DocumentStatus.PROCESSING

    @pytest.mark.asyncio
    async def test_delete_document(self, repo: DocumentRepository, owner: User, workspace: Workspace):
        doc = await repo.create(
            title="To Delete",
            original_filename="del.pdf",
            stored_filename="del.pdf",
            file_path="del.pdf",
            file_size=100,
            mime_type="application/pdf",
            owner_id=owner.id,
            workspace_id=workspace.id,
        )
        doc_id = doc.id
        await repo.delete(doc, deleted_by=owner.id)
        result = await repo.get_by_id(doc_id, workspace.id)
        assert result is None
