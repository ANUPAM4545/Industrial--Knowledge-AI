import pytest
from app.evaluation.response_metrics import SimpleResponseMetricsCalculator


def test_response_metrics_calculator():
    calculator = SimpleResponseMetricsCalculator()
    response = "Grounding test. Doc A p.1 [docA, 1], Doc B p.2 [docB, 2], Doc A p.2 [docA, 2]"
    citations = [
        {"document_id": "docA", "page_number": 1},
        {"document_id": "docB", "page_number": 2},
        {"document_id": "docA", "page_number": 2},
    ]
    res = calculator.calculate(response, [], citations)
    assert res["response_length"] == len(response)
    assert res["token_estimate"] == int(len(response) / 4)
    assert res["citation_count"] == 3
    assert res["documents_used"] == 2
    assert res["pages_referenced"] == 2
