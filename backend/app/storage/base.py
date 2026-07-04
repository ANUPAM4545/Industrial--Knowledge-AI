"""
Storage Provider Abstraction

Defines the interface every storage backend must implement.
Concrete providers (Local, S3, Azure Blob) are plug-in replacements
— the service layer depends only on this protocol.
"""
from abc import ABC, abstractmethod


class StorageProvider(ABC):
    """
    Abstract base for all storage backends.

    All paths accepted and returned are opaque storage keys, never
    raw filesystem paths exposed to callers outside this module.
    """

    @abstractmethod
    async def upload(self, key: str, data: bytes, content_type: str) -> str:
        """
        Persist binary data under the given storage key.

        Args:
            key:          Unique storage identifier (e.g. UUID filename).
            data:         Raw file bytes.
            content_type: MIME type for metadata / serving headers.

        Returns:
            The storage key under which the file was saved.
        """

    @abstractmethod
    async def download(self, key: str) -> bytes:
        """
        Retrieve the raw bytes for the given storage key.

        Raises:
            FileNotFoundError: if the key does not exist.
        """

    @abstractmethod
    async def delete(self, key: str) -> None:
        """
        Remove the file identified by key.

        Must be idempotent — no error if the key does not exist.
        """

    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Return True if a file exists for the given key."""
