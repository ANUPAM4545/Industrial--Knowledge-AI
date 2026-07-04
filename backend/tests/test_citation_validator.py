import pytest
from app.evaluation.citation_validator import RegexCitationValidator


def test_citation_validator_empty():
    validator = RegexCitationValidator()
    res = validator.validate("No citations here", [])
    assert res["citation_score"] == 1.0
    assert len(res["citations"]) == 0
    assert len(res["missing_references"]) == 0


def test_citation_validator_valid():
    validator = RegexCitationValidator()
    chunks = [
        {"document_id": "operating_manual", "page_number": 5, "chunk_index": 2},
        {"document_id": "engine_guide", "page_number": 12, "chunk_index": 0},
    ]
    response = "Check the oil pressure [operating_manual, p. 5, chunk 2] and battery [engine_guide, 12]."
    res = validator.validate(response, chunks)
    assert res["citation_score"] == 1.0
    assert len(res["citations"]) == 2
    assert res["citations"][0]["is_valid"] is True
    assert res["citations"][1]["is_valid"] is True
    assert len(res["missing_references"]) == 0


def test_citation_validator_invalid_and_duplicate():
    validator = RegexCitationValidator()
    chunks = [
        {"document_id": "operating_manual", "page_number": 5, "chunk_index": 2},
    ]
    response = "First citation [operating_manual, 5], duplicate [operating_manual, 5], missing [engine_guide, 10]."
    res = validator.validate(response, chunks)
    assert res["citation_score"] == pytest.approx(2/3)
    assert res["duplicate_citations_count"] == 1
    assert len(res["missing_references"]) == 1
    assert res["missing_references"][0] == "[engine_guide, 10]"
