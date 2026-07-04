# Reusable Components

## Can Reuse Directly
- **Frontend UI Library**: The `frontend/src/components/ui/` folder containing shadcn/ui components is highly reusable.
- **Backend Core**: `backend/app/core/config.py`, `security.py`, and `logging.py` are robust templates for any FastAPI project.
- **Docker Setup**: The `docker-compose.yml` defining the PostgreSQL, Qdrant, and Redis stack is plug-and-play.

## Needs Modification
- **Local Storage Service**: `backend/app/services/document_service.py` is currently tied to local disk storage. For production, it needs an S3/Blob storage adapter.
- **AI RAG API**: `ai-service/app/api/rag.py` has a `NotImplementedError` and requires the actual LangChain implementation.

## Should Be Removed
- `scripts/seed.py`: The seed script is currently heavily commented out and acts as a placeholder. It should be rewritten when the auth models are finalized.
