import pytest
from app.evaluation.confidence_calculator import WeightedConfidenceCalculator


def test_confidence_calculator_perfect():
    calculator = WeightedConfidenceCalculator()
    score = calculator.calculate(
        avg_similarity=1.0,
        citation_score=1.0,
        completeness=1.0,
        response_length=500
    )
    assert score == 100.0


def test_confidence_calculator_low():
    calculator = WeightedConfidenceCalculator()
    score = calculator.calculate(
        avg_similarity=0.5,
        citation_score=0.2,
        completeness=0.1,
        response_length=300
    )
    assert score == pytest.approx(30.0)


def test_confidence_calculator_short_response_penalty():
    calculator = WeightedConfidenceCalculator()
    score = calculator.calculate(
        avg_similarity=0.8,
        citation_score=1.0,
        completeness=0.8,
        response_length=10
    )
    assert score == pytest.approx(73.0)


def test_confidence_calculator_boundary():
    calculator = WeightedConfidenceCalculator()
    score = calculator.calculate(
        avg_similarity=0.0,
        citation_score=0.0,
        completeness=0.0,
        response_length=5
    )
    assert score == 0.0
