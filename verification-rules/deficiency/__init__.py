"""
Deficiency module exposing canonical deficiency types, severities, check types,
check results, and deterministic description rendering.
"""
from deficiency.codes import CheckResult, CheckType, DeficiencyType, Severity
from deficiency.templates import render_description

__all__ = [
    "DeficiencyType",
    "Severity",
    "CheckType",
    "CheckResult",
    "render_description",
]
