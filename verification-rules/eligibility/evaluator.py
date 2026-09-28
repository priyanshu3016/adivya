"""
Scheme eligibility rule evaluator.
Evaluates active SchemeRule configurations against applicant profile data deterministically.
"""
from typing import Any, Dict, List

from eligibility.operators import evaluate_operator
from verification.models import RuleEvaluationResult


def evaluate_eligibility(
    rules: List[Dict[str, Any]],
    applicant_data: Dict[str, Any],
) -> List[RuleEvaluationResult]:
    """
    Evaluate all active scheme eligibility rules against applicant data.

    Args:
        rules: List of rule dicts with:
               {
                   "rule_field": str,
                   "rule_operator": str,
                   "rule_value": str,
                   "error_message": str,
                   "priority": int,
                   "is_active": bool
               }
        applicant_data: Dict containing applicant profile fields (e.g. category, income, etc.)

    Returns:
        List of RuleEvaluationResult items ordered by priority ASC.
    """
    # Filter active rules and sort by priority ASC
    active_rules = [r for r in rules if r.get("is_active", True)]
    sorted_rules = sorted(active_rules, key=lambda r: r.get("priority", 0))

    results: List[RuleEvaluationResult] = []

    for rule in sorted_rules:
        field = rule.get("rule_field", "")
        op = rule.get("rule_operator", "")
        val = str(rule.get("rule_value", ""))
        err_msg = rule.get("error_message")

        actual = applicant_data.get(field)
        op_res = evaluate_operator(op, actual, val)

        if op_res is True:
            res_status = "pass"
            message = None
        elif op_res is False:
            res_status = "fail"
            message = err_msg or f"Application does not meet criteria for {field} ({op} {val})."
        else:
            res_status = "warning"
            message = f"Field '{field}' could not be evaluated (value missing or unparseable)."

        results.append(
            RuleEvaluationResult(
                rule_field=field,
                rule_operator=op,
                rule_value=val,
                applicant_value=actual,
                result=res_status,
                message=message,
            )
        )

    return results
