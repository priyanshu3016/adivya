"""
Stateless verification orchestrator.
Coordinates document checks, cross-field comparisons, and scheme eligibility rules
to produce a complete, explainable VerificationReport without any LLM dependency.
"""
import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional

from deficiency.codes import CheckResult, CheckType, DeficiencyType, Severity
from deficiency.templates import render_description
from eligibility.evaluator import evaluate_eligibility
from verification.document_checker import check_documents
from verification.field_comparators import (
    compare_category,
    compare_income,
    compare_marks,
    validate_date,
)
from verification.models import (
    DocumentCheckResult,
    FieldComparisonResult,
    MatchOutcome,
    RuleEvaluationResult,
    VerificationReport,
)


def _make_json_safe(val: Any) -> Any:
    """Recursively convert Decimals, dates, and non-primitives to JSON-serializable types."""
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.isoformat()
    if isinstance(val, dict):
        return {k: _make_json_safe(v) for k, v in val.items()}
    if isinstance(val, (list, tuple, set)):
        return [_make_json_safe(v) for v in val]
    return val


def verify_application(
    applicant_data: Dict[str, Any],
    scheme_data: Dict[str, Any],
    scheme_rules: List[Dict[str, Any]],
    documents: Dict[str, Dict[str, Any]],
    application_id: str = "",
) -> VerificationReport:
    """
    Execute full deterministic verification pipeline for an application.

    Args:
        applicant_data: Dict from Applicant model fields
        scheme_data: Dict from Scheme model fields
        scheme_rules: List of dicts representing SchemeRule rows
        documents: Dict keyed by document_type with extraction info
        application_id: Application ID string

    Returns:
        Complete VerificationReport
    """
    verification_results: List[Dict[str, Any]] = []
    deficiencies: List[Dict[str, Any]] = []
    field_comparisons: List[FieldComparisonResult] = []

    # -------------------------------------------------------------
    # STEP 1: Document Completeness and Integrity
    # -------------------------------------------------------------
    required_types = scheme_data.get("required_document_types") or []
    doc_checks: List[DocumentCheckResult] = check_documents(required_types, documents)

    for check in doc_checks:
        doc_type = check.document_type
        doc_info = documents.get(doc_type, {})
        doc_id = doc_info.get("document_id")

        if not check.is_present:
            # Document missing
            verification_results.append({
                "check_type": CheckType.DOCUMENT.value,
                "check_name": f"document_present_{doc_type}",
                "result": CheckResult.FAIL.value,
                "message": f"Required document '{doc_type}' was not uploaded.",
                "details": {"document_type": doc_type, "is_present": False},
            })
            deficiencies.append({
                "document_id": None,
                "deficiency_type": DeficiencyType.MISSING_DOCUMENT.value,
                "field_name": None,
                "expected_value": "uploaded",
                "actual_value": "missing",
                "description": render_description(
                    DeficiencyType.MISSING_DOCUMENT.value,
                    document_type=doc_type,
                ),
                "severity": Severity.CRITICAL.value,
            })
        else:
            ext_status = check.extraction_status
            if ext_status == "failed":
                verification_results.append({
                    "check_type": CheckType.DOCUMENT.value,
                    "check_name": f"document_processing_{doc_type}",
                    "result": CheckResult.FAIL.value,
                    "message": f"Document '{doc_type}' could not be processed.",
                    "details": {"document_id": doc_id, "issues": check.issues},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.INVALID_DATA.value,
                    "field_name": None,
                    "expected_value": "readable_document",
                    "actual_value": ext_status,
                    "description": render_description(
                        DeficiencyType.INVALID_DATA.value,
                        subtype="unreadable",
                        document_type=doc_type,
                        status=ext_status,
                    ),
                    "severity": Severity.CRITICAL.value,
                })
            elif ext_status == "manual_review":
                verification_results.append({
                    "check_type": CheckType.DOCUMENT.value,
                    "check_name": f"document_processing_{doc_type}",
                    "result": CheckResult.WARNING.value,
                    "message": f"Document '{doc_type}' requires manual review.",
                    "details": {"document_id": doc_id, "issues": check.issues},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.INVALID_DATA.value,
                    "field_name": None,
                    "expected_value": "high_confidence",
                    "actual_value": ext_status,
                    "description": render_description(
                        DeficiencyType.INVALID_DATA.value,
                        subtype="unreadable",
                        document_type=doc_type,
                        status=ext_status,
                    ),
                    "severity": Severity.WARNING.value,
                })
            elif check.missing_fields:
                verification_results.append({
                    "check_type": CheckType.DOCUMENT.value,
                    "check_name": f"document_fields_{doc_type}",
                    "result": CheckResult.WARNING.value,
                    "message": f"Required fields missing from '{doc_type}': {', '.join(check.missing_fields)}",
                    "details": {"document_id": doc_id, "missing_fields": check.missing_fields},
                })
                for mf in check.missing_fields:
                    deficiencies.append({
                        "document_id": doc_id,
                        "deficiency_type": DeficiencyType.INVALID_DATA.value,
                        "field_name": mf,
                        "expected_value": "present",
                        "actual_value": "missing",
                        "description": render_description(
                            DeficiencyType.INVALID_DATA.value,
                            subtype="field_missing",
                            field_name=mf,
                            document_type=doc_type,
                        ),
                        "severity": Severity.WARNING.value,
                    })
            else:
                verification_results.append({
                    "check_type": CheckType.DOCUMENT.value,
                    "check_name": f"document_completeness_{doc_type}",
                    "result": CheckResult.PASS.value,
                    "message": f"Document '{doc_type}' is uploaded and processed successfully.",
                    "details": {"document_id": doc_id},
                })

    # -------------------------------------------------------------
    # STEP 2: Cross-Field Verification
    # -------------------------------------------------------------
    for doc_type, doc_info in documents.items():
        if doc_info.get("extraction_status") == "failed":
            continue

        doc_id = doc_info.get("document_id")
        fields = doc_info.get("extracted_fields") or {}

        # 2a. Name Matching
        if "name" in fields and fields["name"]:
            from verification.name_matcher import compare_names
            name_res = compare_names(
                applicant_data.get("full_name"),
                fields["name"],
                doc_type,
            )
            field_comparisons.append(name_res)

            if name_res.outcome == MatchOutcome.MATCH:
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": f"name_match_{doc_type}",
                    "result": CheckResult.PASS.value,
                    "message": name_res.message,
                    "details": {"similarity": name_res.similarity, "document_id": doc_id},
                })
            elif name_res.outcome == MatchOutcome.POTENTIAL_MATCH:
                # Invariant: POTENTIAL_MATCH is always WARNING severity, never CRITICAL
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": f"name_match_{doc_type}",
                    "result": CheckResult.WARNING.value,
                    "message": name_res.message,
                    "details": {"similarity": name_res.similarity, "document_id": doc_id},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.NAME_MISMATCH.value,
                    "field_name": "name",
                    "expected_value": str(applicant_data.get("full_name")),
                    "actual_value": str(fields["name"]),
                    "description": render_description(
                        DeficiencyType.NAME_MISMATCH.value,
                        expected=applicant_data.get("full_name"),
                        actual=fields["name"],
                        document_type=doc_type,
                    ),
                    "severity": Severity.WARNING.value,
                })
            elif name_res.outcome == MatchOutcome.MISMATCH:
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": f"name_match_{doc_type}",
                    "result": CheckResult.FAIL.value,
                    "message": name_res.message,
                    "details": {"similarity": name_res.similarity, "document_id": doc_id},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.NAME_MISMATCH.value,
                    "field_name": "name",
                    "expected_value": str(applicant_data.get("full_name")),
                    "actual_value": str(fields["name"]),
                    "description": render_description(
                        DeficiencyType.NAME_MISMATCH.value,
                        expected=applicant_data.get("full_name"),
                        actual=fields["name"],
                        document_type=doc_type,
                    ),
                    "severity": Severity.CRITICAL.value,
                })
            elif name_res.outcome in (MatchOutcome.MISSING, MatchOutcome.UNPARSEABLE):
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": f"name_match_{doc_type}",
                    "result": CheckResult.WARNING.value,
                    "message": name_res.message,
                    "details": {"outcome": name_res.outcome.value, "document_id": doc_id},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.INVALID_DATA.value,
                    "field_name": "name",
                    "expected_value": str(applicant_data.get("full_name")),
                    "actual_value": str(fields.get("name")),
                    "description": render_description(
                        DeficiencyType.INVALID_DATA.value,
                        subtype="field_missing",
                        field_name="name",
                        document_type=doc_type,
                    ),
                    "severity": Severity.WARNING.value,
                })

        # 2b. Income Matching (income_certificate only)
        if doc_type == "income_certificate" and "annual_income" in fields:
            inc_res = compare_income(
                applicant_data.get("annual_family_income"),
                fields["annual_income"],
                doc_type,
            )
            field_comparisons.append(inc_res)

            if inc_res.outcome == MatchOutcome.MATCH:
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": "income_verification",
                    "result": CheckResult.PASS.value,
                    "message": inc_res.message,
                    "details": {"declared": inc_res.application_value, "extracted": inc_res.document_value},
                })
            elif inc_res.outcome == MatchOutcome.MISMATCH:
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": "income_verification",
                    "result": CheckResult.FAIL.value,
                    "message": inc_res.message,
                    "details": {"declared": inc_res.application_value, "extracted": inc_res.document_value},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.DATA_MISMATCH.value,
                    "field_name": "annual_family_income",
                    "expected_value": f"{inc_res.application_value:,}" if isinstance(inc_res.application_value, (int, float)) else str(inc_res.application_value),
                    "actual_value": f"{inc_res.document_value:,}" if isinstance(inc_res.document_value, (int, float)) else str(inc_res.document_value),
                    "description": render_description(
                        DeficiencyType.DATA_MISMATCH.value,
                        field_name="annual_family_income",
                        expected=f"{inc_res.application_value:,}" if isinstance(inc_res.application_value, (int, float)) else str(inc_res.application_value),
                        actual=f"{inc_res.document_value:,}" if isinstance(inc_res.document_value, (int, float)) else str(inc_res.document_value),
                    ),
                    "severity": Severity.CRITICAL.value,
                })
            elif inc_res.outcome in (MatchOutcome.MISSING, MatchOutcome.UNPARSEABLE):
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": "income_verification",
                    "result": CheckResult.WARNING.value,
                    "message": inc_res.message,
                    "details": {"outcome": inc_res.outcome.value},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.INVALID_DATA.value,
                    "field_name": "annual_family_income",
                    "expected_value": str(applicant_data.get("annual_family_income")),
                    "actual_value": str(fields.get("annual_income")),
                    "description": render_description(
                        DeficiencyType.INVALID_DATA.value,
                        subtype="field_missing",
                        field_name="annual_income",
                        document_type=doc_type,
                    ),
                    "severity": Severity.WARNING.value,
                })

        # 2c. Category Matching (caste_certificate only)
        if doc_type == "caste_certificate" and "category" in fields:
            cat_res = compare_category(
                applicant_data.get("category"),
                fields["category"],
                doc_type,
            )
            field_comparisons.append(cat_res)

            if cat_res.outcome == MatchOutcome.MATCH:
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": "category_cross_field",
                    "result": CheckResult.PASS.value,
                    "message": cat_res.message,
                    "details": {"category": cat_res.application_value},
                })
            elif cat_res.outcome == MatchOutcome.MISMATCH:
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": "category_cross_field",
                    "result": CheckResult.FAIL.value,
                    "message": cat_res.message,
                    "details": {"declared": cat_res.application_value, "extracted": cat_res.document_value},
                })
                deficiencies.append({
                    "document_id": doc_id,
                    "deficiency_type": DeficiencyType.DATA_MISMATCH.value,
                    "field_name": "category",
                    "expected_value": str(cat_res.application_value),
                    "actual_value": str(cat_res.document_value),
                    "description": render_description(
                        DeficiencyType.DATA_MISMATCH.value,
                        field_name="category",
                        expected=cat_res.application_value,
                        actual=cat_res.document_value,
                    ),
                    "severity": Severity.CRITICAL.value,
                })

        # 2d. Marks Validation (marksheet only)
        if doc_type == "marksheet" and any(k in fields for k in ("percentage", "marks_obtained")):
            marks_res = compare_marks(
                applicant_data.get("percentage") or applicant_data.get("marks_percentage"),
                fields.get("percentage"),
                fields.get("marks_obtained"),
                fields.get("total_marks"),
                doc_type,
            )
            field_comparisons.append(marks_res)
            # Only record if declared percentage was provided
            if marks_res.outcome != MatchOutcome.MISSING:
                v_res = CheckResult.PASS.value if marks_res.outcome == MatchOutcome.MATCH else CheckResult.WARNING.value
                verification_results.append({
                    "check_type": CheckType.CROSS_FIELD.value,
                    "check_name": "marks_verification",
                    "result": v_res,
                    "message": marks_res.message,
                    "details": {"outcome": marks_res.outcome.value},
                })

        # 2e. Date Validation (for all docs with dates)
        for date_key in ("issue_date", "admission_date", "date_of_birth"):
            if date_key in fields and fields[date_key]:
                date_res = validate_date(fields[date_key], date_key, doc_type)
                if date_res.outcome == MatchOutcome.UNPARSEABLE:
                    verification_results.append({
                        "check_type": CheckType.CROSS_FIELD.value,
                        "check_name": f"date_validation_{doc_type}_{date_key}",
                        "result": CheckResult.WARNING.value,
                        "message": date_res.message,
                        "details": {"raw_date": fields[date_key]},
                    })
                    deficiencies.append({
                        "document_id": doc_id,
                        "deficiency_type": DeficiencyType.INVALID_DATA.value,
                        "field_name": date_key,
                        "expected_value": "valid_date",
                        "actual_value": str(fields[date_key]),
                        "description": render_description(
                            DeficiencyType.INVALID_DATA.value,
                            subtype="invalid_date",
                            document_type=doc_type,
                            actual=fields[date_key],
                        ),
                        "severity": Severity.WARNING.value,
                    })

    # -------------------------------------------------------------
    # STEP 3: Scheme Eligibility Rules
    # -------------------------------------------------------------
    rule_evaluations: List[RuleEvaluationResult] = evaluate_eligibility(
        scheme_rules,
        applicant_data,
    )

    for rule_res in rule_evaluations:
        res_val = (
            CheckResult.PASS.value if rule_res.result == "pass"
            else CheckResult.FAIL.value if rule_res.result == "fail"
            else CheckResult.WARNING.value
        )
        verification_results.append({
            "check_type": CheckType.ELIGIBILITY.value,
            "check_name": f"scheme_rule_{rule_res.rule_field}",
            "result": res_val,
            "message": rule_res.message or f"Scheme rule for '{rule_res.rule_field}' passed.",
            "details": {
                "operator": rule_res.rule_operator,
                "expected": rule_res.rule_value,
                "actual": rule_res.applicant_value,
            },
        })

    # -------------------------------------------------------------
    # STEP 4: Decision Aggregation
    # -------------------------------------------------------------
    # Critical invariant: Ineligible category -> rejected immediately
    category_failed = any(
        r.rule_field == "category" and r.result == "fail"
        for r in rule_evaluations
    )

    has_critical_def = any(d.get("severity") == Severity.CRITICAL.value for d in deficiencies)
    has_warning_def = any(d.get("severity") == Severity.WARNING.value for d in deficiencies)

    if category_failed:
        overall_status = "rejected"
        requires_manual_review = False
        summary = "Application rejected: Applicant does not meet mandatory category eligibility criteria."
    elif has_critical_def:
        overall_status = "deficient"
        requires_manual_review = False
        crit_count = sum(1 for d in deficiencies if d.get("severity") == Severity.CRITICAL.value)
        summary = f"Application has {crit_count} critical deficiencies requiring applicant action."
    elif has_warning_def:
        overall_status = "deficient"
        requires_manual_review = True
        warn_count = sum(1 for d in deficiencies if d.get("severity") == Severity.WARNING.value)
        summary = f"Application flagged for officer manual review ({warn_count} warning items detected)."
    else:
        overall_status = "verified"
        requires_manual_review = False
        summary = "All document checks, cross-field comparisons, and scheme eligibility rules passed successfully."

    # Ensure all details objects are safely JSON-serializable
    for vr in verification_results:
        if "details" in vr and vr["details"] is not None:
            vr["details"] = _make_json_safe(vr["details"])

    return VerificationReport(
        application_id=str(application_id),
        overall_status=overall_status,
        document_checks=doc_checks,
        field_comparisons=field_comparisons,
        rule_evaluations=rule_evaluations,
        deficiencies=deficiencies,
        verification_results=verification_results,
        requires_manual_review=requires_manual_review,
        summary=summary,
    )
