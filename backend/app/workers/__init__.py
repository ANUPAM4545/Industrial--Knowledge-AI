"""Workers package — background task entry-points."""
from app.workers.document_worker import process_document

__all__ = ["process_document"]
