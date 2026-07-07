"""
NEXO — Evaluation API Endpoints
"""
from fastapi import APIRouter, status, HTTPException
from typing import List
from app.evaluation.models import EvaluationResult
from app.evaluation.logger import evaluation_db

router = APIRouter()


@router.get("/latest", status_code=status.HTTP_200_OK, response_model=EvaluationResult)
async def get_latest_evaluation():
    """
    Fetch the quality results of the most recent RAG generation.
    """
    result = evaluation_db.get_latest()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No evaluation records found."
        )
    return result


@router.get("/conversation/{id}", status_code=status.HTTP_200_OK, response_model=List[EvaluationResult])
async def get_evaluation_by_conversation(id: str):
    """
    Fetch historical evaluations for a specific conversation ID.
    """
    results = evaluation_db.get_by_conversation(id)
    return results


@router.get("/system", status_code=status.HTTP_200_OK)
async def get_evaluation_system_stats():
    """
    Fetch aggregated performance and quality stats for the developer dashboard.
    """
    stats = evaluation_db.get_system_stats()
    return stats
