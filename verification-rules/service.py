"""
Database integration service for TribalScholar AI verification.
The only module that bridges the database layer (backend/app/db) and the verification engine.
"""
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

# Ensure search paths are configured
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
DOC_AI_DIR = PROJECT_ROOT / "document-ai"

for p in [str(BASE_DIR), str(PROJECT_ROOT), str(BACKEND_DIR), str(DOC_AI_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from sqlalchemy.orm import Session

from app.db import crud
from app.db.models import Application
from verification.models import VerificationReport
from verification.orchestrator import verify_application


def run_verification(
    db: Session,
    application_id: Union[uuid.UUID, str],
) -> VerificationReport:
    """
    Run end-to-end deterministic verification for an application, persisting:
    - VerificationResult records
    - Deficiency records
    - Application status update (verified, deficient, or rejected — NEVER approved)
    - In-app Notification for the applicant

    Args:
        db: Active SQLAlchemy Session
        application_id: UUID or string UUID of the Application

    Returns:
        The generated VerificationReport
    """
    app_uuid = uuid.UUID(str(application_id)) if not isinstance(application_id, uuid.UUID) else application_id

    app = db.get(Application, app_uuid)
    if not app:
        raise ValueError(f"Application with ID {app_uuid} does not exist.")

    applicant = app.applicant
    scheme = app.scheme

    if not applicant:
        raise ValueError(f"Application {app_uuid} is missing an associated Applicant profile.")
    if not scheme:
        raise ValueError(f"Application {app_uuid} is missing an associated Scheme.")

    # 1. Build applicant_data dict
    applicant_data: Dict[str, Any] = {
        "full_name": applicant.full_name,
        "category": applicant.category,
        "annual_family_income": applicant.annual_family_income,
        "tribe_name": applicant.tribe_name,
        "institution_name": applicant.institution_name,
        "course_name": applicant.course_name,
        "current_education_level": applicant.current_education_level,
        "date_of_birth": applicant.date_of_birth,
    }

    # 2. Build scheme_data dict
    scheme_data: Dict[str, Any] = {
        "required_document_types": list(scheme.required_document_types or []),
        "max_income_limit": scheme.max_income_limit,
        "required_category": scheme.required_category,
        "min_education_level": scheme.min_education_level,
    }

    # 3. Build scheme_rules list
    scheme_rules: List[Dict[str, Any]] = []
    for rule in scheme.rules:
        scheme_rules.append({
            "rule_field": rule.rule_field,
            "rule_operator": rule.rule_operator,
            "rule_value": rule.rule_value,
            "error_message": rule.error_message,
            "priority": rule.priority,
            "is_active": rule.is_active,
        })

    # 4. Build documents dict
    documents_dict: Dict[str, Dict[str, Any]] = {}
    for doc in app.documents:
        doc_ext = doc.extraction
        documents_dict[doc.document_type] = {
            "document_id": str(doc.id),
            "extraction_status": doc_ext.extraction_status if doc_ext else "failed",
            "extracted_fields": dict(doc_ext.extracted_fields or {}) if doc_ext else {},
            "errors": list(doc_ext.errors or []) if doc_ext else ["No extraction available"],
            "ocr_confidence": doc_ext.ocr_confidence if doc_ext else None,
        }

    # 5. Run verification orchestrator
    report = verify_application(
        applicant_data=applicant_data,
        scheme_data=scheme_data,
        scheme_rules=scheme_rules,
        documents=documents_dict,
        application_id=str(app_uuid),
    )

    # 6. Persist verification results to DB
    for vr in report.verification_results:
        crud.record_verification_result(
            db=db,
            application_id=app_uuid,
            check_type=vr["check_type"],
            check_name=vr["check_name"],
            result=vr["result"],
            message=vr.get("message"),
            details=vr.get("details"),
        )

    # 7. Persist deficiencies to DB
    for d in report.deficiencies:
        doc_uuid: Optional[uuid.UUID] = None
        if d.get("document_id"):
            try:
                doc_uuid = uuid.UUID(str(d["document_id"]))
            except (ValueError, TypeError):
                doc_uuid = None

        crud.create_deficiency(
            db=db,
            application_id=app_uuid,
            deficiency_type=d["deficiency_type"],
            description=d["description"],
            document_id=doc_uuid,
            field_name=d.get("field_name"),
            expected_value=d.get("expected_value"),
            actual_value=d.get("actual_value"),
            severity=d.get("severity", "warning"),
        )

    # 8. Update Application Status (verified, deficient, or rejected — NEVER approved)
    crud.update_application_status(
        db=db,
        application_id=app_uuid,
        new_status=report.overall_status,
        reason=report.summary,
    )

    # 9. Create in-app notification if applicant has user_id
    if applicant.user_id:
        notif_type = "deficiency" if report.overall_status == "deficient" else "status_change"
        notif_title = f"Application Status: {report.overall_status.capitalize()}"
        crud.create_notification(
            db=db,
            user_id=applicant.user_id,
            notification_type=notif_type,
            title=notif_title,
            message=report.summary,
            application_id=app_uuid,
        )

    return report
