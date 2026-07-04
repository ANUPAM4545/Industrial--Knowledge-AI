"""
Tests for Metadata Extractor
"""
from app.utils.metadata_extractor import MetadataExtractor


def test_metadata_extractor():
    text = "Word " * 200  # 200 words
    char_count = len(text)
    
    metadata = MetadataExtractor.extract(
        text=text,
        document_title="Test Doc",
        chunk_number=1,
        page_number=5,
        section_heading="Test Section"
    )
    
    assert metadata.document_title == "Test Doc"
    assert metadata.chunk_number == 1
    assert metadata.page_number == 5
    assert metadata.section_heading == "Test Section"
    
    # 200 words roughly takes 1 minute to read (200 WPM)
    assert metadata.estimated_reading_time_seconds == 60
    
    # Approx tokens = char_count // 4
    assert metadata.token_count == char_count // 4
    assert metadata.character_count == char_count
