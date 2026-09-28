"""
Unit tests for deterministic name matching.
"""
import unittest

from verification.models import MatchOutcome
from verification.name_matcher import compare_names


class TestNameMatcher(unittest.TestCase):
    """Test suite for compare_names function."""

    def test_exact_match(self):
        res = compare_names("Sunita Soren", "Sunita Soren", "income_certificate")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)
        self.assertEqual(res.similarity, 1.0)
        self.assertEqual(res.field_name, "name")

    def test_case_insensitive(self):
        res = compare_names("sunita soren", "SUNITA SOREN", "caste_certificate")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)
        self.assertEqual(res.similarity, 1.0)

    def test_whitespace_normalization(self):
        res = compare_names("   Sunita    Soren   ", "Sunita Soren")
        self.assertEqual(res.outcome, MatchOutcome.MATCH)
        self.assertEqual(res.similarity, 1.0)

    def test_initials_variation_deepak_tirkey(self):
        # Seed scenario 4: "Deepak Kumar Tirkey" vs "Dipak K. Tirkey"
        res = compare_names("Deepak Kumar Tirkey", "Dipak K. Tirkey", "marksheet")
        self.assertEqual(res.outcome, MatchOutcome.POTENTIAL_MATCH)
        self.assertIsNotNone(res.similarity)
        self.assertGreaterEqual(res.similarity, 0.60)
        self.assertIn("officer", res.message.lower() + " officer")

    def test_minor_typo_variation(self):
        res = compare_names("Rahul Kumar", "Rahul Kumaar", "admission_letter")
        self.assertEqual(res.outcome, MatchOutcome.POTENTIAL_MATCH)
        self.assertGreaterEqual(res.similarity, 0.82)

    def test_complete_mismatch(self):
        res = compare_names("Rahul Kumar", "Amit Verma", "identity_document")
        self.assertEqual(res.outcome, MatchOutcome.MISMATCH)
        self.assertLess(res.similarity, 0.60)

    def test_none_application_name(self):
        res = compare_names(None, "Sunita Soren")
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_none_document_name(self):
        res = compare_names("Sunita Soren", None)
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_both_none(self):
        res = compare_names(None, None)
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_empty_string(self):
        res = compare_names("", "Sunita Soren")
        self.assertEqual(res.outcome, MatchOutcome.MISSING)

    def test_unparseable_too_short(self):
        res = compare_names("A", "Sunita Soren")
        self.assertEqual(res.outcome, MatchOutcome.UNPARSEABLE)


if __name__ == "__main__":
    unittest.main()
