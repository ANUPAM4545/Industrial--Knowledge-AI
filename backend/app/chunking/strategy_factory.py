"""
ForgeMind AI — Chunking Strategy Factory
"""
import enum

from app.chunking.base import ChunkStrategy
from app.chunking.fixed_chunker import FixedSizeChunker
from app.chunking.recursive_chunker import RecursiveChunker
from app.chunking.heading_chunker import HeadingChunker


class ChunkingStrategyType(str, enum.Enum):
    FIXED = "fixed"
    RECURSIVE = "recursive"
    HEADING = "heading"


class ChunkStrategyFactory:
    """
    Factory to create and provide the appropriate chunking strategy.
    """

    @staticmethod
    def get_strategy(
        strategy_type: ChunkingStrategyType = ChunkingStrategyType.RECURSIVE,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> ChunkStrategy:
        """
        Get the instantiated chunking strategy.
        
        Args:
            strategy_type: The type of strategy to use.
            chunk_size: Target size for chunks in characters.
            chunk_overlap: Amount of character overlap between chunks.
            
        Returns:
            An instance of a class implementing ChunkStrategy.
        """
        if strategy_type == ChunkingStrategyType.FIXED:
            return FixedSizeChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        
        elif strategy_type == ChunkingStrategyType.HEADING:
            return HeadingChunker(max_chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        
        elif strategy_type == ChunkingStrategyType.RECURSIVE:
            return RecursiveChunker(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
            
        raise ValueError(f"Unknown chunking strategy: {strategy_type}")
