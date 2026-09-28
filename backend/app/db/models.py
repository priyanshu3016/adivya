import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    Float,
    Numeric,
    Date,
    DateTime,
    ForeignKey,
    CheckConstraint,
    Index,
    text,
    func,
)
from sqlalchemy.orm import declarative_base, relationship, Mapped, mapped_column
from sqlalchemy.types import Uuid, JSON
from sqlalchemy.dialects.postgresql import JSONB as PG_JSONB, ARRAY as PG_ARRAY

Base = declarative_base()

# Dialect-portable types: PostgreSQL native with SQLite fallback
JSONBType = PG_JSONB().with_variant(JSON(), "sqlite")
StringArrayType = PG_ARRAY(String).with_variant(JSON(), "sqlite")


# -----------------------------------------------------------------------------
# 1. users
# -----------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="applicant", index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint("role IN ('applicant', 'admin')", name="check_user_role"),
    )

    # Relationships
    applicant: Mapped[Optional["Applicant"]] = relationship(
        "Applicant", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    admin_reviews: Mapped[List["AdminReview"]] = relationship("AdminReview", back_populates="reviewer")
    status_changes: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory", back_populates="changed_by"
    )
    notifications: Mapped[List["Notification"]] = relationship(
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )


# -----------------------------------------------------------------------------
# 2. applicants
# -----------------------------------------------------------------------------
class Applicant(Base):
    __tablename__ = "applicants"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    category: Mapped[str] = mapped_column(String(20), nullable=False, default="ST", index=True)
    tribe_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    aadhaar_number_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    annual_family_income: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    current_education_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    institution_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    course_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint("gender IS NULL OR gender IN ('male', 'female', 'other')", name="check_applicant_gender"),
        CheckConstraint("category IN ('ST', 'SC', 'OBC', 'General')", name="check_applicant_category"),
        CheckConstraint("annual_family_income IS NULL OR annual_family_income >= 0", name="check_applicant_income_positive"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applicant")
    applications: Mapped[List["Application"]] = relationship(
        "Application", back_populates="applicant", cascade="all, delete-orphan"
    )


# -----------------------------------------------------------------------------
# 3. schemes
# -----------------------------------------------------------------------------
class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scheme_type: Mapped[str] = mapped_column(String(20), nullable=False, default="scholarship")
    max_income_limit: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    required_category: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    min_education_level: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    required_document_types: Mapped[List[str]] = mapped_column(StringArrayType, nullable=False, default=list)
    application_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    award_amount: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("scheme_type IN ('scholarship', 'fellowship')", name="check_scheme_type"),
        CheckConstraint("max_income_limit IS NULL OR max_income_limit > 0", name="check_scheme_max_income_positive"),
        CheckConstraint("award_amount IS NULL OR award_amount > 0", name="check_scheme_award_positive"),
    )

    # Relationships
    rules: Mapped[List["SchemeRule"]] = relationship(
        "SchemeRule", back_populates="scheme", cascade="all, delete-orphan"
    )
    applications: Mapped[List["Application"]] = relationship("Application", back_populates="scheme")


# -----------------------------------------------------------------------------
# 4. scheme_rules
# -----------------------------------------------------------------------------
class SchemeRule(Base):
    __tablename__ = "scheme_rules"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rule_field: Mapped[str] = mapped_column(String(100), nullable=False)
    rule_operator: Mapped[str] = mapped_column(String(20), nullable=False)
    rule_value: Mapped[str] = mapped_column(String(255), nullable=False)
    error_message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "rule_operator IN ('eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'contains')",
            name="check_rule_operator",
        ),
        Index("ix_scheme_rules_scheme_priority", "scheme_id", "priority"),
    )

    # Relationships
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="rules")


# -----------------------------------------------------------------------------
# 5. applications
# -----------------------------------------------------------------------------
class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    applicant_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applicants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("schemes.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft", index=True)
    academic_year: Mapped[Optional[str]] = mapped_column(String(9), nullable=True)
    applicant_snapshot: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONBType, nullable=True)
    remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'submitted', 'under_review', 'verified', 'deficient', 'approved', 'rejected')",
            name="check_application_status",
        ),
        Index("ix_applications_applicant_scheme", "applicant_id", "scheme_id"),
    )

    # Relationships
    applicant: Mapped["Applicant"] = relationship("Applicant", back_populates="applications")
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="applications")
    documents: Mapped[List["Document"]] = relationship(
        "Document", back_populates="application", cascade="all, delete-orphan"
    )
    verification_results: Mapped[List["VerificationResult"]] = relationship(
        "VerificationResult", back_populates="application", cascade="all, delete-orphan"
    )
    deficiencies: Mapped[List["Deficiency"]] = relationship(
        "Deficiency", back_populates="application", cascade="all, delete-orphan"
    )
    status_history: Mapped[List["ApplicationStatusHistory"]] = relationship(
        "ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan"
    )
    admin_reviews: Mapped[List["AdminReview"]] = relationship(
        "AdminReview", back_populates="application", cascade="all, delete-orphan"
    )
    notifications: Mapped[List["Notification"]] = relationship("Notification", back_populates="application")


# -----------------------------------------------------------------------------
# 6. documents
# -----------------------------------------------------------------------------
class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    upload_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "document_type IN ('income_certificate', 'caste_certificate', 'marksheet', 'admission_letter', 'identity_document')",
            name="check_document_type",
        ),
        CheckConstraint(
            "upload_status IN ('pending', 'uploaded', 'processing', 'processed', 'failed')",
            name="check_document_upload_status",
        ),
        CheckConstraint("file_size_bytes IS NULL OR file_size_bytes > 0", name="check_document_file_size_positive"),
        Index("ix_documents_app_doc_type", "application_id", "document_type"),
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="documents")
    extraction: Mapped[Optional["DocumentExtraction"]] = relationship(
        "DocumentExtraction", back_populates="document", uselist=False, cascade="all, delete-orphan"
    )
    deficiencies: Mapped[List["Deficiency"]] = relationship("Deficiency", back_populates="document")


# -----------------------------------------------------------------------------
# 7. document_extractions (Mirrors document_ai.models.ExtractionResult)
# -----------------------------------------------------------------------------
class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    document_type: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    extracted_fields: Mapped[Dict[str, Any]] = mapped_column(JSONBType, nullable=False, default=dict)
    extraction_status: Mapped[str] = mapped_column(String(20), nullable=False)
    errors: Mapped[List[str]] = mapped_column(StringArrayType, nullable=False, default=list)
    ocr_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    extracted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "extraction_status IN ('success', 'partial', 'manual_review', 'failed')",
            name="check_extraction_status",
        ),
        CheckConstraint(
            "ocr_confidence IS NULL OR (ocr_confidence >= 0.0 AND ocr_confidence <= 1.0)",
            name="check_extraction_ocr_confidence_range",
        ),
    )

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="extraction")


# -----------------------------------------------------------------------------
# 8. verification_results
# -----------------------------------------------------------------------------
class VerificationResult(Base):
    __tablename__ = "verification_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    check_type: Mapped[str] = mapped_column(String(20), nullable=False)
    check_name: Mapped[str] = mapped_column(String(100), nullable=False)
    result: Mapped[str] = mapped_column(String(10), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONBType, nullable=True)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("check_type IN ('eligibility', 'document', 'cross_field')", name="check_verification_type"),
        CheckConstraint("result IN ('pass', 'fail', 'warning')", name="check_verification_result"),
        Index("ix_verification_app_check_type", "application_id", "check_type"),
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="verification_results")


# -----------------------------------------------------------------------------
# 9. deficiencies
# -----------------------------------------------------------------------------
class Deficiency(Base):
    __tablename__ = "deficiencies"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True
    )
    deficiency_type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    field_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    expected_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    actual_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(10), nullable=False, default="warning")
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "deficiency_type IN ('missing_document', 'data_mismatch', 'name_mismatch', 'invalid_data', 'expired_document')",
            name="check_deficiency_type",
        ),
        CheckConstraint("severity IN ('critical', 'warning', 'info')", name="check_deficiency_severity"),
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="deficiencies")
    document: Mapped[Optional["Document"]] = relationship("Document", back_populates="deficiencies")


# -----------------------------------------------------------------------------
# 10. application_status_history
# -----------------------------------------------------------------------------
class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    old_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    new_status: Mapped[str] = mapped_column(String(20), nullable=False)
    changed_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        Index("ix_status_history_app_changed", "application_id", "changed_at"),
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="status_history")
    changed_by: Mapped[Optional["User"]] = relationship("User", back_populates="status_changes")


# -----------------------------------------------------------------------------
# 11. admin_reviews
# -----------------------------------------------------------------------------
class AdminReview(Base):
    __tablename__ = "admin_reviews"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    application_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reviewer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    decision: Mapped[str] = mapped_column(String(20), nullable=False)
    comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    checklist: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONBType, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "decision IN ('approve', 'reject', 'request_info', 'escalate')",
            name="check_review_decision",
        ),
    )

    # Relationships
    application: Mapped["Application"] = relationship("Application", back_populates="admin_reviews")
    reviewer: Mapped["User"] = relationship("User", back_populates="admin_reviews")


# -----------------------------------------------------------------------------
# 12. notifications
# -----------------------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    application_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("applications.id", ondelete="SET NULL"), nullable=True, index=True
    )
    notification_type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "notification_type IN ('status_change', 'deficiency', 'review', 'reminder', 'system')",
            name="check_notification_type",
        ),
        Index("ix_notifications_user_is_read", "user_id", "is_read"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")
    application: Mapped[Optional["Application"]] = relationship("Application", back_populates="notifications")
