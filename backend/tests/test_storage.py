"""
Tests — LocalStorageProvider

Tests the local filesystem storage implementation including
path traversal protection, upload, download, delete, and exists.
"""
import pytest
from pathlib import Path

from app.storage.local_storage import LocalStorageProvider


@pytest.fixture
def tmp_storage(tmp_path: Path) -> LocalStorageProvider:
    """Create a LocalStorageProvider backed by pytest's tmp_path."""
    return LocalStorageProvider(root=tmp_path)


class TestLocalStorageProvider:
    @pytest.mark.asyncio
    async def test_upload_creates_file(self, tmp_storage: LocalStorageProvider, tmp_path: Path):
        await tmp_storage.upload("test.pdf", b"hello pdf", "application/pdf")
        assert (tmp_path / "test.pdf").exists()

    @pytest.mark.asyncio
    async def test_upload_returns_key(self, tmp_storage: LocalStorageProvider):
        key = await tmp_storage.upload("doc.pdf", b"data", "application/pdf")
        assert key == "doc.pdf"

    @pytest.mark.asyncio
    async def test_download_returns_bytes(self, tmp_storage: LocalStorageProvider):
        await tmp_storage.upload("doc.pdf", b"pdf content", "application/pdf")
        data = await tmp_storage.download("doc.pdf")
        assert data == b"pdf content"

    @pytest.mark.asyncio
    async def test_download_missing_raises(self, tmp_storage: LocalStorageProvider):
        with pytest.raises(FileNotFoundError):
            await tmp_storage.download("nonexistent.pdf")

    @pytest.mark.asyncio
    async def test_delete_removes_file(self, tmp_storage: LocalStorageProvider, tmp_path: Path):
        await tmp_storage.upload("del.pdf", b"bye", "application/pdf")
        await tmp_storage.delete("del.pdf")
        assert not (tmp_path / "del.pdf").exists()

    @pytest.mark.asyncio
    async def test_delete_idempotent(self, tmp_storage: LocalStorageProvider):
        """Deleting a non-existent file must not raise."""
        await tmp_storage.delete("ghost.pdf")  # no error

    @pytest.mark.asyncio
    async def test_exists_true(self, tmp_storage: LocalStorageProvider):
        await tmp_storage.upload("exists.pdf", b"x", "application/pdf")
        assert await tmp_storage.exists("exists.pdf") is True

    @pytest.mark.asyncio
    async def test_exists_false(self, tmp_storage: LocalStorageProvider):
        assert await tmp_storage.exists("missing.pdf") is False

    @pytest.mark.asyncio
    async def test_path_traversal_blocked(self, tmp_storage: LocalStorageProvider):
        """Keys containing ../ must not escape the storage root."""
        with pytest.raises(PermissionError):
            await tmp_storage.upload("../../etc/passwd", b"evil", "text/plain")
