"""
Local Filesystem Storage Provider

Stores uploaded files under /storage/documents/ inside the container.
File system paths are never exposed to callers — only opaque string keys
are exchanged across the service boundary.
"""
import asyncio
from pathlib import Path

import structlog

from app.storage.base import StorageProvider

logger = structlog.get_logger(__name__)

# Root directory for all stored documents (mounted volume in Docker)
STORAGE_ROOT = Path("/storage/documents")


class LocalStorageProvider(StorageProvider):
    """
    StorageProvider backed by the local filesystem.

    Directory layout:
        /storage/documents/<key>   e.g. /storage/documents/a1b2c3d4-....pdf

    The key is always a UUID-based filename — callers never reference
    absolute paths.
    """

    def __init__(self, root: Path = STORAGE_ROOT) -> None:
        self._root = root
        self._root.mkdir(parents=True, exist_ok=True)
        logger.info("LocalStorageProvider ready", root=str(self._root))

    # ─── Internal ──────────────────────────────────────────────────────

    def _resolve(self, key: str) -> Path:
        """
        Map a storage key to an absolute local path.

        Path traversal is blocked by normalising and asserting the result
        stays inside the storage root.
        """
        resolved = (self._root / key).resolve()
        if not str(resolved).startswith(str(self._root.resolve())):
            raise PermissionError(f"Attempt to escape storage root with key: {key!r}")
        return resolved

    # ─── StorageProvider interface ─────────────────────────────────────

    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        """Write bytes to disk asynchronously (via thread pool)."""
        path = self._resolve(key)

        def _write() -> None:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)

        await asyncio.get_running_loop().run_in_executor(None, _write)
        logger.info("File stored", key=key, size=len(data))
        return key

    async def download(self, key: str) -> bytes:
        """Read file bytes from disk asynchronously."""
        path = self._resolve(key)

        if not path.exists():
            raise FileNotFoundError(f"No file found for key: {key!r}")

        def _read() -> bytes:
            return path.read_bytes()

        data = await asyncio.get_running_loop().run_in_executor(None, _read)
        logger.info("File retrieved", key=key, size=len(data))
        return data

    async def delete(self, key: str) -> None:
        """Remove a file — idempotent (no error if already gone)."""
        path = self._resolve(key)

        def _remove() -> None:
            if path.exists():
                path.unlink()

        await asyncio.get_running_loop().run_in_executor(None, _remove)
        logger.info("File deleted", key=key)

    async def exists(self, key: str) -> bool:
        """Return True if the file is present on disk."""
        path = self._resolve(key)
        return await asyncio.get_running_loop().run_in_executor(None, path.exists)
