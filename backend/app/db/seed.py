"""Synthetic Seed Data Script for TribalScholar AI.

Loads 5 canonical SIH demo scenarios into the database:
1. Valid Applicant (Full Approval) - Sunita Soren
2. Missing Document (Deficient) - Rahul Munda
3. Income Mismatch (Deficient) - Priya Lakra
4. Name Mismatch / Warning (Deficient) - Deepak Kumar Tirkey
5. Ineligible Applicant (Rejected) - Amit Verma
Plus 1 Admin User ("Dr. Anita Sharma") and 1 Scheme with 3 Rules.
"""

import sys
import os
import uuid
from datetime import datetime, date, timezone
from decimal import Decimal

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from sqlalchemy.orm import Session
from app.db.session import sync_engine, SyncSessionLocal
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


def seed_database(session: Session) -> None:
    """Populates the database with fixed-UUID demo scenarios idempotently."""

    def upsert(instance, model_cls, pk_val):
        existing = session.get(model_cls, pk_val)
        if existing is None:
            session.add(instance)
            return instance
        return existing

    print("Seeding TribalScholar AI database...")

    # =========================================================================
    # 1. Admin User
    # =========================================================================
    admin_id = uuid.UUID("a0000000-0000-0000-0000-000000000001")
    admin_user = User(
        id=admin_id,
        email="admin@tribalscholar.demo",
        password_hash="$2b$12$e8Y6bM8qV4YwZtH3kU9M.e2c34kdfj028j4fklsjdflksjdf",
        full_name="Dr. Anita Sharma",
        role="admin",
        is_active=True,
    )
    upsert(admin_user, User, admin_id)

    # =========================================================================
    # 2. Scheme & Rules
    # =========================================================================
    scheme_id = uuid.UUID("00000000-0000-0000-0001-000000000001")
    scheme = Scheme(
        id=scheme_id,
        name="Post-Matric Scholarship for ST Students",
        description="Comprehensive financial support scheme for Scheduled Tribe students in higher education.",
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
        application_deadline=date(2026, 12, 31),
        award_amount=Decimal("50000.00"),
        is_active=True,
    )
    upsert(scheme, Scheme, scheme_id)

    rules_data = [
        (
            uuid.UUID("00000000-0000-0000-0002-000000000001"),
            "category",
            "eq",
            "ST",
            "Applicant must belong to Scheduled Tribe category",
            1,
        ),
        (
            uuid.UUID("00000000-0000-0000-0002-000000000002"),
            "annual_family_income",
            "le",
            "250000",
            "Annual family income must not exceed ₹2,50,000",
            2,
        ),
        (
            uuid.UUID("00000000-0000-0000-0002-000000000003"),
            "current_education_level",
            "in",
            "undergraduate,postgraduate",
            "Applicant must be pursuing higher education",
            3,
        ),
    ]
    for r_id, field, op, val, msg, prio in rules_data:
        rule = SchemeRule(
            id=r_id,
            scheme_id=scheme_id,
            rule_field=field,
            rule_operator=op,
            rule_value=val,
            error_message=msg,
            priority=prio,
            is_active=True,
        )
        upsert(rule, SchemeRule, r_id)

    # =========================================================================
    # Scenario 1 — Valid Applicant (Full Approval)
    # =========================================================================
    u1_id = uuid.UUID("00000000-0000-0000-0003-000000000001")
    ap1_id = uuid.UUID("00000000-0000-0000-0004-000000000001")
    app1_id = uuid.UUID("00000000-0000-0000-0005-000000000001")

    upsert(
        User(
            id=u1_id,
            email="sunita.soren@tribalscholar.demo",
            password_hash="$2b$12$e8Y6bM8qV4YwZtH3kU9M.e2c34kdfj028j4fklsjdflksjdf",
            full_name="Sunita Soren",
            role="applicant",
            is_active=True,
        ),
        User,
        u1_id,
    )
    upsert(
        Applicant(
            id=ap1_id,
            user_id=u1_id,
            full_name="Sunita Soren",
            date_of_birth=date(2003, 5, 14),
            gender="female",
            category="ST",
            tribe_name="Santal",
            state="Jharkhand",
            district="Ranchi",
            address="Village Kanke, PO Kanke, Ranchi, Jharkhand",
            phone="9876543210",
            aadhaar_number_hash="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            annual_family_income=Decimal("120000.00"),
            current_education_level="undergraduate",
            institution_name="Ranchi University",
            course_name="B.Tech Computer Science",
        ),
        Applicant,
        ap1_id,
    )
    upsert(
        Application(
            id=app1_id,
            applicant_id=ap1_id,
            scheme_id=scheme_id,
            status="approved",
            academic_year="2025-2026",
            applicant_snapshot={
                "name": "Sunita Soren",
                "category": "ST",
                "tribe": "Santal",
                "income": 120000,
                "education": "undergraduate",
            },
            remarks="Verified all criteria and approved.",
            submitted_at=datetime(2026, 8, 1, 10, 0, 0, tzinfo=timezone.utc),
        ),
        Application,
        app1_id,
    )

    # Documents for Scenario 1
    docs_s1 = [
        (
            uuid.UUID("00000000-0000-0001-0001-000000000001"),
            "income_certificate",
            "income_cert_sunita.pdf",
            {
                "name": "Sunita Soren",
                "annual_income": 120000,
                "certificate_number": "JH/INC/2025/1102",
                "issue_date": "2025-06-10",
            },
        ),
        (
            uuid.UUID("00000000-0000-0001-0001-000000000002"),
            "caste_certificate",
            "caste_cert_sunita.pdf",
            {
                "name": "Sunita Soren",
                "certificate_number": "JH/CST/2023/8892",
                "category": "ST",
                "tribe_name": "Santal",
                "issue_date": "2023-04-15",
            },
        ),
        (
            uuid.UUID("00000000-0000-0001-0001-000000000003"),
            "marksheet",
            "marksheet_sunita.pdf",
            {
                "name": "Sunita Soren",
                "institution": "Ranchi Women's College",
                "course": "Class XII",
                "marks_obtained": 440,
                "total_marks": 500,
                "percentage": 88.0,
                "academic_year": "2023-2024",
            },
        ),
        (
            uuid.UUID("00000000-0000-0001-0001-000000000004"),
            "admission_letter",
            "admission_sunita.pdf",
            {
                "name": "Sunita Soren",
                "institution": "Ranchi University",
                "course": "B.Tech Computer Science",
                "admission_date": "2024-07-20",
                "reference_number": "RU/ADM/2024/091",
            },
        ),
        (
            uuid.UUID("00000000-0000-0001-0001-000000000005"),
            "identity_document",
            "aadhaar_sunita.pdf",
            {
                "name": "Sunita Soren",
                "id_type": "aadhaar",
                "id_number": "XXXX-XXXX-9012",
                "date_of_birth": "2003-05-14",
            },
        ),
    ]

    for d_id, doc_type, f_name, extracted in docs_s1:
        doc = Document(
            id=d_id,
            application_id=app1_id,
            document_type=doc_type,
            file_name=f_name,
            file_path=f"uploads/{app1_id}/{f_name}",
            mime_type="application/pdf",
            file_size_bytes=245000,
            upload_status="processed",
        )
        upsert(doc, Document, d_id)

        ext_id = uuid.UUID("00000000-0000-0001-0002-" + str(d_id).split("-")[-1])
        ext = DocumentExtraction(
            id=ext_id,
            document_id=d_id,
            document_type=doc_type,
            extracted_fields=extracted,
            extraction_status="success",
            errors=[],
            ocr_confidence=0.96,
        )
        upsert(ext, DocumentExtraction, ext_id)

    # Verification checks for Scenario 1
    v1_id = uuid.UUID("00000000-0000-0001-0003-000000000001")
    upsert(
        VerificationResult(
            id=v1_id,
            application_id=app1_id,
            check_type="eligibility",
            check_name="category_and_income_check",
            result="pass",
            message="Income ₹1,20,000 <= ₹2,50,000 and Category is ST. All checks passed.",
            details={"income_check": "pass", "category_check": "pass"},
        ),
        VerificationResult,
        v1_id,
    )

    # Status history for Scenario 1
    sh1_id = uuid.UUID("00000000-0000-0001-0004-000000000001")
    upsert(
        ApplicationStatusHistory(
            id=sh1_id,
            application_id=app1_id,
            old_status="verified",
            new_status="approved",
            changed_by_user_id=admin_id,
            reason="All criteria met and documents authenticated.",
        ),
        ApplicationStatusHistory,
        sh1_id,
    )

    # Admin Review for Scenario 1
    rev1_id = uuid.UUID("00000000-0000-0001-0005-000000000001")
    upsert(
        AdminReview(
            id=rev1_id,
            application_id=app1_id,
            reviewer_id=admin_id,
            decision="approve",
            comments="Clean documentation, income well within limits. Approved.",
            checklist={"income_verified": True, "caste_verified": True, "admission_verified": True},
        ),
        AdminReview,
        rev1_id,
    )

    # Notification for Scenario 1
    n1_id = uuid.UUID("00000000-0000-0001-0006-000000000001")
    upsert(
        Notification(
            id=n1_id,
            user_id=u1_id,
            application_id=app1_id,
            notification_type="review",
            title="Scholarship Application Approved",
            message="Congratulations! Your application for Post-Matric Scholarship for ST Students has been approved.",
            is_read=True,
        ),
        Notification,
        n1_id,
    )

    # =========================================================================
    # Scenario 2 — Missing Document (Rahul Munda)
    # =========================================================================
    u2_id = uuid.UUID("00000000-0000-0000-0003-000000000002")
    ap2_id = uuid.UUID("00000000-0000-0000-0004-000000000002")
    app2_id = uuid.UUID("00000000-0000-0000-0005-000000000002")

    upsert(
        User(
            id=u2_id,
            email="rahul.munda@tribalscholar.demo",
            password_hash="$2b$12$e8Y6bM8qV4YwZtH3kU9M.e2c34kdfj028j4fklsjdflksjdf",
            full_name="Rahul Munda",
            role="applicant",
            is_active=True,
        ),
        User,
        u2_id,
    )
    upsert(
        Applicant(
            id=ap2_id,
            user_id=u2_id,
            full_name="Rahul Munda",
            date_of_birth=date(2004, 2, 11),
            gender="male",
            category="ST",
            tribe_name="Munda",
            state="Jharkhand",
            district="Khunti",
            phone="9876543211",
            annual_family_income=Decimal("95000.00"),
            current_education_level="undergraduate",
            institution_name="Birsa College Khunti",
            course_name="B.A. History",
        ),
        Applicant,
        ap2_id,
    )
    upsert(
        Application(
            id=app2_id,
            applicant_id=ap2_id,
            scheme_id=scheme_id,
            status="deficient",
            academic_year="2025-2026",
            remarks="Missing admission letter document.",
            submitted_at=datetime(2026, 8, 3, 11, 30, 0, tzinfo=timezone.utc),
        ),
        Application,
        app2_id,
    )

    # 4 of 5 documents uploaded (NO admission_letter)
    docs_s2 = [
        (uuid.UUID("00000000-0000-0002-0001-000000000001"), "income_certificate", "income_cert_rahul.pdf"),
        (uuid.UUID("00000000-0000-0002-0001-000000000002"), "caste_certificate", "caste_cert_rahul.pdf"),
        (uuid.UUID("00000000-0000-0002-0001-000000000003"), "marksheet", "marksheet_rahul.pdf"),
        (uuid.UUID("00000000-0000-0002-0001-000000000005"), "identity_document", "aadhaar_rahul.pdf"),
    ]
    for d_id, doc_type, f_name in docs_s2:
        doc = Document(
            id=d_id,
            application_id=app2_id,
            document_type=doc_type,
            file_name=f_name,
            file_path=f"uploads/{app2_id}/{f_name}",
            upload_status="processed",
        )
        upsert(doc, Document, d_id)

    # Verification check fails on completeness
    v2_id = uuid.UUID("00000000-0000-0002-0003-000000000001")
    upsert(
        VerificationResult(
            id=v2_id,
            application_id=app2_id,
            check_type="document",
            check_name="mandatory_documents_completeness",
            result="fail",
            message="Mandatory document 'admission_letter' is missing.",
            details={"missing": ["admission_letter"]},
        ),
        VerificationResult,
        v2_id,
    )

    # Deficiency for missing document
    def2_id = uuid.UUID("00000000-0000-0002-0007-000000000001")
    upsert(
        Deficiency(
            id=def2_id,
            application_id=app2_id,
            document_id=None,
            deficiency_type="missing_document",
            field_name="admission_letter",
            expected_value="admission_letter uploaded",
            actual_value=None,
            description="Required document admission_letter not uploaded",
            severity="critical",
            is_resolved=False,
        ),
        Deficiency,
        def2_id,
    )

    # =========================================================================
    # Scenario 3 — Income Mismatch (Priya Lakra)
    # =========================================================================
    u3_id = uuid.UUID("00000000-0000-0000-0003-000000000003")
    ap3_id = uuid.UUID("00000000-0000-0000-0004-000000000003")
    app3_id = uuid.UUID("00000000-0000-0000-0005-000000000003")

    upsert(
        User(
            id=u3_id,
            email="priya.lakra@tribalscholar.demo",
            password_hash="$2b$12$e8Y6bM8qV4YwZtH3kU9M.e2c34kdfj028j4fklsjdflksjdf",
            full_name="Priya Lakra",
            role="applicant",
            is_active=True,
        ),
        User,
        u3_id,
    )
    upsert(
        Applicant(
            id=ap3_id,
            user_id=u3_id,
            full_name="Priya Lakra",
            date_of_birth=date(2003, 9, 25),
            gender="female",
            category="ST",
            tribe_name="Oraon",
            state="Chhattisgarh",
            district="Jashpur",
            annual_family_income=Decimal("180000.00"),  # Self-reported: ₹1,80,000
            current_education_level="undergraduate",
            institution_name="Guru Ghasidas Vishwavidyalaya",
            course_name="B.Sc Forestry",
        ),
        Applicant,
        ap3_id,
    )
    upsert(
        Application(
            id=app3_id,
            applicant_id=ap3_id,
            scheme_id=scheme_id,
            status="deficient",
            academic_year="2025-2026",
            remarks="Deficiency flagged: income discrepancy between application and certificate.",
            submitted_at=datetime(2026, 8, 5, 14, 15, 0, tzinfo=timezone.utc),
        ),
        Application,
        app3_id,
    )

    # Document & extraction showing mismatch
    d3_inc_id = uuid.UUID("00000000-0000-0003-0001-000000000001")
    upsert(
        Document(
            id=d3_inc_id,
            application_id=app3_id,
            document_type="income_certificate",
            file_name="income_cert_priya.pdf",
            file_path=f"uploads/{app3_id}/income_cert_priya.pdf",
            upload_status="processed",
        ),
        Document,
        d3_inc_id,
    )
    ext3_id = uuid.UUID("00000000-0000-0003-0002-000000000001")
    upsert(
        DocumentExtraction(
            id=ext3_id,
            document_id=d3_inc_id,
            document_type="income_certificate",
            extracted_fields={
                "name": "Priya Lakra",
                "annual_income": 340000,  # Certificate says 3,40,000!
                "certificate_number": "CG/INC/2025/4412",
                "issue_date": "2025-05-18",
            },
            extraction_status="success",
            errors=[],
            ocr_confidence=0.94,
        ),
        DocumentExtraction,
        ext3_id,
    )

    v3_id = uuid.UUID("00000000-0000-0003-0003-000000000001")
    upsert(
        VerificationResult(
            id=v3_id,
            application_id=app3_id,
            check_type="cross_field",
            check_name="income_consistency_check",
            result="fail",
            message="Extracted income ₹3,40,000 exceeds scheme limit ₹2,50,000 and conflicts with declared ₹1,80,000.",
            details={"declared": 180000, "extracted": 340000, "limit": 250000},
        ),
        VerificationResult,
        v3_id,
    )

    def3_id = uuid.UUID("00000000-0000-0003-0007-000000000001")
    upsert(
        Deficiency(
            id=def3_id,
            application_id=app3_id,
            document_id=d3_inc_id,
            deficiency_type="data_mismatch",
            field_name="annual_family_income",
            expected_value="180000",
            actual_value="340000",
            description="Extracted certificate income (₹3,40,000) exceeds declared income (₹1,80,000) and scheme threshold.",
            severity="critical",
            is_resolved=False,
        ),
        Deficiency,
        def3_id,
    )

    # =========================================================================
    # Scenario 4 — Potential Name Mismatch (Deepak Kumar Tirkey)
    # =========================================================================
    u4_id = uuid.UUID("00000000-0000-0000-0003-000000000004")
    ap4_id = uuid.UUID("00000000-0000-0000-0004-000000000004")
    app4_id = uuid.UUID("00000000-0000-0000-0005-000000000004")

    upsert(
        User(
            id=u4_id,
            email="deepak.tirkey@tribalscholar.demo",
            password_hash="$2b$12$e8Y6bM8qV4YwZtH3kU9M.e2c34kdfj028j4fklsjdflksjdf",
            full_name="Deepak Kumar Tirkey",
            role="applicant",
            is_active=True,
        ),
        User,
        u4_id,
    )
    upsert(
        Applicant(
            id=ap4_id,
            user_id=u4_id,
            full_name="Deepak Kumar Tirkey",
            date_of_birth=date(2002, 11, 5),
            gender="male",
            category="ST",
            tribe_name="Kharia",
            state="Odisha",
            district="Sundargarh",
            annual_family_income=Decimal("150000.00"),
            current_education_level="undergraduate",
            institution_name="National Institute of Technology Rourkela",
            course_name="B.Tech Mechanical Engineering",
        ),
        Applicant,
        ap4_id,
    )
    upsert(
        Application(
            id=app4_id,
            applicant_id=ap4_id,
            scheme_id=scheme_id,
            status="deficient",
            academic_year="2025-2026",
            remarks="Name variation flagged for officer confirmation.",
            submitted_at=datetime(2026, 8, 7, 9, 0, 0, tzinfo=timezone.utc),
        ),
        Application,
        app4_id,
    )

    d4_cst_id = uuid.UUID("00000000-0000-0004-0001-000000000002")
    upsert(
        Document(
            id=d4_cst_id,
            application_id=app4_id,
            document_type="caste_certificate",
            file_name="caste_cert_deepak.pdf",
            file_path=f"uploads/{app4_id}/caste_cert_deepak.pdf",
            upload_status="processed",
        ),
        Document,
        d4_cst_id,
    )
    ext4_id = uuid.UUID("00000000-0000-0004-0002-000000000002")
    upsert(
        DocumentExtraction(
            id=ext4_id,
            document_id=d4_cst_id,
            document_type="caste_certificate",
            extracted_fields={
                "name": "Dipak K. Tirkey",  # Name variation
                "certificate_number": "OD/ST/2024/7711",
                "category": "ST",
                "tribe_name": "Kharia",
                "issue_date": "2024-03-12",
            },
            extraction_status="success",
            errors=[],
            ocr_confidence=0.92,
        ),
        DocumentExtraction,
        ext4_id,
    )

    v4_id = uuid.UUID("00000000-0000-0004-0003-000000000001")
    upsert(
        VerificationResult(
            id=v4_id,
            application_id=app4_id,
            check_type="cross_field",
            check_name="name_consistency_check",
            result="warning",
            message="Minor phonetic/spelling variation detected: 'Deepak Kumar Tirkey' vs 'Dipak K. Tirkey'.",
            details={"profile_name": "Deepak Kumar Tirkey", "extracted_name": "Dipak K. Tirkey", "similarity": 0.82},
        ),
        VerificationResult,
        v4_id,
    )

    def4_id = uuid.UUID("00000000-0000-0004-0007-000000000001")
    upsert(
        Deficiency(
            id=def4_id,
            application_id=app4_id,
            document_id=d4_cst_id,
            deficiency_type="name_mismatch",
            field_name="name",
            expected_value="Deepak Kumar Tirkey",
            actual_value="Dipak K. Tirkey",
            description="Name on caste certificate ('Dipak K. Tirkey') differs slightly from registered profile name.",
            severity="warning",
            is_resolved=False,
        ),
        Deficiency,
        def4_id,
    )

    # =========================================================================
    # Scenario 5 — Ineligible Applicant (Amit Verma, OBC)
    # =========================================================================
    u5_id = uuid.UUID("00000000-0000-0000-0003-000000000005")
    ap5_id = uuid.UUID("00000000-0000-0000-0004-000000000005")
    app5_id = uuid.UUID("00000000-0000-0000-0005-000000000005")

    upsert(
        User(
            id=u5_id,
            email="amit.verma@tribalscholar.demo",
            password_hash="$2b$12$e8Y6bM8qV4YwZtH3kU9M.e2c34kdfj028j4fklsjdflksjdf",
            full_name="Amit Verma",
            role="applicant",
            is_active=True,
        ),
        User,
        u5_id,
    )
    upsert(
        Applicant(
            id=ap5_id,
            user_id=u5_id,
            full_name="Amit Verma",
            date_of_birth=date(2003, 1, 19),
            gender="male",
            category="OBC",  # Ineligible for ST scheme!
            tribe_name=None,
            state="Bihar",
            district="Patna",
            annual_family_income=Decimal("200000.00"),
            current_education_level="undergraduate",
            institution_name="Patna Science College",
            course_name="B.Sc Physics",
        ),
        Applicant,
        ap5_id,
    )
    upsert(
        Application(
            id=app5_id,
            applicant_id=ap5_id,
            scheme_id=scheme_id,
            status="rejected",
            academic_year="2025-2026",
            remarks="Application rejected due to ineligibility: applicant belongs to OBC, scheme requires ST.",
            submitted_at=datetime(2026, 8, 10, 16, 45, 0, tzinfo=timezone.utc),
        ),
        Application,
        app5_id,
    )

    v5_id = uuid.UUID("00000000-0000-0005-0003-000000000001")
    upsert(
        VerificationResult(
            id=v5_id,
            application_id=app5_id,
            check_type="eligibility",
            check_name="category_eligibility_rule",
            result="fail",
            message="Applicant category 'OBC' does not meet required category 'ST'.",
            details={"required": "ST", "actual": "OBC"},
        ),
        VerificationResult,
        v5_id,
    )

    sh5_id = uuid.UUID("00000000-0000-0005-0004-000000000001")
    upsert(
        ApplicationStatusHistory(
            id=sh5_id,
            application_id=app5_id,
            old_status="under_review",
            new_status="rejected",
            changed_by_user_id=admin_id,
            reason="Ineligible category: scheme strictly for Scheduled Tribe students.",
        ),
        ApplicationStatusHistory,
        sh5_id,
    )

    rev5_id = uuid.UUID("00000000-0000-0005-0005-000000000001")
    upsert(
        AdminReview(
            id=rev5_id,
            application_id=app5_id,
            reviewer_id=admin_id,
            decision="reject",
            comments="Rejected automatically based on category non-compliance.",
            checklist={"category_valid": False},
        ),
        AdminReview,
        rev5_id,
    )

    session.commit()
    print("✓ Successfully loaded all 5 demo scenarios and administrative seed records.")


def main():
    with SyncSessionLocal() as session:
        seed_database(session)


if __name__ == "__main__":
    main()
