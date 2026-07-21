"""
NEXO — Celery Application Entrypoint
"""
import asyncio
from celery import Celery
from app.core.config import settings
import app.db.models  # noqa: F401 (Pre-load all models to resolve SQLAlchemy foreign keys)

# Initialize Celery App
celery_app = Celery(
    "nexo_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Wrapper to run async tasks
def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    return loop.run_until_complete(coro)

@celery_app.task(name="app.workers.document_worker.process_document_task", bind=True, max_retries=3)
def process_document_task(self, document_id: str, workspace_id: str):
    """
    Synchronous wrapper for the asynchronous document processing pipeline.
    """
    from app.workers.document_worker import process_document
    from app.db.session import AsyncSessionLocal
    
    async def _run():
        async with AsyncSessionLocal() as session:
            await process_document(document_id, workspace_id, session)
            
    run_async(_run())
