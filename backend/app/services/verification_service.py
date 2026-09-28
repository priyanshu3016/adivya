"""Verification and deficiency evaluation service.

# STUB: Basic verification logic for SIH 2026 demo.
# Provides deterministic evaluation of scheme rules, document completeness,
# and cross-field consistency. Replace with Person 6's engine when implemented.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    Application,
    Applicant,
    Scheme,
    SchemeRule,
    Document,
    DocumentExtraction,
    VerificationResult,
    Deficiency,
    ApplicationStatusHistory,
    Notification,
)
from app.services import application_service


def _evaluate_operator(actual: Any, operator: str, expected_str: str) -> bool:
    """Evaluate a single rule operator against an actual value."""
    if actual is None:
        return False

    op = operator.lower()

    if op == "eq":
        return str(actual).strip().lower() == expected_str.strip().lower()

    elif op == "ne":
        return str(actual).strip().lower() != expected_str.strip().lower()

    elif op in ("lt", "le", "gt", "ge"):
        try:
            num_actual = float(actual)
            num_expected = float(expected_str)
            if op == "lt":
                return num_actual < num_expected
            elif op == "le":
                return num_actual <= num_expected
            elif op == "gt":
                return num_actual > num_expected
            elif op == "ge":
                return num_actual >= num_expected
        except (ValueError, TypeError):
            return False

    elif op == "in":
        allowed_items = [item.strip().lower() for item in expected_str.split(",")]
        return str(actual).strip().lower() in allowed_items

    elif op == "contains":
        return expected_str.strip().lower() in str(actual).strip().lower()

    return False


async def run_verification(
    db: AsyncSession,
    application_id: uuid.UUID,
) -> Dict[str, Any]:
    """Execute automated verification pipeline for a submitted application."""
    stmt = (
        select(Application)
        .where(Application.id == application_id)
        .options(
            selectinload(Application.applicant),
            selectinload(Application.scheme).selectinload(Scheme.rules),
            selectinload(Application.documents).selectinload(Document.extraction),
            selectinload(Application.deficiencies),
            selectinload(Application.verification_results),
        )
    )
    result = await db.execute(stmt)
    application = result.scalar_one_or_none()

    if not application:
        raise ValueError(f"Application {application_id} not found")

    applicant: Applicant = application.applicant
    scheme: Scheme = application.scheme

    # Remove prior verification results & unresolved deficiencies to allow re-verification
    await db.execute(
        delete(VerificationResult).where(VerificationResult.application_id == application_id)
    )
    await db.execute(
        delete(Deficiency).where(
            Deficiency.application_id == application_id,
            Deficiency.is_resolved == False,  # noqa: E712
        )
    )
    await db.flush()

    verification_records: List[VerificationResult] = []
    deficiency_records: List[Deficiency] = []
    hard_eligibility_failure = False
    critical_deficiency_found = False

    # -------------------------------------------------------------------------
    # 1. Document Completeness Checks
    # -------------------------------------------------------------------------
    uploaded_doc_map = {doc.document_type: doc for doc in application.documents}
    required_docs = scheme.required_document_types or []

    for req_type in required_docs:
        doc = uploaded_doc_map.get(req_type)
        if doc and doc.upload_status in ("uploaded", "processed", "processing"):
            vr = VerificationResult(
                id=uuid.uuid4(),
                application_id=application_id,
                check_type="document",
                check_name=f"required_document_{req_type}",
                result="pass",
                message=f"Required document '{req_type}' is uploaded and verified",
                details={"document_id": str(doc.id), "file_name": doc.file_name},
            )
            verification_records.append(vr)
        else:
            vr = VerificationResult(
                id=uuid.uuid4(),
                application_id=application_id,
                check_type="document",
                check_name=f"required_document_{req_type}",
                result="fail",
                message=f"Required document '{req_type}' is missing",
                details={"required_document_type": req_type},
            )
            verification_records.append(vr)

            deficiency = Deficiency(
                id=uuid.uuid4(),
                application_id=application_id,
                document_id=None,
                deficiency_type="missing_document",
                field_name=req_type,
                expected_value=req_type,
                actual_value=None,
                description=f"Missing required document: {req_type.replace('_', ' ').title()}",
                severity="critical",
                is_resolved=False,
            )
            deficiency_records.append(deficiency)
            critical_deficiency_found = True

    # -------------------------------------------------------------------------
    # 2. Scheme Eligibility Rules Evaluation
    # -------------------------------------------------------------------------
    rules = sorted(scheme.rules, key=lambda r: r.priority)
    for rule in rules:
        if not rule.is_active:
            continue

        actual_val = getattr(applicant, rule.rule_field, None)
        passed = _evaluate_operator(actual_val, rule.rule_operator, rule.rule_value)

        if passed:
            vr = VerificationResult(
                id=uuid.uuid4(),
                application_id=application_id,
                check_type="eligibility",
                check_name=f"rule_{rule.rule_field}",
                result="pass",
                message=f"Eligibility check passed for {rule.rule_field}",
                details={
                    "field": rule.rule_field,
                    "operator": rule.rule_operator,
                    "expected": rule.rule_value,
                    "actual": str(actual_val),
                },
            )
            verification_records.append(vr)
        else:
            vr = VerificationResult(
                id=uuid.uuid4(),
                application_id=application_id,
                check_type="eligibility",
                check_name=f"rule_{rule.rule_field}",
                result="fail",
                message=rule.error_message,
                details={
                    "field": rule.rule_field,
                    "operator": rule.rule_operator,
                    "expected": rule.rule_value,
                    "actual": str(actual_val),
                },
            )
            verification_records.append(vr)

            # Check if this is a hard constraint (e.g., category mismatch)
            if rule.rule_field == "category":
                hard_eligibility_failure = True
            else:
                deficiency = Deficiency(
                    id=uuid.uuid4(),
                    application_id=application_id,
                    document_id=None,
                    deficiency_type="invalid_data",
                    field_name=rule.rule_field,
                    expected_value=f"{rule.rule_operator} {rule.rule_value}",
                    actual_value=str(actual_val) if actual_val is not None else None,
                    description=rule.error_message,
                    severity="critical",
                    is_resolved=False,
                )
                deficiency_records.append(deficiency)
                critical_deficiency_found = True

    # -------------------------------------------------------------------------
    # 3. Cross-Field Consistency Checks (Profile vs. OCR Extractions)
    # -------------------------------------------------------------------------
    for doc in application.documents:
        if not doc.extraction or not doc.extraction.extracted_fields:
            continue

        extracted = doc.extraction.extracted_fields

        # Check Income Certificate consistency
        if doc.document_type == "income_certificate" and "annual_income" in extracted:
            try:
                cert_income = float(extracted["annual_income"])
                profile_income = float(applicant.annual_family_income or 0.0)
                if abs(cert_income - profile_income) > 100.0:
                    vr = VerificationResult(
                        id=uuid.uuid4(),
                        application_id=application_id,
                        check_type="cross_field",
                        check_name="income_consistency",
                        result="fail",
                        message=(
                            f"Income mismatch: Declared ₹{profile_income:,.2f} "
                            f"vs. Certificate ₹{cert_income:,.2f}"
                        ),
                        details={
                            "declared_income": profile_income,
                            "certificate_income": cert_income,
                            "difference": abs(cert_income - profile_income),
                        },
                    )
                    verification_records.append(vr)

                    deficiency = Deficiency(
                        id=uuid.uuid4(),
                        application_id=application_id,
                        document_id=doc.id,
                        deficiency_type="data_mismatch",
                        field_name="annual_family_income",
                        expected_value=f"{profile_income:.2f}",
                        actual_value=f"{cert_income:.2f}",
                        description=(
                            f"Income mismatch: Profile declared ₹{profile_income:,.2f}, "
                            f"but uploaded certificate states ₹{cert_income:,.2f}"
                        ),
                        severity="critical",
                        is_resolved=False,
                    )
                    deficiency_records.append(deficiency)
                    critical_deficiency_found = True
                else:
                    vr = VerificationResult(
                        id=uuid.uuid4(),
                        application_id=application_id,
                        check_type="cross_field",
                        check_name="income_consistency",
                        result="pass",
                        message="Income on certificate matches declared income",
                        details={"income": cert_income},
                    )
                    verification_records.append(vr)
            except (ValueError, TypeError):
                pass

        # Check Name consistency
        if "name" in extracted and extracted["name"]:
            cert_name = str(extracted["name"]).strip()
            profile_name = str(applicant.full_name).strip()
            if cert_name.lower() != profile_name.lower():
                vr = VerificationResult(
                    id=uuid.uuid4(),
                    application_id=application_id,
                    check_type="cross_field",
                    check_name=f"name_consistency_{doc.document_type}",
                    result="warning",
                    message=(
                        f"Name variation in {doc.document_type}: "
                        f"'{profile_name}' vs. '{cert_name}'"
                    ),
                    details={
                        "profile_name": profile_name,
                        "certificate_name": cert_name,
                    },
                )
                verification_records.append(vr)

                deficiency = Deficiency(
                    id=uuid.uuid4(),
                    application_id=application_id,
                    document_id=doc.id,
                    deficiency_type="name_mismatch",
                    field_name="full_name",
                    expected_value=profile_name,
                    actual_value=cert_name,
                    description=f"Name variation in {doc.document_type}: '{profile_name}' vs. '{cert_name}'",
                    severity="warning",
                    is_resolved=False,
                )
                deficiency_records.append(deficiency)

    # Persist all verification results and deficiencies
    for vr in verification_records:
        db.add(vr)
    for defic in deficiency_records:
        db.add(defic)

    await db.flush()

    # -------------------------------------------------------------------------
    # 4. Status Transition Logic
    # -------------------------------------------------------------------------
    if hard_eligibility_failure:
        new_status = "rejected"
        status_reason = "Hard eligibility criteria failed (category requirement)"
    elif critical_deficiency_found:
        new_status = "deficient"
        status_reason = "Critical deficiencies detected requiring applicant action"
    else:
        new_status = "verified"
        status_reason = "All automated verification checks successfully passed"

    await application_service.update_application_status(
        db=db,
        application_id=application_id,
        new_status=new_status,
        reason=status_reason,
    )

    # Notify applicant if deficient or rejected
    if new_status in ("deficient", "rejected"):
        await application_service.create_notification(
            db=db,
            user_id=applicant.user_id,
            notification_type="deficiency" if new_status == "deficient" else "status_change",
            title=f"Application {new_status.title()}",
            message=status_reason,
            application_id=application_id,
        )

    await db.flush()

    return {
        "application_id": application_id,
        "status": new_status,
        "total_checks": len(verification_records),
        "passed_checks": sum(1 for v in verification_records if v.result == "pass"),
        "warning_checks": sum(1 for v in verification_records if v.result == "warning"),
        "failed_checks": sum(1 for v in verification_records if v.result == "fail"),
        "deficiencies_found": len(deficiency_records),
        "results": verification_records,
        "deficiencies": deficiency_records,
    }


async def get_application_verification_results(
    db: AsyncSession,
    application_id: uuid.UUID,
) -> List[VerificationResult]:
    """Retrieve all verification records for an application."""
    stmt = (
        select(VerificationResult)
        .where(VerificationResult.application_id == application_id)
        .order_by(VerificationResult.verified_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_application_deficiencies(
    db: AsyncSession,
    application_id: uuid.UUID,
) -> List[Deficiency]:
    """Retrieve all deficiencies recorded for an application."""
    stmt = (
        select(Deficiency)
        .where(Deficiency.application_id == application_id)
        .order_by(Deficiency.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def resolve_deficiency(
    db: AsyncSession,
    application_id: uuid.UUID,
    deficiency_id: uuid.UUID,
) -> Deficiency:
    """Mark a specific deficiency as resolved."""
    deficiency = await db.get(Deficiency, deficiency_id)
    if not deficiency or deficiency.application_id != application_id:
        raise ValueError("Deficiency not found for this application")

    deficiency.is_resolved = True
    deficiency.resolved_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(deficiency)

    # Check if any unresolved critical deficiencies remain
    stmt = (
        select(Deficiency)
        .where(
            Deficiency.application_id == application_id,
            Deficiency.severity == "critical",
            Deficiency.is_resolved == False,  # noqa: E712
        )
    )
    remaining_res = await db.execute(stmt)
    unresolved_critical = list(remaining_res.scalars().all())

    # If all critical deficiencies are resolved, transition status to verified
    app = await db.get(Application, application_id)
    if app and app.status == "deficient" and not unresolved_critical:
        await application_service.update_application_status(
            db=db,
            application_id=application_id,
            new_status="verified",
            reason="All critical deficiencies resolved by administrator",
        )

    return deficiency
