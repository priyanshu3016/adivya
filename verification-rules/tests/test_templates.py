"""
Unit tests for deficiency description templates and codes.
"""
import unittest

from deficiency.codes import CheckResult, CheckType, DeficiencyType, Severity
from deficiency.templates import FALLBACK_DESCRIPTION, render_description


class TestDeficiencyCodes(unittest.TestCase):
    """Test that all enums match database constraints exactly."""

    def test_deficiency_types_match_db_constraint(self):
        expected_types = {
            "missing_document",
            "data_mismatch",
            "name_mismatch",
            "invalid_data",
            "expired_document",
        }
        actual_types = {e.value for e in DeficiencyType}
        self.assertEqual(actual_types, expected_types)

    def test_severities_match_db_constraint(self):
        expected_severities = {"critical", "warning", "info"}
        actual_severities = {e.value for e in Severity}
        self.assertEqual(actual_severities, expected_severities)

    def test_check_types_match_db_constraint(self):
        expected_check_types = {"eligibility", "document", "cross_field"}
        actual_check_types = {e.value for e in CheckType}
        self.assertEqual(actual_check_types, expected_check_types)

    def test_check_results_match_db_constraint(self):
        expected_results = {"pass", "fail", "warning"}
        actual_results = {e.value for e in CheckResult}
        self.assertEqual(actual_results, expected_results)


class TestDeficiencyTemplates(unittest.TestCase):
    """Test deterministic description rendering."""

    def test_missing_document_rendering(self):
        desc = render_description(
            DeficiencyType.MISSING_DOCUMENT.value,
            document_type="admission_letter",
        )
        self.assertIn("admission_letter", desc)
        self.assertIn("Required document", desc)

    def test_data_mismatch_income_rendering(self):
        desc = render_description(
            DeficiencyType.DATA_MISMATCH.value,
            field_name="annual_family_income",
            expected="1,80,000",
            actual="3,40,000",
        )
        self.assertIn("income", desc.lower())
        self.assertIn("1,80,000", desc)
        self.assertIn("3,40,000", desc)

    def test_data_mismatch_category_rendering(self):
        desc = render_description(
            DeficiencyType.DATA_MISMATCH.value,
            field_name="category",
            expected="ST",
            actual="OBC",
        )
        self.assertIn("Category declared", desc)
        self.assertIn("ST", desc)
        self.assertIn("OBC", desc)

    def test_data_mismatch_generic_rendering(self):
        desc = render_description(
            DeficiencyType.DATA_MISMATCH.value,
            field_name="date_of_birth",
            expected="2003-05-15",
            actual="2003-05-16",
        )
        self.assertIn("date_of_birth", desc)
        self.assertIn("2003-05-15", desc)

    def test_name_mismatch_rendering(self):
        desc = render_description(
            DeficiencyType.NAME_MISMATCH.value,
            document_type="income_certificate",
            expected="Sunita Soren",
            actual="Sunita S.",
        )
        self.assertIn("officer review", desc)
        self.assertIn("Sunita Soren", desc)

    def test_invalid_data_subtypes(self):
        # field missing
        desc_missing = render_description(
            DeficiencyType.INVALID_DATA.value,
            subtype="field_missing",
            field_name="annual_income",
            document_type="income_certificate",
        )
        self.assertIn("Required field 'annual_income'", desc_missing)

        # unreadable
        desc_unreadable = render_description(
            DeficiencyType.INVALID_DATA.value,
            subtype="unreadable",
            document_type="marksheet",
            status="failed",
        )
        self.assertIn("could not be processed", desc_unreadable)

        # invalid date
        desc_date = render_description(
            DeficiencyType.INVALID_DATA.value,
            subtype="invalid_date",
            document_type="caste_certificate",
            actual="32-13-2020",
        )
        self.assertIn("could not be parsed", desc_date)

    def test_expired_document_rendering(self):
        desc = render_description(
            DeficiencyType.EXPIRED_DOCUMENT.value,
            document_type="income_certificate",
            actual="2021-01-01",
            expected="2024-04-01",
        )
        self.assertIn("may be expired", desc)
        self.assertIn("2021-01-01", desc)

    def test_unknown_type_returns_fallback(self):
        desc = render_description("completely_invalid_type")
        self.assertEqual(desc, FALLBACK_DESCRIPTION)

    def test_missing_kwargs_does_not_raise(self):
        desc = render_description(DeficiencyType.MISSING_DOCUMENT.value)
        self.assertIn("[unknown]", desc)
        self.assertNotIn("KeyError", desc)


if __name__ == "__main__":
    unittest.main()
