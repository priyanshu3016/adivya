"""
Unit tests for scheme eligibility rule operators and evaluator.
"""
import unittest

from eligibility.evaluator import evaluate_eligibility
from eligibility.operators import evaluate_operator

SEED_RULES = [
    {
        "rule_field": "category",
        "rule_operator": "eq",
        "rule_value": "ST",
        "error_message": "Applicant must belong to Scheduled Tribe (ST) category",
        "priority": 1,
        "is_active": True,
    },
    {
        "rule_field": "annual_family_income",
        "rule_operator": "le",
        "rule_value": "250000",
        "error_message": "Annual family income must not exceed ₹2,50,000",
        "priority": 2,
        "is_active": True,
    },
    {
        "rule_field": "current_education_level",
        "rule_operator": "in",
        "rule_value": "undergraduate,postgraduate",
        "error_message": "Education level must be undergraduate or postgraduate",
        "priority": 3,
        "is_active": True,
    },
]


class TestEligibilityOperators(unittest.TestCase):
    """Test suite for evaluate_operator."""

    def test_eq_operator(self):
        self.assertTrue(evaluate_operator("eq", "ST", "ST"))
        self.assertTrue(evaluate_operator("eq", "st", "ST"))
        self.assertFalse(evaluate_operator("eq", "OBC", "ST"))

    def test_ne_operator(self):
        self.assertTrue(evaluate_operator("ne", "OBC", "ST"))
        self.assertFalse(evaluate_operator("ne", "ST", "ST"))

    def test_le_operator(self):
        self.assertTrue(evaluate_operator("le", 120000, "250000"))
        self.assertTrue(evaluate_operator("le", 250000, "250000"))
        self.assertFalse(evaluate_operator("le", 340000, "250000"))

    def test_lt_operator(self):
        self.assertTrue(evaluate_operator("lt", 249999, "250000"))
        self.assertFalse(evaluate_operator("lt", 250000, "250000"))

    def test_ge_operator(self):
        self.assertTrue(evaluate_operator("ge", 250000, "250000"))
        self.assertTrue(evaluate_operator("ge", 300000, "250000"))
        self.assertFalse(evaluate_operator("ge", 100000, "250000"))

    def test_gt_operator(self):
        self.assertTrue(evaluate_operator("gt", 250001, "250000"))
        self.assertFalse(evaluate_operator("gt", 250000, "250000"))

    def test_in_operator(self):
        self.assertTrue(evaluate_operator("in", "undergraduate", "undergraduate,postgraduate"))
        self.assertTrue(evaluate_operator("in", "postgraduate", "undergraduate,postgraduate"))
        self.assertFalse(evaluate_operator("in", "secondary", "undergraduate,postgraduate"))

    def test_contains_operator(self):
        self.assertTrue(evaluate_operator("contains", "Ranchi University", "Ranchi"))
        self.assertFalse(evaluate_operator("contains", "Delhi University", "Ranchi"))

    def test_none_or_missing_value_returns_none(self):
        self.assertIsNone(evaluate_operator("eq", None, "ST"))
        self.assertIsNone(evaluate_operator("le", None, "250000"))

    def test_unparseable_numeric_returns_none(self):
        self.assertIsNone(evaluate_operator("le", "not_a_number", "250000"))

    def test_unknown_operator_returns_none(self):
        self.assertIsNone(evaluate_operator("invalid_op", "ST", "ST"))


class TestEligibilityEvaluator(unittest.TestCase):
    """Test suite for evaluate_eligibility with seed rules."""

    def test_sunita_scenario_all_rules_pass(self):
        # Category: ST, Income: 120000, Education: undergraduate
        applicant = {
            "category": "ST",
            "annual_family_income": 120000,
            "current_education_level": "undergraduate",
        }
        results = evaluate_eligibility(SEED_RULES, applicant)
        self.assertEqual(len(results), 3)
        self.assertTrue(all(r.result == "pass" for r in results))
        self.assertTrue(all(r.message is None for r in results))

    def test_amit_scenario_category_fails(self):
        # Amit Verma: Category OBC, Income 200000, Education undergraduate
        applicant = {
            "category": "OBC",
            "annual_family_income": 200000,
            "current_education_level": "undergraduate",
        }
        results = evaluate_eligibility(SEED_RULES, applicant)
        self.assertEqual(len(results), 3)

        res_map = {r.rule_field: r for r in results}
        self.assertEqual(res_map["category"].result, "fail")
        self.assertIn("Scheduled Tribe", res_map["category"].message)
        self.assertEqual(res_map["annual_family_income"].result, "pass")
        self.assertEqual(res_map["current_education_level"].result, "pass")

    def test_missing_income_returns_warning(self):
        applicant = {
            "category": "ST",
            "annual_family_income": None,
            "current_education_level": "undergraduate",
        }
        results = evaluate_eligibility(SEED_RULES, applicant)
        res_map = {r.rule_field: r for r in results}

        self.assertEqual(res_map["category"].result, "pass")
        self.assertEqual(res_map["annual_family_income"].result, "warning")
        self.assertIn("could not be evaluated", res_map["annual_family_income"].message)


if __name__ == "__main__":
    unittest.main()
