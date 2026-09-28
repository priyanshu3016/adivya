-- ==============================================================================
-- TribalScholar AI (ADIVYA) - Initial Database Schema Migration
-- ==============================================================================
-- Revision: 001_initial_schema
-- Created: 2026-09-28
-- Description: Complete 12-table relational schema for scholarship management.

BEGIN;

CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- 1. users
CREATE TABLE IF NOT EXISTS users (
    id UUID NOT NULL, 
    email VARCHAR(255) NOT NULL, 
    password_hash VARCHAR(255) NOT NULL, 
    full_name VARCHAR(255) NOT NULL, 
    role VARCHAR(20) DEFAULT 'applicant' NOT NULL, 
    is_active BOOLEAN DEFAULT true NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_user_role CHECK (role IN ('applicant', 'admin'))
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_role ON users (role);

-- 2. applicants
CREATE TABLE IF NOT EXISTS applicants (
    id UUID NOT NULL, 
    user_id UUID NOT NULL, 
    full_name VARCHAR(255) NOT NULL, 
    date_of_birth DATE, 
    gender VARCHAR(20), 
    category VARCHAR(20) DEFAULT 'ST' NOT NULL, 
    tribe_name VARCHAR(100), 
    state VARCHAR(100), 
    district VARCHAR(100), 
    address TEXT, 
    phone VARCHAR(15), 
    aadhaar_number_hash VARCHAR(64), 
    annual_family_income NUMERIC(12, 2), 
    current_education_level VARCHAR(50), 
    institution_name VARCHAR(255), 
    course_name VARCHAR(255), 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_applicant_gender CHECK (gender IS NULL OR gender IN ('male', 'female', 'other')), 
    CONSTRAINT check_applicant_category CHECK (category IN ('ST', 'SC', 'OBC', 'General')), 
    CONSTRAINT check_applicant_income_positive CHECK (annual_family_income IS NULL OR annual_family_income >= 0), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_applicants_user_id ON applicants (user_id);
CREATE INDEX IF NOT EXISTS ix_applicants_category ON applicants (category);
CREATE INDEX IF NOT EXISTS ix_applicants_state ON applicants (state);

-- 3. schemes
CREATE TABLE IF NOT EXISTS schemes (
    id UUID NOT NULL, 
    name VARCHAR(255) NOT NULL, 
    description TEXT, 
    scheme_type VARCHAR(20) DEFAULT 'scholarship' NOT NULL, 
    max_income_limit NUMERIC(12, 2), 
    required_category VARCHAR(20), 
    min_education_level VARCHAR(50), 
    required_document_types VARCHAR[] NOT NULL, 
    application_deadline DATE, 
    award_amount NUMERIC(12, 2), 
    is_active BOOLEAN DEFAULT true NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_scheme_type CHECK (scheme_type IN ('scholarship', 'fellowship')), 
    CONSTRAINT check_scheme_max_income_positive CHECK (max_income_limit IS NULL OR max_income_limit > 0), 
    CONSTRAINT check_scheme_award_positive CHECK (award_amount IS NULL OR award_amount > 0)
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_schemes_name ON schemes (name);
CREATE INDEX IF NOT EXISTS ix_schemes_is_active ON schemes (is_active);

-- 4. scheme_rules
CREATE TABLE IF NOT EXISTS scheme_rules (
    id UUID NOT NULL, 
    scheme_id UUID NOT NULL, 
    rule_field VARCHAR(100) NOT NULL, 
    rule_operator VARCHAR(20) NOT NULL, 
    rule_value VARCHAR(255) NOT NULL, 
    error_message TEXT NOT NULL, 
    priority INTEGER DEFAULT '0' NOT NULL, 
    is_active BOOLEAN DEFAULT true NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_rule_operator CHECK (rule_operator IN ('eq', 'ne', 'lt', 'le', 'gt', 'ge', 'in', 'contains')), 
    FOREIGN KEY(scheme_id) REFERENCES schemes (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_scheme_rules_scheme_id ON scheme_rules (scheme_id);
CREATE INDEX IF NOT EXISTS ix_scheme_rules_scheme_priority ON scheme_rules (scheme_id, priority);

-- 5. applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID NOT NULL, 
    applicant_id UUID NOT NULL, 
    scheme_id UUID NOT NULL, 
    status VARCHAR(20) DEFAULT 'draft' NOT NULL, 
    academic_year VARCHAR(9), 
    applicant_snapshot JSONB, 
    remarks TEXT, 
    submitted_at TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_application_status CHECK (status IN ('draft', 'submitted', 'under_review', 'verified', 'deficient', 'approved', 'rejected')), 
    FOREIGN KEY(applicant_id) REFERENCES applicants (id) ON DELETE CASCADE, 
    FOREIGN KEY(scheme_id) REFERENCES schemes (id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS ix_applications_applicant_id ON applications (applicant_id);
CREATE INDEX IF NOT EXISTS ix_applications_scheme_id ON applications (scheme_id);
CREATE INDEX IF NOT EXISTS ix_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS ix_applications_applicant_scheme ON applications (applicant_id, scheme_id);

-- 6. documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID NOT NULL, 
    application_id UUID NOT NULL, 
    document_type VARCHAR(30) NOT NULL, 
    file_name VARCHAR(255) NOT NULL, 
    file_path VARCHAR(500) NOT NULL, 
    mime_type VARCHAR(100), 
    file_size_bytes INTEGER, 
    upload_status VARCHAR(20) DEFAULT 'pending' NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_document_type CHECK (document_type IN ('income_certificate', 'caste_certificate', 'marksheet', 'admission_letter', 'identity_document')), 
    CONSTRAINT check_document_upload_status CHECK (upload_status IN ('pending', 'uploaded', 'processing', 'processed', 'failed')), 
    CONSTRAINT check_document_file_size_positive CHECK (file_size_bytes IS NULL OR file_size_bytes > 0), 
    FOREIGN KEY(application_id) REFERENCES applications (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_documents_application_id ON documents (application_id);
CREATE INDEX IF NOT EXISTS ix_documents_document_type ON documents (document_type);
CREATE INDEX IF NOT EXISTS ix_documents_app_doc_type ON documents (application_id, document_type);

-- 7. document_extractions
CREATE TABLE IF NOT EXISTS document_extractions (
    id UUID NOT NULL, 
    document_id UUID NOT NULL, 
    document_type VARCHAR(30), 
    extracted_fields JSONB NOT NULL, 
    extraction_status VARCHAR(20) NOT NULL, 
    errors VARCHAR[] NOT NULL, 
    ocr_confidence FLOAT, 
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_extraction_status CHECK (extraction_status IN ('success', 'partial', 'manual_review', 'failed')), 
    CONSTRAINT check_extraction_ocr_confidence_range CHECK (ocr_confidence IS NULL OR (ocr_confidence >= 0.0 AND ocr_confidence <= 1.0)), 
    FOREIGN KEY(document_id) REFERENCES documents (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_document_extractions_document_id ON document_extractions (document_id);

-- 8. verification_results
CREATE TABLE IF NOT EXISTS verification_results (
    id UUID NOT NULL, 
    application_id UUID NOT NULL, 
    check_type VARCHAR(20) NOT NULL, 
    check_name VARCHAR(100) NOT NULL, 
    result VARCHAR(10) NOT NULL, 
    message TEXT, 
    details JSONB, 
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_verification_type CHECK (check_type IN ('eligibility', 'document', 'cross_field')), 
    CONSTRAINT check_verification_result CHECK (result IN ('pass', 'fail', 'warning')), 
    FOREIGN KEY(application_id) REFERENCES applications (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_verification_results_application_id ON verification_results (application_id);
CREATE INDEX IF NOT EXISTS ix_verification_app_check_type ON verification_results (application_id, check_type);

-- 9. deficiencies
CREATE TABLE IF NOT EXISTS deficiencies (
    id UUID NOT NULL, 
    application_id UUID NOT NULL, 
    document_id UUID, 
    deficiency_type VARCHAR(30) NOT NULL, 
    field_name VARCHAR(100), 
    expected_value TEXT, 
    actual_value TEXT, 
    description TEXT NOT NULL, 
    severity VARCHAR(10) DEFAULT 'warning' NOT NULL, 
    is_resolved BOOLEAN DEFAULT false NOT NULL, 
    resolved_at TIMESTAMP WITH TIME ZONE, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_deficiency_type CHECK (deficiency_type IN ('missing_document', 'data_mismatch', 'name_mismatch', 'invalid_data', 'expired_document')), 
    CONSTRAINT check_deficiency_severity CHECK (severity IN ('critical', 'warning', 'info')), 
    FOREIGN KEY(application_id) REFERENCES applications (id) ON DELETE CASCADE, 
    FOREIGN KEY(document_id) REFERENCES documents (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS ix_deficiencies_application_id ON deficiencies (application_id);
CREATE INDEX IF NOT EXISTS ix_deficiencies_deficiency_type ON deficiencies (deficiency_type);
CREATE INDEX IF NOT EXISTS ix_deficiencies_is_resolved ON deficiencies (is_resolved);

-- 10. application_status_history
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID NOT NULL, 
    application_id UUID NOT NULL, 
    old_status VARCHAR(20), 
    new_status VARCHAR(20) NOT NULL, 
    changed_by_user_id UUID, 
    reason TEXT, 
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(application_id) REFERENCES applications (id) ON DELETE CASCADE, 
    FOREIGN KEY(changed_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS ix_application_status_history_application_id ON application_status_history (application_id);
CREATE INDEX IF NOT EXISTS ix_status_history_app_changed ON application_status_history (application_id, changed_at);

-- 11. admin_reviews
CREATE TABLE IF NOT EXISTS admin_reviews (
    id UUID NOT NULL, 
    application_id UUID NOT NULL, 
    reviewer_id UUID NOT NULL, 
    decision VARCHAR(20) NOT NULL, 
    comments TEXT, 
    checklist JSONB, 
    reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_review_decision CHECK (decision IN ('approve', 'reject', 'request_info', 'escalate')), 
    FOREIGN KEY(application_id) REFERENCES applications (id) ON DELETE CASCADE, 
    FOREIGN KEY(reviewer_id) REFERENCES users (id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS ix_admin_reviews_application_id ON admin_reviews (application_id);
CREATE INDEX IF NOT EXISTS ix_admin_reviews_reviewer_id ON admin_reviews (reviewer_id);

-- 12. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID NOT NULL, 
    user_id UUID NOT NULL, 
    application_id UUID, 
    notification_type VARCHAR(20) NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    message TEXT NOT NULL, 
    is_read BOOLEAN DEFAULT false NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL, 
    PRIMARY KEY (id), 
    CONSTRAINT check_notification_type CHECK (notification_type IN ('status_change', 'deficiency', 'review', 'reminder', 'system')), 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE, 
    FOREIGN KEY(application_id) REFERENCES applications (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS ix_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS ix_notifications_application_id ON notifications (application_id);
CREATE INDEX IF NOT EXISTS ix_notifications_user_is_read ON notifications (user_id, is_read);

-- Record migration version
INSERT INTO alembic_version (version_num) 
SELECT '001_initial_schema' 
WHERE NOT EXISTS (SELECT 1 FROM alembic_version WHERE version_num = '001_initial_schema');

COMMIT;
