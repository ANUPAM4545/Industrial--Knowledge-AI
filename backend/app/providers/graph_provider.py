"""
ForgeMind AI — Graph Provider Abstraction
Keeps the business logic decoupled from the underlying graph storage engine.
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class GraphNode:
    def __init__(self, id: str, title: str, node_type: str, metadata: Dict[str, Any] = None):
        self.id = id
        self.title = title
        self.node_type = node_type
        self.metadata = metadata or {}


class GraphEdge:
    def __init__(self, id: str, source_id: str, target_id: str, relationship_type: str, metadata: Dict[str, Any] = None):
        self.id = id
        self.source_id = source_id
        self.target_id = target_id
        self.relationship_type = relationship_type
        self.metadata = metadata or {}


class GraphProvider(ABC):
    """
    Abstract interface for interacting with the Enterprise Knowledge Graph.
    Can be implemented via PostgreSQL (for hackathon/demo) or Neo4j (production).
    """

    @abstractmethod
    async def add_node(self, title: str, node_type: str, document_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> GraphNode:
        pass

    @abstractmethod
    async def add_edge(self, source_node_id: str, target_node_id: str, relationship_type: str, confidence: float = 1.0, metadata: Optional[Dict[str, Any]] = None) -> GraphEdge:
        pass

    @abstractmethod
    async def get_node(self, node_id: str) -> Optional[GraphNode]:
        pass

    @abstractmethod
    async def get_neighbors(self, node_id: str, max_depth: int = 1) -> Dict[str, Any]:
        """Returns nodes and edges directly connected to the specified node"""
        pass

    @abstractmethod
    async def find_path(self, start_node_id: str, end_node_id: str) -> List[GraphEdge]:
        """Finds the shortest path between two nodes, useful for Explainable AI"""
        pass
        
    @abstractmethod
    async def get_subgraph(self, limit: int = 100) -> Dict[str, Any]:
        """Returns a chunk of the graph for visualization (Nodes + Edges)"""
        pass
