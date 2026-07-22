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

    response_nodes = []
    response_edges = []
    
    if not nodes:
        # Fallback mock graph for demo purposes when DB is empty
        response_nodes = [
            {"id": "Pump 123", "group": "Equipment", "size": 25, "description": "Centrifugal pump in Sector 4"},
            {"id": "Valve 45A", "group": "Equipment", "size": 15, "description": "Pressure release valve"},
            {"id": "John Doe", "group": "Person", "size": 20, "description": "Senior Maintenance Engineer"},
            {"id": "ISO-9001", "group": "Standard", "size": 20, "description": "Quality Management"},
            {"id": "Leak Incident 092", "group": "Incident", "size": 15, "description": "Minor leak reported"},
            {"id": "High Pressure Risk", "group": "Risk", "size": 20, "description": "System pressure above normal"},
            {"id": "Maintenance Manual v2", "group": "Document", "size": 20, "description": "Latest procedures"},
        ]
        response_edges = [
            {"source": "Pump 123", "target": "Valve 45A", "value": 1, "label": "CONNECTED_TO"},
            {"source": "John Doe", "target": "Pump 123", "value": 1, "label": "MAINTAINS"},
            {"source": "Pump 123", "target": "ISO-9001", "value": 1, "label": "COMPLIES_WITH"},
            {"source": "Leak Incident 092", "target": "Valve 45A", "value": 1, "label": "INVOLVED"},
            {"source": "High Pressure Risk", "target": "Pump 123", "value": 1, "label": "THREATENS"},
            {"source": "John Doe", "target": "Maintenance Manual v2", "value": 1, "label": "AUTHORED"},
        ]
    else:
        for node in nodes:
            response_nodes.append({
                "id": node.label,
                "group": node.type,
                "size": 20,
                "description": node.metadata_json.get("description", "") if node.metadata_json else ""
            })
            
        for edge in edges:
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
