from fastapi import APIRouter, HTTPException, Query, status
from typing import List

from app.api.deps import DBSession, Storage
from app.document_viewer.viewer_service import DocumentViewerService
from app.document_viewer.highlight_service import HighlightService
from app.document_viewer.models import DocumentViewerInfo, DocumentPageData, DocumentSearchMatch

router = APIRouter()


@router.get("/{id}/viewer", response_model=DocumentViewerInfo, status_code=status.HTTP_200_OK)
async def get_viewer_info(
    id: str,
    db: DBSession,
    storage: Storage
):
    """Get metadata statistics for the explainable document viewer."""
    try:
        service = DocumentViewerService(db, storage)
        return await service.get_viewer_info(id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{id}/page/{page}", response_model=DocumentPageData, status_code=status.HTTP_200_OK)
async def get_page_content(
    id: str,
    page: int,
    db: DBSession,
    storage: Storage
):
    """Retrieve raw page text with mapped citation highlights."""
    try:
        service = DocumentViewerService(db, storage)
        page_data = await service.get_page_content(id, page)
        page_data.highlights = await HighlightService.get_highlights_for_page(
            db, id, page, page_data.text_content
        )
        return page_data
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{id}/citation/{citation_id}", status_code=status.HTTP_200_OK)
async def resolve_citation(
    id: str,
    citation_id: str,
    db: DBSession
):
    """Resolve which page and content coordinates correspond to a citation."""
    try:
        return await HighlightService.resolve_citation(db, id, citation_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{id}/search", response_model=List[DocumentSearchMatch], status_code=status.HTTP_200_OK)
async def search_document(
    id: str,
    db: DBSession,
    storage: Storage,
    q: str = Query(..., min_length=1)
):
    """Search inside the document and extract matching snippets."""
    try:
        service = DocumentViewerService(db, storage)
        return await service.search_document(id, q)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
