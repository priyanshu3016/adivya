"""
Pure Python dataclasses for verification results, document checks, and reports.
No DB dependency — pure data contracts.
"""
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class MatchOutcome(str, Enum):
    """Outcomes for comparing application data against document extraction."""
    MATCH = "match"
    MISMATCH = "mismatch"
    POTENTIAL_MATCH = "potential_match"
    MISSING = "missing"
    UNPARSEABLE = "unparseable"


@dataclass
class FieldComparisonResult:
    """Result of cross-field comparison between declared and extracted data."""
    field_name: str
    document_type: str
    outcome: MatchOutcome
    application_value: Any
    document_value: Any
    similarity: Optional[float] = None
    message: str = ""


@dataclass
class DocumentCheckResult:
    """Result of checking document presence, extraction status, and required fields."""
    document_type: str
    is_present: bool
    extraction_status: Optional[str] = None
    missing_fields: List[str] = field(default_factory=list)
    issues: List[str] = field(default_factory=list)


@dataclass
class RuleEvaluationResult:
    """Result of evaluating a single scheme rule."""
    rule_field: str
    rule_operator: str
    rule_value: str
    applicant_value: Any
    result: str  # "pass" | "fail" | "warning"
    message: Optional[str] = None


@dataclass
class VerificationReport:
    """Aggregated verification report for an application."""
    application_id: str
    overall_status: str  # "verified" | "deficient" | "rejected"
    document_checks: List[DocumentCheckResult] = field(default_factory=list)
    field_comparisons: List[FieldComparisonResult] = field(default_factory=list)
    rule_evaluations: List[RuleEvaluationResult] = field(default_factory=list)
    deficiencies: List[Dict[str, Any]] = field(default_factory=list)
    verification_results: List[Dict[str, Any]] = field(default_factory=list)
    requires_manual_review: bool = False
    summary: str = ""
