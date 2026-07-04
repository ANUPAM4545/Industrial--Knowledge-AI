"""Storage package — exports the provider interface and default implementation."""
from app.storage.base import StorageProvider
from app.storage.local_storage import LocalStorageProvider

__all__ = ["StorageProvider", "LocalStorageProvider"]
