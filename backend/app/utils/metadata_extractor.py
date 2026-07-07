"""
NEXO — Metadata Extractor Utility
"""
from typing import Optional

from app.chunking.models import ChunkMetadata


class MetadataExtractor:
    """Utility class to extract and calculate metadata for text chunks."""
    
    WORDS_PER_MINUTE = 200
    CHARS_PER_TOKEN = 4  # Approximation without relying on external tokenizers

    @staticmethod
    def extract(
        text: str,
        document_title: str,
        chunk_number: int,
        page_number: Optional[int] = None,
        section_heading: Optional[str] = None,
    ) -> ChunkMetadata:
        """
        Extract metadata for a specific chunk of text.
        
        Args:
            text: The text content of the chunk.
            document_title: Title of the source document.
            chunk_number: Sequential number of this chunk.
            page_number: Page where this chunk primarily resides.
            section_heading: The heading under which this chunk is located.
            
        Returns:
            ChunkMetadata object with calculated statistics.
        """
        char_count = len(text)
        
        # Token approximation
        # In a real application, we would use tiktoken or similar based on the specific LLM.
        token_count = char_count // MetadataExtractor.CHARS_PER_TOKEN
        
        # Estimated reading time in seconds
        word_count = len(text.split())
        reading_time_seconds = max(1, int((word_count / MetadataExtractor.WORDS_PER_MINUTE) * 60))
        
        return ChunkMetadata(
            document_title=document_title,
            page_number=page_number,
            section_heading=section_heading,
            chunk_number=chunk_number,
            token_count=token_count,
            character_count=char_count,
            estimated_reading_time_seconds=reading_time_seconds,
        )
