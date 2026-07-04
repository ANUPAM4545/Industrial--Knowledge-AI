"""
ForgeMind AI — Heading Chunker Strategy
"""
from typing import List

from app.chunking.base import ChunkStrategy
from app.chunking.models import ParsedDocument, SemanticChunk
from app.chunking.recursive_chunker import RecursiveChunker
from app.utils.metadata_extractor import MetadataExtractor


class HeadingChunker(ChunkStrategy):
    """
    Chunks a document primarily by its structural headings.
    If a section under a heading is too large, it sub-chunks it recursively.
    """

    def __init__(self, max_chunk_size: int = 1500, chunk_overlap: int = 200):
        self.max_chunk_size = max_chunk_size
        self.chunk_overlap = chunk_overlap
        # Use recursive chunker to sub-divide large sections
        self._fallback_chunker = RecursiveChunker(chunk_size=max_chunk_size, chunk_overlap=chunk_overlap)

    def chunk(self, document: ParsedDocument) -> List[SemanticChunk]:
        if not document.sections:
            # Fallback to recursive chunking if no headings exist
            return self._fallback_chunker.chunk(document)

        chunks: List[SemanticChunk] = []
        chunk_number = 1

        for section in document.sections:
            if not section.text.strip():
                continue

            # If the section fits within our max size, create a single chunk
            if len(section.text) <= self.max_chunk_size:
                metadata = MetadataExtractor.extract(
                    text=section.text,
                    document_title=document.title,
                    chunk_number=chunk_number,
                    section_heading=section.heading,
                )
                
                chunks.append(SemanticChunk(
                    document_id=document.document_id,
                    chunk_index=chunk_number,
                    text=section.text,
                    metadata=metadata,
                ))
                chunk_number += 1
            else:
                # Sub-chunk this section using recursive logic
                # Create a temporary document just for this section to reuse recursive logic
                temp_doc = ParsedDocument(
                    document_id=document.document_id,
                    title=document.title,
                    full_text=section.text,
                )
                sub_chunks = self._fallback_chunker.chunk(temp_doc)
                
                for sc in sub_chunks:
                    # Enrich with heading info and correct chunk number
                    metadata = MetadataExtractor.extract(
                        text=sc.text,
                        document_title=document.title,
                        chunk_number=chunk_number,
                        section_heading=section.heading,
                    )
                    
                    chunks.append(SemanticChunk(
                        document_id=document.document_id,
                        chunk_index=chunk_number,
                        text=sc.text,
                        metadata=metadata,
                    ))
                    chunk_number += 1

        return chunks
