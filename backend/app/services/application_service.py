"""Asynchronous application, scheme, document, and review service layer.

Provides AsyncSession-native database operations that mirror and extend
Person 4's synchronous CRUD operations without modifying existing files.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import select, update, desc
from sqlalchemy.orm import selectinload
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
# User & Applicant Services
# =============================================================================

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Retrieve a user by unique email address."""
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_applicant_by_user_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[Applicant]:
    """Retrieve applicant profile associated with a user ID."""
    stmt = select(Applicant).where(Applicant.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_applicant(db: AsyncSession, applicant_id: uuid.UUID) -> Optional[Applicant]:
    """Retrieve applicant profile by primary key."""
    return await db.get(Applicant, applicant_id)


# =============================================================================
# Scheme Services
# =============================================================================

async def list_schemes(db: AsyncSession, active_only: bool = True) -> List[Scheme]:
    """Retrieve all available schemes, optionally filtering for active schemes only."""
    stmt = select(Scheme)
    if active_only:
        stmt = stmt.where(Scheme.is_active == True)  # noqa: E712
    stmt = stmt.order_by(Scheme.name.asc())
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_scheme(db: AsyncSession, scheme_id: uuid.UUID) -> Optional[Scheme]:
    """Retrieve a scheme by ID along with its associated rules."""
    stmt = (
        select(Scheme)
        .where(Scheme.id == scheme_id)
        .options(selectinload(Scheme.rules))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


# =============================================================================
# Application Services
# =============================================================================

async def create_application(
    db: AsyncSession,
    applicant_id: uuid.UUID,
    scheme_id: uuid.UUID,
    academic_year: Optional[str] = None,
    snapshot: Optional[Dict[str, Any]] = None,
) -> Application:
    """Create a new draft application and record initial status history."""
    application = Application(
        id=uuid.uuid4(),
        applicant_id=applicant_id,
        scheme_id=scheme_id,
        status="draft",
        academic_year=academic_year or "2026-2027",
        applicant_snapshot=snapshot,
    )
    db.add(application)
    await db.flush()

    history = ApplicationStatusHistory(
        id=uuid.uuid4(),
        application_id=application.id,
        old_status=None,
        new_status="draft",
        reason="Initial application draft created",
    )
    db.add(history)
    await db.flush()
    return application


async def get_application(
    db: AsyncSession,
    application_id: uuid.UUID,
    eager_load: bool = True,
) -> Optional[Application]:
    """Retrieve an application by ID with full relationship data."""
    if not eager_load:
        return await db.get(Application, application_id)

    stmt = (
        select(Application)
        .where(Application.id == application_id)
        .options(
            selectinload(Application.documents).selectinload(Document.extraction),
            selectinload(Application.deficiencies),
            selectinload(Application.verification_results),
            selectinload(Application.status_history),
            selectinload(Application.applicant),
            selectinload(Application.scheme),
        )
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def list_applications_by_applicant(
    db: AsyncSession,
    applicant_id: uuid.UUID,
) -> List[Application]:
    """List all applications submitted by an applicant."""
    stmt = (
        select(Application)
        .where(Application.applicant_id == applicant_id)
        .order_by(desc(Application.created_at))
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def update_application_status(
    db: AsyncSession,
    application_id: uuid.UUID,
    new_status: str,
    changed_by_user_id: Optional[uuid.UUID] = None,
    reason: Optional[str] = None,
) -> Optional[Application]:
    """Update application status and append an audit record to status history."""
    app = await db.get(Application, application_id)
    if not app:
        return None

    old_status = app.status
    app.status = new_status
    if new_status == "submitted" and not app.submitted_at:
        app.submitted_at = datetime.now(timezone.utc)

    history = ApplicationStatusHistory(
        id=uuid.uuid4(),
        application_id=application_id,
        old_status=old_status,
        new_status=new_status,
        changed_by_user_id=changed_by_user_id,
        reason=reason,
    )
    db.add(history)
    await db.flush()
    return app


# =============================================================================
# Document & Extraction Services
# =============================================================================

async def create_document_record(
    db: AsyncSession,
    application_id: uuid.UUID,
    document_type: str,
    file_name: str,
    file_path: str,
    mime_type: Optional[str] = None,
    file_size_bytes: Optional[int] = None,
) -> Document:
    """Record an uploaded document entity."""
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
    await db.flush()
    return doc


async def list_application_documents(
    db: AsyncSession,
    application_id: uuid.UUID,
) -> List[Document]:
    """List all documents uploaded for an application with extractions loaded."""
    stmt = (
        select(Document)
        .where(Document.application_id == application_id)
        .options(selectinload(Document.extraction))
        .order_by(Document.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def store_extraction(
    db: AsyncSession,
    document_id: uuid.UUID,
    extracted_fields: Dict[str, Any],
    extraction_status: str,
    document_type: Optional[str] = None,
    errors: Optional[List[str]] = None,
    ocr_confidence: Optional[float] = None,
) -> DocumentExtraction:
    """Store Document AI extraction results and update parent document status."""
    # Check if existing extraction exists (1-to-1)
    stmt = select(DocumentExtraction).where(DocumentExtraction.document_id == document_id)
    existing_result = await db.execute(stmt)
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.document_type = document_type
        existing.extracted_fields = extracted_fields
        existing.extraction_status = extraction_status
        existing.errors = errors or []
        existing.ocr_confidence = ocr_confidence
        extraction = existing
    else:
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

    doc = await db.get(Document, document_id)
    if doc:
        doc.upload_status = "processed" if extraction_status == "success" else "processing"

    await db.flush()
    return extraction


# =============================================================================
# Admin & Review Services
# =============================================================================

async def list_applications_for_admin(
    db: AsyncSession,
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Application]:
    """List applications for administrator view with optional status filtering and pagination."""
    stmt = select(Application)
    if status_filter:
        stmt = stmt.where(Application.status == status_filter)
    stmt = stmt.order_by(desc(Application.created_at)).limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def create_admin_review(
    db: AsyncSession,
    application_id: uuid.UUID,
    reviewer_id: uuid.UUID,
    decision: str,
    comments: Optional[str] = None,
    checklist: Optional[Dict[str, Any]] = None,
) -> AdminReview:
    """Record an administrator review decision."""
    review = AdminReview(
        id=uuid.uuid4(),
        application_id=application_id,
        reviewer_id=reviewer_id,
        decision=decision,
        comments=comments,
        checklist=checklist,
    )
    db.add(review)
    await db.flush()
    return review


async def create_notification(
    db: AsyncSession,
    user_id: uuid.UUID,
    notification_type: str,
    title: str,
    message: str,
    application_id: Optional[uuid.UUID] = None,
) -> Notification:
    """Create a user notification."""
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
    await db.flush()
    return notif
