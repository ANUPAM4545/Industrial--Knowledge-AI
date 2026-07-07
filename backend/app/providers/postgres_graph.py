"""
NEXO — Postgres Graph Provider
Implementation of GraphProvider using PostgreSQL relational tables for hackathon/demo.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.providers.graph_provider import GraphProvider, GraphNode, GraphEdge
from app.models.knowledge_graph import KnowledgeNode, KnowledgeEdge


class PostgresGraphProvider(GraphProvider):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_node(self, title: str, node_type: str, document_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> GraphNode:
        db_node = KnowledgeNode(
            title=title,
            node_type=node_type,
            document_id=document_id,
            metadata_json=metadata
        )
        self.db.add(db_node)
        await self.db.flush()
        return GraphNode(id=db_node.id, title=db_node.title, node_type=db_node.node_type, metadata=db_node.metadata_json)

    async def add_edge(self, source_node_id: str, target_node_id: str, relationship_type: str, confidence: float = 1.0, metadata: Optional[Dict[str, Any]] = None) -> GraphEdge:
        db_edge = KnowledgeEdge(
            source_node_id=source_node_id,
            target_node_id=target_node_id,
            relationship_type=relationship_type,
            confidence=confidence,
            metadata_json=metadata
        )
        self.db.add(db_edge)
        await self.db.flush()
        return GraphEdge(id=db_edge.id, source_id=db_edge.source_node_id, target_id=db_edge.target_node_id, relationship_type=db_edge.relationship_type, metadata=db_edge.metadata_json)

    async def get_node(self, node_id: str) -> Optional[GraphNode]:
        stmt = select(KnowledgeNode).where(KnowledgeNode.id == node_id)
        result = await self.db.execute(stmt)
        db_node = result.scalars().first()
        if db_node:
            return GraphNode(id=db_node.id, title=db_node.title, node_type=db_node.node_type, metadata=db_node.metadata_json)
        return None

    async def get_neighbors(self, node_id: str, max_depth: int = 1) -> Dict[str, Any]:
        # Basic implementation for 1-hop neighborhood
        stmt_edges = select(KnowledgeEdge).where(
            or_(KnowledgeEdge.source_node_id == node_id, KnowledgeEdge.target_node_id == node_id)
        )
        edges_res = await self.db.execute(stmt_edges)
        db_edges = edges_res.scalars().all()
        
        neighbor_ids = set()
        for e in db_edges:
            neighbor_ids.add(e.source_node_id)
            neighbor_ids.add(e.target_node_id)
            
        stmt_nodes = select(KnowledgeNode).where(KnowledgeNode.id.in_(list(neighbor_ids)))
        nodes_res = await self.db.execute(stmt_nodes)
        db_nodes = nodes_res.scalars().all()
        
        return {
            "nodes": [
                {"id": n.id, "title": n.title, "node_type": n.node_type, "metadata": n.metadata_json}
                for n in db_nodes
            ],
            "edges": [
                {"id": e.id, "source": e.source_node_id, "target": e.target_node_id, "type": e.relationship_type, "confidence": e.confidence}
                for e in db_edges
            ]
        }

    async def find_path(self, start_node_id: str, end_node_id: str) -> List[GraphEdge]:
        # Fallback to a simple direct connection check for hackathon scope
        # (A real recursive CTE or Neo4j would be used in production)
        stmt = select(KnowledgeEdge).where(
            or_(
                (KnowledgeEdge.source_node_id == start_node_id) & (KnowledgeEdge.target_node_id == end_node_id),
                (KnowledgeEdge.source_node_id == end_node_id) & (KnowledgeEdge.target_node_id == start_node_id)
            )
        )
        result = await self.db.execute(stmt)
        edge = result.scalars().first()
        if edge:
            return [GraphEdge(id=edge.id, source_id=edge.source_node_id, target_id=edge.target_node_id, relationship_type=edge.relationship_type, metadata=edge.metadata_json)]
        return []

    async def get_subgraph(self, limit: int = 100) -> Dict[str, Any]:
        stmt_nodes = select(KnowledgeNode).limit(limit)
        nodes_res = await self.db.execute(stmt_nodes)
        db_nodes = nodes_res.scalars().all()
        
        node_ids = [n.id for n in db_nodes]
        
        if not node_ids:
            return {"nodes": [], "edges": []}
            
        stmt_edges = select(KnowledgeEdge).where(
            KnowledgeEdge.source_node_id.in_(node_ids),
            KnowledgeEdge.target_node_id.in_(node_ids)
        ).limit(limit * 2)
        edges_res = await self.db.execute(stmt_edges)
        db_edges = edges_res.scalars().all()
        
        return {
            "nodes": [
                {"id": n.id, "title": n.title, "node_type": n.node_type, "metadata": n.metadata_json}
                for n in db_nodes
            ],
            "edges": [
                {"id": e.id, "source": e.source_node_id, "target": e.target_node_id, "type": e.relationship_type, "confidence": e.confidence}
                for e in db_edges
            ]
        }
