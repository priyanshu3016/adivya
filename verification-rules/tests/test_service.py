"""
End-to-end integration tests for service.py against database session.
Tests run_verification persistence of results, deficiencies, and application status.
"""
import uuid
from decimal import Decimal
import pytest
from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session, sessionmaker

from app.db import crud
from app.db.models import (
    Applicant,
    Application,
    Base,
    Deficiency,
    Document,
    DocumentExtraction,
    Notification,
    Scheme,
    SchemeRule,
    User,
    VerificationResult,
)
from service import run_verification


@pytest.fixture(scope="function")
def db_session():
    """Provides a fresh isolated in-memory database session."""
    test_engine = create_engine("sqlite:///:memory:", echo=False, future=True)

    @event.listens_for(test_engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    Base.metadata.create_all(bind=test_engine)
    TestingSession = sessionmaker(bind=test_engine, autocommit=False, autoflush=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


def _setup_scheme_and_rules(db: Session) -> Scheme:
    """Helper to create Post-Matric ST Scheme with 3 standard rules."""
    scheme = Scheme(
        id=uuid.uuid4(),
        name="Post-Matric Scholarship for ST Students",
        description="State scholarship scheme for Scheduled Tribe students pursuing higher education.",
        scheme_type="scholarship",
        max_income_limit=Decimal("250000.00"),
        required_category="ST",
        min_education_level="undergraduate",
        required_document_types=[
            "income_certificate",
            "caste_certificate",
            "marksheet",
            "admission_letter",
            "identity_document",
        ],
        award_amount=Decimal("50000.00"),
        is_active=True,
    )
    db.add(scheme)
    db.flush()

    rules = [
        SchemeRule(
            id=uuid.uuid4(),
            scheme_id=scheme.id,
            rule_field="category",
            rule_operator="eq",
            rule_value="ST",
            error_message="Applicant must belong to Scheduled Tribe (ST) category",
            priority=1,
            is_active=True,
        ),
        SchemeRule(
            id=uuid.uuid4(),
            scheme_id=scheme.id,
            rule_field="annual_family_income",
            rule_operator="le",
            rule_value="250000",
            error_message="Annual family income must not exceed ₹2,50,000",
            priority=2,
            is_active=True,
        ),
        SchemeRule(
            id=uuid.uuid4(),
            scheme_id=scheme.id,
            rule_field="current_education_level",
            rule_operator="in",
            rule_value="undergraduate,postgraduate",
            error_message="Education level must be undergraduate or postgraduate",
            priority=3,
            is_active=True,
        ),
    ]
    for r in rules:
        db.add(r)
    db.flush()
    return scheme


def _create_applicant_with_app(
    db: Session,
    scheme: Scheme,
    full_name: str,
    category: str,
    income: float,
    status: str = "submitted",
) -> Application:
    """Helper to create User, Applicant, and Application."""
    user = User(
        id=uuid.uuid4(),
        email=f"{full_name.lower().replace(' ', '')}@example.com",
        password_hash="test_hash",
        full_name=full_name,
        role="applicant",
        is_active=True,
    )
    db.add(user)
    db.flush()

    applicant = Applicant(
        id=uuid.uuid4(),
        user_id=user.id,
        full_name=full_name,
        category=category,
        tribe_name="Santhal" if category == "ST" else None,
        annual_family_income=Decimal(str(income)),
        current_education_level="undergraduate",
        institution_name="Ranchi University",
        course_name="B.Sc. Computer Science",
    )
    db.add(applicant)
    db.flush()

    app = Application(
        id=uuid.uuid4(),
        applicant_id=applicant.id,
        scheme_id=scheme.id,
        status=status,
    )
    db.add(app)
    db.flush()
    return app


def _add_document_with_extraction(
    db: Session,
    app_id: uuid.UUID,
    doc_type: str,
    fields: dict,
    status: str = "success",
) -> Document:
    """Helper to add Document and DocumentExtraction."""
    doc = Document(
        id=uuid.uuid4(),
        application_id=app_id,
        document_type=doc_type,
        file_name=f"{doc_type}.pdf",
        file_path=f"uploads/{doc_type}.pdf",
        upload_status="processed",
    )
    db.add(doc)
    db.flush()

    ext = DocumentExtraction(
        id=uuid.uuid4(),
        document_id=doc.id,
        document_type=doc_type,
        extracted_fields=fields,
        extraction_status=status,
        errors=[],
        ocr_confidence=0.95,
    )
    db.add(ext)
    db.flush()
    return doc


def test_service_run_verification_on_valid_application(db_session: Session):
    """Test running verification on a fully valid application (Sunita scenario)."""
    scheme = _setup_scheme_and_rules(db_session)
    app = _create_applicant_with_app(db_session, scheme, "Sunita Soren", "ST", 120000.0)

    # Add all 5 docs
    _add_document_with_extraction(
        db_session, app.id, "income_certificate",
        {"name": "Sunita Soren", "annual_income": 120000, "certificate_number": "INC/01", "issue_date": "2025-06-10"},
    )
    _add_document_with_extraction(
        db_session, app.id, "caste_certificate",
        {"name": "Sunita Soren", "certificate_number": "CST/01", "category": "ST", "issue_date": "2023-01-15"},
    )
    _add_document_with_extraction(
        db_session, app.id, "marksheet",
        {"name": "Sunita Soren", "percentage": 82.4},
    )
    _add_document_with_extraction(
        db_session, app.id, "admission_letter",
        {"name": "Sunita Soren", "institution": "Ranchi University"},
    )
    _add_document_with_extraction(
        db_session, app.id, "identity_document",
        {"name": "Sunita Soren", "id_type": "aadhaar", "id_number": "987654321098"},
    )

    report = run_verification(db_session, app.id)

    assert report.overall_status == "verified"
    assert report.requires_manual_review is False
    assert len(report.deficiencies) == 0

    # Verify DB persistence
    db_session.refresh(app)
    assert app.status == "verified"

    # Check verification results recorded in DB
    vrs = db_session.execute(
        select(VerificationResult).where(VerificationResult.application_id == app.id)
    ).scalars().all()
    assert len(vrs) > 0

    # Check notification recorded
    notifs = db_session.execute(
        select(Notification).where(Notification.application_id == app.id)
    ).scalars().all()
    assert len(notifs) == 1
    assert "verified" in notifs[0].title.lower()


def test_service_run_verification_on_missing_document(db_session: Session):
    """Test running verification on application missing admission_letter (Rahul scenario)."""
    scheme = _setup_scheme_and_rules(db_session)
    app = _create_applicant_with_app(db_session, scheme, "Rahul Munda", "ST", 95000.0)

    # Upload only 4 documents (missing admission_letter)
    _add_document_with_extraction(
        db_session, app.id, "income_certificate",
        {"name": "Rahul Munda", "annual_income": 95000, "certificate_number": "INC/02", "issue_date": "2025-05-18"},
    )
    _add_document_with_extraction(
        db_session, app.id, "caste_certificate",
        {"name": "Rahul Munda", "certificate_number": "CST/02", "category": "ST", "issue_date": "2022-08-20"},
    )
    _add_document_with_extraction(
        db_session, app.id, "marksheet",
        {"name": "Rahul Munda", "percentage": 76.8},
    )
    _add_document_with_extraction(
        db_session, app.id, "identity_document",
        {"name": "Rahul Munda", "id_type": "aadhaar", "id_number": "876543210987"},
    )

    report = run_verification(db_session, app.id)

    assert report.overall_status == "deficient"
    db_session.refresh(app)
    assert app.status == "deficient"

    defs = db_session.execute(
        select(Deficiency).where(Deficiency.application_id == app.id)
    ).scalars().all()
    assert any(d.deficiency_type == "missing_document" for d in defs)


def test_service_run_verification_on_ineligible_applicant(db_session: Session):
    """Test running verification on applicant with invalid category (Amit scenario)."""
    scheme = _setup_scheme_and_rules(db_session)
    app = _create_applicant_with_app(db_session, scheme, "Amit Verma", "OBC", 200000.0)

    # Upload all 5 documents
    _add_document_with_extraction(
        db_session, app.id, "income_certificate",
        {"name": "Amit Verma", "annual_income": 200000, "certificate_number": "INC/03", "issue_date": "2025-06-01"},
    )
    _add_document_with_extraction(
        db_session, app.id, "caste_certificate",
        {"name": "Amit Verma", "certificate_number": "CST/03", "category": "OBC", "issue_date": "2024-03-10"},
    )
    _add_document_with_extraction(
        db_session, app.id, "marksheet",
        {"name": "Amit Verma", "percentage": 74.0},
    )
    _add_document_with_extraction(
        db_session, app.id, "admission_letter",
        {"name": "Amit Verma", "institution": "Ranchi University"},
    )
    _add_document_with_extraction(
        db_session, app.id, "identity_document",
        {"name": "Amit Verma", "id_type": "aadhaar", "id_number": "543210987654"},
    )

    report = run_verification(db_session, app.id)

    assert report.overall_status == "rejected"
    db_session.refresh(app)
    assert app.status == "rejected"


def test_service_run_verification_nonexistent_application_raises(db_session: Session):
    """Test that nonexistent application ID raises ValueError."""
    with pytest.raises(ValueError, match="does not exist"):
        run_verification(db_session, uuid.uuid4())
