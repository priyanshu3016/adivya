"""Comprehensive Test Suite for TribalScholar AI Database Layer.

Validates:
- All 12 SQLAlchemy ORM models and table schemas
- Column constraints (CHECK, UNIQUE, NOT NULL, FOREIGN KEY, CASCADE)
- CRUD operations across all tables
- Idempotent seeding of 5 demo scenarios
- Scenario correctness (Approval, Missing doc, Income mismatch, Name mismatch, Rejection)
"""

import os
import sys
import uuid
from decimal import Decimal
import pytest
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.models import (
    Base,
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
from app.db.seed import seed_database
from app.db import crud


@pytest.fixture(scope="function")
def db_session():
    """Provides a fresh isolated in-memory database session for each test."""
    test_engine = create_engine(
        "sqlite:///:memory:",
        echo=False,
        future=True,
    )
    # Enable SQLite foreign key constraint enforcement
    from sqlalchemy import event
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


# =============================================================================
# 1. Infrastructure Tests
# =============================================================================

def test_all_12_tables_created(db_session: Session):
    """Check that all 12 tables are created and registered in metadata."""
    expected_tables = {
        "users",
        "applicants",
        "schemes",
        "scheme_rules",
        "applications",
        "documents",
        "document_extractions",
        "verification_results",
        "deficiencies",
        "application_status_history",
        "admin_reviews",
        "notifications",
    }
    registered_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(registered_tables)
    assert len(expected_tables) == 12


def test_uuid_primary_keys(db_session: Session):
    """Ensure UUID primary keys are generated and valid."""
    user = crud.create_user(
        db_session,
        email="test_uuid@tribalscholar.demo",
        password_hash="hashed_pw",
        full_name="UUID Test",
    )
    assert isinstance(user.id, uuid.UUID)


# =============================================================================
# 2. Constraint Tests
# =============================================================================

def test_duplicate_email_rejected(db_session: Session):
    """Ensure duplicate email raises IntegrityError."""
    crud.create_user(db_session, email="dup@test.com", password_hash="h1", full_name="User 1")
    db_session.commit()

    with pytest.raises(IntegrityError):
        crud.create_user(db_session, email="dup@test.com", password_hash="h2", full_name="User 2")
        db_session.commit()
    db_session.rollback()


def test_invalid_user_role_rejected(db_session: Session):
    """Ensure check_user_role rejects non-permitted roles."""
    with pytest.raises(IntegrityError):
        crud.create_user(db_session, email="badrole@test.com", password_hash="h", full_name="Bad Role", role="hacker")
        db_session.commit()
    db_session.rollback()


def test_invalid_application_status_rejected(db_session: Session):
    """Ensure check_application_status rejects non-canonical status values."""
    user = crud.create_user(db_session, email="status@test.com", password_hash="h", full_name="Status Test")
    applicant = crud.create_applicant_profile(db_session, user_id=user.id, full_name="Status Test")
    scheme = crud.create_scheme(db_session, name="Status Scheme")
    db_session.commit()

    with pytest.raises(IntegrityError):
        bad_app = Application(
            applicant_id=applicant.id,
            scheme_id=scheme.id,
            status="invalid_status_xyz",
        )
        db_session.add(bad_app)
        db_session.commit()
    db_session.rollback()


def test_foreign_key_enforcement(db_session: Session):
    """Ensure inserting an application with non-existent applicant raises IntegrityError."""
    scheme = crud.create_scheme(db_session, name="FK Scheme")
    db_session.commit()

    with pytest.raises(IntegrityError):
        fake_id = uuid.uuid4()
        bad_app = Application(
            applicant_id=fake_id,
            scheme_id=scheme.id,
            status="draft",
        )
        db_session.add(bad_app)
        db_session.commit()
    db_session.rollback()


def test_foreign_key_cascade_delete(db_session: Session):
    """Ensure deleting a User cascades to delete Applicant profile."""
    user = crud.create_user(db_session, email="cascade@test.com", password_hash="h", full_name="Cascade User")
    applicant = crud.create_applicant_profile(db_session, user_id=user.id, full_name="Cascade Applicant")
    db_session.commit()

    applicant_id = applicant.id
    db_session.delete(user)
    db_session.commit()

    deleted_applicant = db_session.get(Applicant, applicant_id)
    assert deleted_applicant is None


def test_negative_income_rejected(db_session: Session):
    """Ensure negative annual income constraint triggers error."""
    user = crud.create_user(db_session, email="neg_inc@test.com", password_hash="h", full_name="Income Test")
    db_session.commit()

    with pytest.raises(IntegrityError):
        crud.create_applicant_profile(
            db_session,
            user_id=user.id,
            full_name="Negative Income",
            annual_family_income=-5000.0,
        )
        db_session.commit()
    db_session.rollback()


def test_invalid_extraction_status_rejected(db_session: Session):
    """Ensure invalid extraction status triggers check constraint."""
    user = crud.create_user(db_session, email="ext_test@test.com", password_hash="h", full_name="Ext Test")
    applicant = crud.create_applicant_profile(db_session, user_id=user.id, full_name="Ext Applicant")
    scheme = crud.create_scheme(db_session, name="Ext Scheme")
    app = crud.create_application(db_session, applicant_id=applicant.id, scheme_id=scheme.id)
    doc = crud.create_document(
        db_session,
        application_id=app.id,
        document_type="income_certificate",
        file_name="inc.pdf",
        file_path="uploads/inc.pdf",
    )
    db_session.commit()

    with pytest.raises(IntegrityError):
        crud.store_document_extraction(
            db_session,
            document_id=doc.id,
            extracted_fields={},
            extraction_status="bogus_status",
        )
        db_session.commit()
    db_session.rollback()


# =============================================================================
# 3. CRUD Tests
# =============================================================================

def test_full_crud_workflow(db_session: Session):
    """Test creating and reading data across all key tables."""
    # 1. User & Applicant
    user = crud.create_user(db_session, "workflow@test.com", "hash", "Workflow User")
    applicant = crud.create_applicant_profile(
        db_session,
        user_id=user.id,
        full_name="Workflow User",
        tribe_name="Munda",
        annual_family_income=120000.0,
    )
    # 2. Scheme & Rule
    scheme = crud.create_scheme(db_session, "Merit Scheme", max_income_limit=250000.0)
    rule = SchemeRule(
        id=uuid.uuid4(),
        scheme_id=scheme.id,
        rule_field="category",
        rule_operator="eq",
        rule_value="ST",
        error_message="ST category required",
    )
    db_session.add(rule)

    # 3. Application
    app = crud.create_application(db_session, applicant_id=applicant.id, scheme_id=scheme.id)
    assert app.status == "draft"

    # 4. Document & Extraction
    doc = crud.create_document(
        db_session,
        application_id=app.id,
        document_type="income_certificate",
        file_name="test.pdf",
        file_path="/path/test.pdf",
    )
    ext = crud.store_document_extraction(
        db_session,
        document_id=doc.id,
        extracted_fields={"annual_income": 120000},
        extraction_status="success",
        ocr_confidence=0.98,
    )
    assert ext.extracted_fields["annual_income"] == 120000

    # 5. Verification Result & Deficiency
    vr = crud.record_verification_result(
        db_session,
        application_id=app.id,
        check_type="eligibility",
        check_name="income_check",
        result="pass",
    )
    deficiency = crud.create_deficiency(
        db_session,
        application_id=app.id,
        deficiency_type="data_mismatch",
        description="Minor info discrepancy",
        severity="info",
    )

    # 6. Status History
    crud.update_application_status(db_session, app.id, "under_review", reason="OCR Completed")
    assert app.status == "under_review"

    # 7. Admin Review
    admin = crud.create_user(db_session, "admin_test@test.com", "hash", "Officer", role="admin")
    review = crud.record_admin_review(
        db_session,
        application_id=app.id,
        reviewer_id=admin.id,
        decision="approve",
        comments="Approved successfully",
    )

    # 8. Notification
    notif = crud.create_notification(
        db_session,
        user_id=user.id,
        application_id=app.id,
        notification_type="review",
        title="Application Approved",
        message="Your application was approved.",
    )
    assert notif.is_read is False

    db_session.commit()

    # Verify queryability
    queried_user = crud.get_user_by_email(db_session, "workflow@test.com")
    assert queried_user is not None
    assert queried_user.applicant.tribe_name == "Munda"
    assert len(queried_user.applicant.applications) == 1
    assert len(queried_user.applicant.applications[0].documents) == 1
    assert queried_user.applicant.applications[0].documents[0].extraction.ocr_confidence == 0.98


# =============================================================================
# 4. Seed Data & Idempotency Tests
# =============================================================================

def test_seed_database_loads_and_is_idempotent(db_session: Session):
    """Verify seed_database populates all 5 scenarios and can be run multiple times safely."""
    # First run
    seed_database(db_session)

    # Validate counts
    users_count = db_session.execute(select(func.count(User.id))).scalar()
    admin_count = db_session.execute(select(func.count(User.id)).where(User.role == "admin")).scalar()
    applicants_count = db_session.execute(select(func.count(User.id)).where(User.role == "applicant")).scalar()
    schemes_count = db_session.execute(select(func.count(Scheme.id))).scalar()
    rules_count = db_session.execute(select(func.count(SchemeRule.id))).scalar()
    apps_count = db_session.execute(select(func.count(Application.id))).scalar()

    assert users_count == 6  # 1 admin + 5 applicants
    assert admin_count == 1
    assert applicants_count == 5
    assert schemes_count == 1
    assert rules_count == 3
    assert apps_count == 5

    # Second run to test idempotency (must not raise duplicate key or error)
    seed_database(db_session)

    assert db_session.execute(select(func.count(User.id))).scalar() == 6
    assert db_session.execute(select(func.count(Application.id))).scalar() == 5


# =============================================================================
# 5. Scenario Correctness Tests (Section 8 Verification)
# =============================================================================

def test_scenario_1_valid_approval(db_session: Session):
    """Scenario 1: Sunita Soren should be approved with zero deficiencies."""
    seed_database(db_session)

    user = crud.get_user_by_email(db_session, "sunita.soren@tribalscholar.demo")
    assert user is not None
    applicant = user.applicant
    assert applicant.category == "ST"
    assert applicant.tribe_name == "Santal"
    assert applicant.annual_family_income == Decimal("120000.00")

    app = applicant.applications[0]
    assert app.status == "approved"
    assert len(app.deficiencies) == 0
    assert len(app.documents) == 5
    assert app.admin_reviews[0].decision == "approve"


def test_scenario_2_missing_document(db_session: Session):
    """Scenario 2: Rahul Munda should be deficient due to missing admission letter."""
    seed_database(db_session)

    user = crud.get_user_by_email(db_session, "rahul.munda@tribalscholar.demo")
    assert user is not None
    app = user.applicant.applications[0]

    assert app.status == "deficient"
    doc_types = [d.document_type for d in app.documents]
    assert "admission_letter" not in doc_types
    assert len(doc_types) == 4

    missing_def = [d for d in app.deficiencies if d.deficiency_type == "missing_document"]
    assert len(missing_def) == 1
    assert missing_def[0].field_name == "admission_letter"
    assert missing_def[0].severity == "critical"


def test_scenario_3_income_mismatch(db_session: Session):
    """Scenario 3: Priya Lakra should be deficient due to income mismatch between form and OCR."""
    seed_database(db_session)

    user = crud.get_user_by_email(db_session, "priya.lakra@tribalscholar.demo")
    assert user is not None
    applicant = user.applicant
    app = applicant.applications[0]

    assert app.status == "deficient"
    assert applicant.annual_family_income == Decimal("180000.00")  # Form

    # Check extracted certificate income
    inc_doc = [d for d in app.documents if d.document_type == "income_certificate"][0]
    assert inc_doc.extraction.extracted_fields["annual_income"] == 340000  # Certificate

    # Check deficiency
    mismatch_def = [d for d in app.deficiencies if d.deficiency_type == "data_mismatch"][0]
    assert mismatch_def.expected_value == "180000"
    assert mismatch_def.actual_value == "340000"
    assert mismatch_def.severity == "critical"


def test_scenario_4_name_mismatch(db_session: Session):
    """Scenario 4: Deepak Kumar Tirkey has a name variation warning for officer verification."""
    seed_database(db_session)

    user = crud.get_user_by_email(db_session, "deepak.tirkey@tribalscholar.demo")
    assert user is not None
    applicant = user.applicant
    app = applicant.applications[0]

    assert app.status == "deficient"
    name_def = [d for d in app.deficiencies if d.deficiency_type == "name_mismatch"][0]
    assert name_def.expected_value == "Deepak Kumar Tirkey"
    assert name_def.actual_value == "Dipak K. Tirkey"
    assert name_def.severity == "warning"


def test_scenario_5_ineligible_applicant(db_session: Session):
    """Scenario 5: Amit Verma is OBC and should be deterministically rejected."""
    seed_database(db_session)

    user = crud.get_user_by_email(db_session, "amit.verma@tribalscholar.demo")
    assert user is not None
    applicant = user.applicant
    app = applicant.applications[0]

    assert applicant.category == "OBC"
    assert app.status == "rejected"
    assert app.admin_reviews[0].decision == "reject"
    cat_vr = [v for v in app.verification_results if v.check_name == "category_eligibility_rule"][0]
    assert cat_vr.result == "fail"
