"""CRUD operations for TribalScholar AI database entities."""

import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    User,
    Applicant,
    Scheme,
    SchemeRule,
    Application,
    Document,
    DocumentExtraction,
    VerificationResult,
    Deficiency,
    ApplicationStatusHistory,
    AdminReview,
    Notification,
)


# =============================================================================
# Synchronous CRUD helpers (for seed, migrations, CLI & sync tests)
# =============================================================================

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def create_user(
    db: Session,
    email: str,
    password_hash: str,
    full_name: str,
    role: str = "applicant",
) -> User:
    user = User(
        id=uuid.uuid4(),
        email=email,
        password_hash=password_hash,
        full_name=full_name,
        role=role,
    )
    db.add(user)
    db.flush()
    return user


def create_applicant_profile(
    db: Session,
    user_id: uuid.UUID,
    full_name: str,
    category: str = "ST",
    **kwargs: Any,
) -> Applicant:
    applicant = Applicant(
        id=uuid.uuid4(),
        user_id=user_id,
        full_name=full_name,
        category=category,
        **kwargs,
    )
    db.add(applicant)
    db.flush()
    return applicant


def create_scheme(
    db: Session,
    name: str,
    description: Optional[str] = None,
    max_income_limit: Optional[float] = None,
    required_category: Optional[str] = "ST",
    required_document_types: Optional[List[str]] = None,
    award_amount: Optional[float] = None,
) -> Scheme:
    scheme = Scheme(
        id=uuid.uuid4(),
        name=name,
        description=description,
        max_income_limit=max_income_limit,
        required_category=required_category,
        required_document_types=required_document_types or [],
        award_amount=award_amount,
    )
    db.add(scheme)
    db.flush()
    return scheme


def create_application(
    db: Session,
    applicant_id: uuid.UUID,
    scheme_id: uuid.UUID,
    academic_year: Optional[str] = None,
    snapshot: Optional[Dict[str, Any]] = None,
) -> Application:
    app = Application(
        id=uuid.uuid4(),
        applicant_id=applicant_id,
        scheme_id=scheme_id,
        status="draft",
        academic_year=academic_year,
        applicant_snapshot=snapshot,
    )
    db.add(app)
    db.flush()

    # Create initial status history entry
    history = ApplicationStatusHistory(
        id=uuid.uuid4(),
        application_id=app.id,
        old_status=None,
        new_status="draft",
        reason="Initial application draft created",
    )
    db.add(history)
    db.flush()
    return app


def update_application_status(
    db: Session,
    application_id: uuid.UUID,
    new_status: str,
    changed_by_user_id: Optional[uuid.UUID] = None,
    reason: Optional[str] = None,
) -> Optional[Application]:
    app = db.get(Application, application_id)
    if not app:
        return None
    old_status = app.status
    app.status = new_status
    history = ApplicationStatusHistory(
        id=uuid.uuid4(),
        application_id=application_id,
        old_status=old_status,
        new_status=new_status,
        changed_by_user_id=changed_by_user_id,
        reason=reason,
    )
    db.add(history)
    db.flush()
    return app


def create_document(
    db: Session,
    application_id: uuid.UUID,
    document_type: str,
    file_name: str,
    file_path: str,
    mime_type: Optional[str] = None,
    file_size_bytes: Optional[int] = None,
) -> Document:
    doc = Document(
        id=uuid.uuid4(),
        application_id=application_id,
        document_type=document_type,
        file_name=file_name,
        file_path=file_path,
        mime_type=mime_type,
        file_size_bytes=file_size_bytes,
        upload_status="uploaded",
    )
    db.add(doc)
    db.flush()
    return doc


def store_document_extraction(
    db: Session,
    document_id: uuid.UUID,
    extracted_fields: Dict[str, Any],
    extraction_status: str,
    document_type: Optional[str] = None,
    errors: Optional[List[str]] = None,
    ocr_confidence: Optional[float] = None,
) -> DocumentExtraction:
    extraction = DocumentExtraction(
        id=uuid.uuid4(),
        document_id=document_id,
        document_type=document_type,
        extracted_fields=extracted_fields,
        extraction_status=extraction_status,
        errors=errors or [],
        ocr_confidence=ocr_confidence,
    )
    db.add(extraction)
    
    # Update document upload status
    doc = db.get(Document, document_id)
    if doc:
        doc.upload_status = "processed" if extraction_status == "success" else "processing"
    
    db.flush()
    return extraction


def record_verification_result(
    db: Session,
    application_id: uuid.UUID,
    check_type: str,
    check_name: str,
    result: str,
    message: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
) -> VerificationResult:
    vr = VerificationResult(
        id=uuid.uuid4(),
        application_id=application_id,
        check_type=check_type,
        check_name=check_name,
        result=result,
        message=message,
        details=details,
    )
    db.add(vr)
    db.flush()
    return vr


def create_deficiency(
    db: Session,
    application_id: uuid.UUID,
    deficiency_type: str,
    description: str,
    document_id: Optional[uuid.UUID] = None,
    field_name: Optional[str] = None,
    expected_value: Optional[str] = None,
    actual_value: Optional[str] = None,
    severity: str = "warning",
) -> Deficiency:
    deficiency = Deficiency(
        id=uuid.uuid4(),
        application_id=application_id,
        document_id=document_id,
        deficiency_type=deficiency_type,
        field_name=field_name,
        expected_value=expected_value,
        actual_value=actual_value,
        description=description,
        severity=severity,
        is_resolved=False,
    )
    db.add(deficiency)
    db.flush()
    return deficiency


def record_admin_review(
    db: Session,
    application_id: uuid.UUID,
    reviewer_id: uuid.UUID,
    decision: str,
    comments: Optional[str] = None,
    checklist: Optional[Dict[str, Any]] = None,
) -> AdminReview:
    review = AdminReview(
        id=uuid.uuid4(),
        application_id=application_id,
        reviewer_id=reviewer_id,
        decision=decision,
        comments=comments,
        checklist=checklist,
    )
    db.add(review)
    db.flush()
    return review


def create_notification(
    db: Session,
    user_id: uuid.UUID,
    notification_type: str,
    title: str,
    message: str,
    application_id: Optional[uuid.UUID] = None,
) -> Notification:
    notif = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        application_id=application_id,
        notification_type=notification_type,
        title=title,
        message=message,
        is_read=False,
    )
    db.add(notif)
    db.flush()
    return notif
