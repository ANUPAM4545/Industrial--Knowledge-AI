"""
NEXO — Fixed Size Chunker Strategy
"""
from typing import List

from app.chunking.base import ChunkStrategy
from app.chunking.models import ParsedDocument, SemanticChunk
from app.utils.metadata_extractor import MetadataExtractor


class FixedSizeChunker(ChunkStrategy):
    """
    Chunks a document into fixed size character blocks with a specified overlap.
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")
            
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, document: ParsedDocument) -> List[SemanticChunk]:
        text = document.full_text
        chunks: List[SemanticChunk] = []
        
        if not text:
            return chunks

        step_size = self.chunk_size - self.chunk_overlap
        current_idx = 0
        chunk_number = 1

        while current_idx < len(text):
            end_idx = min(current_idx + self.chunk_size, len(text))
            chunk_text = text[current_idx:end_idx]
            
            metadata = MetadataExtractor.extract(
                text=chunk_text,
                document_title=document.title,
                chunk_number=chunk_number,
            )
            
            semantic_chunk = SemanticChunk(
                document_id=document.document_id,
                chunk_index=chunk_number,
                text=chunk_text,
                metadata=metadata,
            )
            chunks.append(semantic_chunk)
            
            current_idx += step_size
            chunk_number += 1
            
        return chunks
