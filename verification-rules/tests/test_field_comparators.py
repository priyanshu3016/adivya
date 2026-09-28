"""
Unit tests for deterministic field comparators (income, category, marks, date).
"""
import unittest

from verification.field_comparators import (
    compare_category,
    compare_income,
    compare_marks,
    validate_date,
)
from verification.models import MatchOutcome


class TestFieldComparators(unittest.TestCase):
    """Test suite for field comparison functions."""

    # --- Income comparison tests ---
    def test_income_match(self):
        res = compare_income(120000.0, 120000)
        self.assertEqual(res.outcome, MatchOutcome.MATCH)
        self.assertEqual(res.application_value, 120000)
        self.assertEqual(res.document_value, 120000)

    def test_income_mismatch_priya_scenario(self):
        # Seed scenario 3: Priya Lakra declared ₹1,80,000 vs certificate ₹3,40,000
        res = compare_income(180000.0, 340000)
        self.assertEqual(res.outcome, MatchOutcome.MISMATCH)
        self.assertEqual(res.application_value, 180000)
        self.assertEqual(res.document_value, 340000)

    def test_income_none_declared(self):
        res = compare_income(None, 120000)
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_income_none_extracted(self):
        res = compare_income(120000.0, None)
        self.assertEqual(res.outcome, MatchOutcome.UNPARSEABLE)

    def test_income_string_formatted(self):
        res = compare_income("₹ 1,20,000", "120000")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)

    # --- Category comparison tests ---
    def test_category_match(self):
        res = compare_category("ST", "ST")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)

    def test_category_case_insensitive(self):
        res = compare_category("st", "ST")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)

    def test_category_mismatch(self):
        res = compare_category("ST", "OBC")
        self.assertEqual(res.outcome, MatchOutcome.MISMATCH)

    def test_category_none_extracted(self):
        res = compare_category("ST", None)
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_category_none_declared(self):
        res = compare_category(None, "ST")
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    # --- Marks comparison tests ---
    def test_marks_match_direct_pct(self):
        res = compare_marks(85.5, 85.5)
        self.assertEqual(res.outcome, MatchOutcome.MATCH)

    def test_marks_match_computed_ratio(self):
        # 400 / 500 = 80.0%
        res = compare_marks(80.0, None, extracted_obtained=400, extracted_total=500)
        self.assertEqual(res.outcome, MatchOutcome.MATCH)

    def test_marks_mismatch(self):
        res = compare_marks(85.0, 60.0)
        self.assertEqual(res.outcome, MatchOutcome.MISMATCH)

    def test_marks_none_declared(self):
        res = compare_marks(None, 85.0)
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_marks_none_extracted(self):
        res = compare_marks(75.0, None, None, None)
        self.assertEqual(res.outcome, MatchOutcome.UNPARSEABLE)

    # --- Date validation tests ---
    def test_date_valid(self):
        res = validate_date("2025-06-10", "issue_date", "caste_certificate")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)
        self.assertEqual(res.document_value, "2025-06-10")

    def test_date_valid_slash_format(self):
        res = validate_date("10/06/2025", "issue_date", "caste_certificate")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)
        self.assertEqual(res.document_value, "2025-06-10")

    def test_date_none(self):
        res = validate_date(None, "issue_date", "caste_certificate")
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_date_unparseable(self):
        res = validate_date("not-a-real-date", "issue_date", "caste_certificate")
        self.assertEqual(res.outcome, MatchOutcome.UNPARSEABLE)


if __name__ == "__main__":
    unittest.main()
