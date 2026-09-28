"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-28 22:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), server_default='applicant', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("role IN ('applicant', 'admin')", name='check_user_role'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # 2. applicants
    op.create_table(
        'applicants',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.Uuid(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=20), nullable=True),
        sa.Column('category', sa.String(length=20), server_default='ST', nullable=False),
        sa.Column('tribe_name', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('district', sa.String(length=100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('phone', sa.String(length=15), nullable=True),
        sa.Column('aadhaar_number_hash', sa.String(length=64), nullable=True),
        sa.Column('annual_family_income', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('current_education_level', sa.String(length=50), nullable=True),
        sa.Column('institution_name', sa.String(length=255), nullable=True),
        sa.Column('course_name', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("gender IS NULL OR gender IN ('male', 'female', 'other')", name='check_applicant_gender'),
        sa.CheckConstraint("category IN ('ST', 'SC', 'OBC', 'General')", name='check_applicant_category'),
        sa.CheckConstraint('annual_family_income IS NULL OR annual_family_income >= 0', name='check_applicant_income_positive'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_applicants_user_id'), 'applicants', ['user_id'], unique=True)
    op.create_index(op.f('ix_applicants_category'), 'applicants', ['category'], unique=False)
    op.create_index(op.f('ix_applicants_state'), 'applicants', ['state'], unique=False)

    # 3. schemes
    op.create_table(
        'schemes',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('scheme_type', sa.String(length=20), server_default='scholarship', nullable=False),
        sa.Column('max_income_limit', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('required_category', sa.String(length=20), nullable=True),
        sa.Column('min_education_level', sa.String(length=50), nullable=True),
        sa.Column(
            'required_document_types',
            postgresql.ARRAY(sa.String()).with_variant(sa.JSON(), 'sqlite'),
            nullable=False,
        ),
        sa.Column('application_deadline', sa.Date(), nullable=True),
        sa.Column('award_amount', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("scheme_type IN ('scholarship', 'fellowship')", name='check_scheme_type'),
        sa.CheckConstraint('max_income_limit IS NULL OR max_income_limit > 0', name='check_scheme_max_income_positive'),
        sa.CheckConstraint('award_amount IS NULL OR award_amount > 0', name='check_scheme_award_positive'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_schemes_name'), 'schemes', ['name'], unique=True)
    op.create_index(op.f('ix_schemes_is_active'), 'schemes', ['is_active'], unique=False)

    # 4. scheme_rules
    op.create_table(
        'scheme_rules',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('scheme_id', sa.Uuid(as_uuid=True), sa.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('rule_field', sa.String(length=100), nullable=False),
        sa.Column('rule_operator', sa.String(length=20), nullable=False),
        sa.Column('rule_value', sa.String(length=255), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=False),
        sa.Column('priority', sa.Integer(), server_default='0', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "rule_operator IN ('eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'contains')",
            name='check_rule_operator',
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_scheme_rules_scheme_id'), 'scheme_rules', ['scheme_id'], unique=False)
    op.create_index('ix_scheme_rules_scheme_priority', 'scheme_rules', ['scheme_id', 'priority'], unique=False)

    # 5. applications
    op.create_table(
        'applications',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('applicant_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applicants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scheme_id', sa.Uuid(as_uuid=True), sa.ForeignKey('schemes.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('status', sa.String(length=20), server_default='draft', nullable=False),
        sa.Column('academic_year', sa.String(length=9), nullable=True),
        sa.Column('applicant_snapshot', postgresql.JSONB().with_variant(sa.JSON(), 'sqlite'), nullable=True),
        sa.Column('remarks', sa.Text(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('draft', 'submitted', 'under_review', 'verified', 'deficient', 'approved', 'rejected')",
            name='check_application_status',
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_applications_applicant_id'), 'applications', ['applicant_id'], unique=False)
    op.create_index(op.f('ix_applications_scheme_id'), 'applications', ['scheme_id'], unique=False)
    op.create_index(op.f('ix_applications_status'), 'applications', ['status'], unique=False)
    op.create_index('ix_applications_applicant_scheme', 'applications', ['applicant_id', 'scheme_id'], unique=False)

    # 6. documents
    op.create_table(
        'documents',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('application_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_type', sa.String(length=30), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=True),
        sa.Column('file_size_bytes', sa.Integer(), nullable=True),
        sa.Column('upload_status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "document_type IN ('income_certificate', 'caste_certificate', 'marksheet', 'admission_letter', 'identity_document')",
            name='check_document_type',
        ),
        sa.CheckConstraint(
            "upload_status IN ('pending', 'uploaded', 'processing', 'processed', 'failed')",
            name='check_document_upload_status',
        ),
        sa.CheckConstraint('file_size_bytes IS NULL OR file_size_bytes > 0', name='check_document_file_size_positive'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_documents_application_id'), 'documents', ['application_id'], unique=False)
    op.create_index(op.f('ix_documents_document_type'), 'documents', ['document_type'], unique=False)
    op.create_index('ix_documents_app_doc_type', 'documents', ['application_id', 'document_type'], unique=False)

    # 7. document_extractions
    op.create_table(
        'document_extractions',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('document_id', sa.Uuid(as_uuid=True), sa.ForeignKey('documents.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_type', sa.String(length=30), nullable=True),
        sa.Column('extracted_fields', postgresql.JSONB().with_variant(sa.JSON(), 'sqlite'), nullable=False),
        sa.Column('extraction_status', sa.String(length=20), nullable=False),
        sa.Column(
            'errors',
            postgresql.ARRAY(sa.String()).with_variant(sa.JSON(), 'sqlite'),
            nullable=False,
        ),
        sa.Column('ocr_confidence', sa.Float(), nullable=True),
        sa.Column('extracted_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "extraction_status IN ('success', 'partial', 'manual_review', 'failed')",
            name='check_extraction_status',
        ),
        sa.CheckConstraint('ocr_confidence IS NULL OR (ocr_confidence >= 0.0 AND ocr_confidence <= 1.0)', name='check_extraction_ocr_confidence_range'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_document_extractions_document_id'), 'document_extractions', ['document_id'], unique=True)

    # 8. verification_results
    op.create_table(
        'verification_results',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('application_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('check_type', sa.String(length=20), nullable=False),
        sa.Column('check_name', sa.String(length=100), nullable=False),
        sa.Column('result', sa.String(length=10), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('details', postgresql.JSONB().with_variant(sa.JSON(), 'sqlite'), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("check_type IN ('eligibility', 'document', 'cross_field')", name='check_verification_type'),
        sa.CheckConstraint("result IN ('pass', 'fail', 'warning')", name='check_verification_result'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_verification_results_application_id'), 'verification_results', ['application_id'], unique=False)
    op.create_index('ix_verification_app_check_type', 'verification_results', ['application_id', 'check_type'], unique=False)

    # 9. deficiencies
    op.create_table(
        'deficiencies',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('application_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('document_id', sa.Uuid(as_uuid=True), sa.ForeignKey('documents.id', ondelete='SET NULL'), nullable=True),
        sa.Column('deficiency_type', sa.String(length=30), nullable=False),
        sa.Column('field_name', sa.String(length=100), nullable=True),
        sa.Column('expected_value', sa.Text(), nullable=True),
        sa.Column('actual_value', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=10), server_default='warning', nullable=False),
        sa.Column('is_resolved', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "deficiency_type IN ('missing_document', 'data_mismatch', 'name_mismatch', 'invalid_data', 'expired_document')",
            name='check_deficiency_type',
        ),
        sa.CheckConstraint("severity IN ('critical', 'warning', 'info')", name='check_deficiency_severity'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_deficiencies_application_id'), 'deficiencies', ['application_id'], unique=False)
    op.create_index(op.f('ix_deficiencies_deficiency_type'), 'deficiencies', ['deficiency_type'], unique=False)
    op.create_index(op.f('ix_deficiencies_is_resolved'), 'deficiencies', ['is_resolved'], unique=False)

    # 10. application_status_history
    op.create_table(
        'application_status_history',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('application_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('old_status', sa.String(length=20), nullable=True),
        sa.Column('new_status', sa.String(length=20), nullable=False),
        sa.Column('changed_by_user_id', sa.Uuid(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('changed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_application_status_history_application_id'), 'application_status_history', ['application_id'], unique=False)
    op.create_index('ix_status_history_app_changed', 'application_status_history', ['application_id', 'changed_at'], unique=False)

    # 11. admin_reviews
    op.create_table(
        'admin_reviews',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('application_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reviewer_id', sa.Uuid(as_uuid=True), sa.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('decision', sa.String(length=20), nullable=False),
        sa.Column('comments', sa.Text(), nullable=True),
        sa.Column('checklist', postgresql.JSONB().with_variant(sa.JSON(), 'sqlite'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "decision IN ('approve', 'reject', 'request_info', 'escalate')",
            name='check_review_decision',
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_admin_reviews_application_id'), 'admin_reviews', ['application_id'], unique=False)
    op.create_index(op.f('ix_admin_reviews_reviewer_id'), 'admin_reviews', ['reviewer_id'], unique=False)

    # 12. notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column('user_id', sa.Uuid(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('application_id', sa.Uuid(as_uuid=True), sa.ForeignKey('applications.id', ondelete='SET NULL'), nullable=True),
        sa.Column('notification_type', sa.String(length=20), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "notification_type IN ('status_change', 'deficiency', 'review', 'reminder', 'system')",
            name='check_notification_type',
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_application_id'), 'notifications', ['application_id'], unique=False)
    op.create_index('ix_notifications_user_is_read', 'notifications', ['user_id', 'is_read'], unique=False)


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('admin_reviews')
    op.drop_table('application_status_history')
    op.drop_table('deficiencies')
    op.drop_table('verification_results')
    op.drop_table('document_extractions')
    op.drop_table('documents')
    op.drop_table('applications')
    op.drop_table('scheme_rules')
    op.drop_table('schemes')
    op.drop_table('applicants')
    op.drop_table('users')
