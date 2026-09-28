"""
Deterministic rule operators for scheme eligibility evaluation.
Supported operators: eq, ne, lt, le, gt, ge, in, contains.
Returns:
- True: rule is satisfied
- False: rule is violated
- None: value is missing, unparseable, or invalid operator (requires manual review)
"""
from decimal import Decimal, InvalidOperation
from typing import Any, Optional


def evaluate_operator(
    operator: str,
    actual_value: Any,
    rule_value_str: str,
) -> Optional[bool]:
    """
    Evaluate a condition deterministically.

    Args:
        operator: One of ('eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'contains')
        actual_value: The value from the applicant profile or application snapshot
        rule_value_str: The expected value or threshold as stored in SchemeRule

    Returns:
        True if satisfied, False if violated, None if unparseable/missing.
    """
    if actual_value is None or rule_value_str is None:
        return None

    op = str(operator).strip().lower()
    rule_str = str(rule_value_str).strip()

    # Exact string equality / inequality
    if op == "eq":
        return str(actual_value).strip().lower() == rule_str.lower()

    if op == "ne":
        return str(actual_value).strip().lower() != rule_str.lower()

    # Numeric comparisons: lt, le, gt, ge
    if op in ("lt", "le", "gt", "ge"):
        try:
            # Clean string if currency or commas exist
            actual_clean = str(actual_value).replace(",", "").replace("₹", "").strip()
            rule_clean = rule_str.replace(",", "").replace("₹", "").strip()
            act_dec = Decimal(actual_clean)
            rule_dec = Decimal(rule_clean)
        except (InvalidOperation, ValueError, TypeError):
            return None

        if op == "lt":
            return act_dec < rule_dec
        if op == "le":
            return act_dec <= rule_dec
        if op == "gt":
            return act_dec > rule_dec
        if op == "ge":
            return act_dec >= rule_dec

    # Set membership: 'in'
    if op == "in":
        allowed_items = [item.strip().lower() for item in rule_str.split(",") if item.strip()]
        return str(actual_value).strip().lower() in allowed_items

    # Substring inclusion: 'contains'
    if op == "contains":
        return rule_str.lower() in str(actual_value).strip().lower()

    # Unknown operator
    return None
