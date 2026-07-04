"""
ForgeMind AI — Chunking Strategy Interface
"""
from abc import ABC, abstractmethod
from typing import List

from app.chunking.models import ParsedDocument, SemanticChunk


class ChunkStrategy(ABC):
    """Abstract base class for all chunking strategies."""
    
    @abstractmethod
    def chunk(self, document: ParsedDocument) -> List[SemanticChunk]:
        """
        Split a ParsedDocument into SemanticChunks.
        
        Args:
            document: The parsed document to chunk.
            
        Returns:
            List of SemanticChunks.
        """
        pass
