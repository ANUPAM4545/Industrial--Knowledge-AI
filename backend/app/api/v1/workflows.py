from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any
from app.db.session import get_db
from app.api.deps import CurrentUser
from app.models.intelligence import WorkflowTemplate
from pydantic import BaseModel

router = APIRouter()

class WorkflowCreate(BaseModel):
    name: str
    description: str = ""
    is_active: bool = True
    workflow_json: Dict[str, Any]

@router.get("/", status_code=status.HTTP_200_OK)
async def get_workflows(
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch all workflows.
    """
    result = await db.execute(select(WorkflowTemplate))
    workflows = result.scalars().all()
    return workflows

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow: WorkflowCreate,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db)
):
    """
    Create or save a workflow.
    """
    db_workflow = WorkflowTemplate(
        name=workflow.name,
        description=workflow.description,
        is_active=workflow.is_active,
        workflow_json=workflow.workflow_json,
        trigger_type='MANUAL'
    )
    db.add(db_workflow)
    await db.flush()
    await db.refresh(db_workflow)
    return db_workflow
