"""
Eligibility module for evaluating scheme rules against applicant data.
"""
from eligibility.evaluator import evaluate_eligibility
from eligibility.operators import evaluate_operator

__all__ = ["evaluate_operator", "evaluate_eligibility"]
