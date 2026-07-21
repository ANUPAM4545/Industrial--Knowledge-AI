from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.deps import CurrentWorkspace
from app.models.knowledge_graph import KnowledgeNode, KnowledgeEdge

router = APIRouter()

@router.get("", status_code=status.HTTP_200_OK)
async def get_knowledge_graph(
    workspace: CurrentWorkspace,
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch the full knowledge graph (nodes and edges) for the current workspace.
    """
    nodes_result = await db.execute(select(KnowledgeNode).filter(KnowledgeNode.workspace_id == workspace.id))
    nodes = nodes_result.scalars().all()
    
    edges_result = await db.execute(select(KnowledgeEdge).filter(KnowledgeEdge.workspace_id == workspace.id))
    edges = edges_result.scalars().all()

    # If the graph is entirely empty, we could build a fallback graph from documents and chunks.
    # But for a true "live" representation, we'll return exactly what's in the KnowledgeGraph tables.
    
    response_nodes = []
    for node in nodes:
        response_nodes.append({
            "id": node.label,
            "group": node.type,
            "size": 15,
            "description": node.metadata_json.get("description", "") if node.metadata_json else ""
        })
        
    response_edges = []
    for edge in edges:
        # We need the source and target node labels
        source_node = next((n for n in nodes if n.id == edge.source_node_id), None)
        target_node = next((n for n in nodes if n.id == edge.target_node_id), None)
        if source_node and target_node:
            response_edges.append({
                "source": source_node.label,
                "target": target_node.label,
                "value": 1,
                "label": edge.relationship_type
            })
            
    return {
        "nodes": response_nodes,
        "links": response_edges
    }
