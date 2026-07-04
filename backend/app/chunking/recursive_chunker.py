"""
ForgeMind AI — Recursive Chunker Strategy
"""
import re
from typing import List

from app.chunking.base import ChunkStrategy
from app.chunking.models import ParsedDocument, SemanticChunk
from app.utils.metadata_extractor import MetadataExtractor


class RecursiveChunker(ChunkStrategy):
    """
    Chunks a document by recursively splitting by paragraph, sentence, and word
    until the pieces fit within the maximum chunk size, preserving context boundaries.
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")
            
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.separators = ["\n\n", "\n", " ", ""]

    def chunk(self, document: ParsedDocument) -> List[SemanticChunk]:
        text = document.full_text
        if not text:
            return []

        splits = self._split_text(text, self.separators)
        
        chunks: List[SemanticChunk] = []
        current_chunk_text = ""
        chunk_number = 1
        
        for split in splits:
            if not split.strip():
                continue
                
            if len(current_chunk_text) + len(split) <= self.chunk_size:
                current_chunk_text += split
            else:
                if current_chunk_text:
                    # Save current chunk
                    chunks.append(self._create_chunk(current_chunk_text.strip(), document, chunk_number))
                    chunk_number += 1
                    
                    # Start new chunk with overlap
                    # Simple overlap: take the last `chunk_overlap` characters, but split at a natural boundary if possible
                    overlap_text = current_chunk_text[-self.chunk_overlap:] if self.chunk_overlap > 0 else ""
                    # Ensure overlap starts after a space to avoid cutting words
                    space_idx = overlap_text.find(" ")
                    if space_idx != -1 and space_idx < len(overlap_text) // 2:
                        overlap_text = overlap_text[space_idx+1:]
                        
                    current_chunk_text = overlap_text + split
                else:
                    # The split itself is larger than chunk_size (should rarely happen if empty separator is used)
                    chunks.append(self._create_chunk(split.strip(), document, chunk_number))
                    chunk_number += 1
                    current_chunk_text = ""

        if current_chunk_text.strip():
            chunks.append(self._create_chunk(current_chunk_text.strip(), document, chunk_number))

        return chunks

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        """Recursively split text using the list of separators."""
        if not text or not separators:
            return [text]

        separator = separators[0]
        splits = []
        
        if separator == "":
            return list(text)
            
        # Split by the current separator
        # We want to keep the separator with the preceding text or as its own item 
        # so it's not lost. A simple split loses it.
        # Use regex to keep separators.
        pattern = f"({re.escape(separator)})"
        parts = re.split(pattern, text)
        
        # Combine parts with their separators
        combined = []
        for i in range(0, len(parts), 2):
            part = parts[i]
            sep = parts[i+1] if i + 1 < len(parts) else ""
            if part + sep:
                combined.append(part + sep)

        # For parts that are still too large, recursively split them
        final_splits = []
        for part in combined:
            if len(part) > self.chunk_size and len(separators) > 1:
                final_splits.extend(self._split_text(part, separators[1:]))
            else:
                final_splits.append(part)
                
        return final_splits

    def _create_chunk(self, text: str, document: ParsedDocument, chunk_number: int) -> SemanticChunk:
        metadata = MetadataExtractor.extract(
            text=text,
            document_title=document.title,
            chunk_number=chunk_number,
        )
        return SemanticChunk(
            document_id=document.document_id,
            chunk_index=chunk_number,
            text=text,
            metadata=metadata,
        )
