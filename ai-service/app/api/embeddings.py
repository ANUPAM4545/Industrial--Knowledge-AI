"""
ForgeMind AI — Embedding Endpoints
POST /embeddings/document  — Embed and index a document
DELETE /embeddings/{document_id} — Remove document vectors
"""
from fastapi import APIRouter, status

router = APIRouter()


@router.post("/document", status_code=status.HTTP_202_ACCEPTED)
async def embed_document(document_id: str, file_path: str):
    """
    Trigger the embedding pipeline for a document:
    1. Parse document (PDF/DOCX/TXT)
    2. Run OCR if needed
    3. Chunk text with overlap
    4. Generate BAAI/bge embeddings
    5. Upsert vectors into Qdrant
    TODO: Implement full embedding pipeline.
    """
    return {"message": "Document embedding queued", "document_id": document_id}


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document_vectors(document_id: str):
    """
    Remove all vectors for a document from Qdrant.
    TODO: Implement Qdrant vector deletion.
    """
    return None
