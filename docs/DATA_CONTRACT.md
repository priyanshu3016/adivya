# TribalScholar AI (ADIVYA) — Data Contract Specification

**Module:** System-Wide Data Contracts & Database Schema  
**Owner:** Person 4 — Database Engineer  
**Status:** Approved & Implemented  
**Date:** 2026-09-28  

---

## 1. Overview & Architectural Principles

This document defines the canonical data models, field definitions, enumerations, and JSON structures shared across **Frontend (Person 1)**, **Document-AI (Person 2)**, **Backend (Person 3)**, and **Verification Rules (Person 5)**.

All services must conform to the types and constraints specified in this contract.

---

## 2. Canonical Enumerations & Constants

### 2.1 User Roles
```typescript
type UserRole = "applicant" | "admin";
```

### 2.2 Applicant Categories & Genders
```typescript
type CasteCategory = "ST" | "SC" | "OBC" | "General";
type Gender = "male" | "female" | "other";
```

### 2.3 Application Status Lifecycle
```
draft → submitted → under_review → verified → approved
                                 ↘ deficient → submitted (re-upload)
                  → under_review → rejected
```
```typescript
type ApplicationStatus = 
  | "draft"          // Created but not submitted
  | "submitted"      // Applicant submitted; awaiting processing
  | "under_review"   // Document OCR / verification engine in progress
  | "verified"       // All automated checks passed
  | "deficient"      // Deficiencies found (missing docs, mismatches)
  | "approved"       // Final admin approval granted
  | "rejected";      // Ineligible or final rejection
```

### 2.4 Supported Document Types
Matches [`document-ai/document_ai/extractors/`](file:///Users/dev/Desktop/TribalScholar-AI/document-ai/document_ai/extractors/):
```typescript
type DocumentTypeCode = 
  | "income_certificate"
  | "caste_certificate"
  | "marksheet"
  | "admission_letter"
  | "identity_document";
```

### 2.5 Document Upload & Processing Status
```typescript
type DocumentUploadStatus = 
  | "pending"     // Upload slot registered
  | "uploaded"    // File received on server
  | "processing"  // PaddleOCR extraction running
  | "processed"   // OCR extraction completed
  | "failed";     // Upload or preprocessing failed
```

### 2.6 OCR Extraction Status
Directly mirrors `document_ai.models.ExtractionResult.extraction_status`:
```typescript
type ExtractionStatus = 
  | "success"        // All required extractor fields found
  | "partial"        // Some required extractor fields missing
  | "manual_review"  // Unknown type or OCR confidence < 0.30
  | "failed";        // File read or internal OCR error
```

### 2.7 Verification Check Categories & Results
```typescript
type VerificationCheckType = "eligibility" | "document" | "cross_field";
type VerificationResultOutcome = "pass" | "fail" | "warning";
```

### 2.8 Deficiency Types & Severities
```typescript
type DeficiencyTypeCode = 
  | "missing_document"  // Required document not uploaded
  | "data_mismatch"     // Value discrepancy (e.g., income form vs certificate)
  | "name_mismatch"     // Name spelling variation between profile and documents
  | "invalid_data"      // Unreadable, corrupt, or inconsistent field
  | "expired_document"; // Validity expired (e.g. income cert older than allowed)

type DeficiencySeverity = "critical" | "warning" | "info";
```

### 2.9 Admin Decisions
```typescript
type AdminDecision = "approve" | "reject" | "request_info" | "escalate";
```

### 2.10 Notification Types
```typescript
type NotificationType = "status_change" | "deficiency" | "review" | "reminder" | "system";
```

---

## 3. Extracted Fields Schema per Document Type

The JSONB field `document_extractions.extracted_fields` adheres to the output of `document-ai`:

### 3.1 `income_certificate`
```json
{
  "name": "Sunita Soren",
  "annual_income": 120000,
  "certificate_number": "JH/INC/2025/1102",
  "issue_date": "2025-06-10"
}
```

### 3.2 `caste_certificate`
```json
{
  "name": "Sunita Soren",
  "certificate_number": "JH/CST/2023/8892",
  "category": "ST",
  "tribe_name": "Santal",
  "issue_date": "2023-04-15"
}
```

### 3.3 `marksheet`
```json
{
  "name": "Sunita Soren",
  "institution": "Ranchi Women's College",
  "course": "Class XII",
  "marks_obtained": 440,
  "total_marks": 500,
  "percentage": 88.0,
  "academic_year": "2023-2024"
}
```

### 3.4 `admission_letter`
```json
{
  "name": "Sunita Soren",
  "institution": "Ranchi University",
  "course": "B.Tech Computer Science",
  "admission_date": "2024-07-20",
  "reference_number": "RU/ADM/2024/091"
}
```

### 3.5 `identity_document`
```json
{
  "name": "Sunita Soren",
  "id_type": "aadhaar",
  "id_number": "XXXX-XXXX-9012",
  "date_of_birth": "2003-05-14"
}
```

---

## 4. Entity Specifications

### 4.1 `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | User UUID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Account email |
| `password_hash` | VARCHAR(255) | NOT NULL | Password hash |
| `full_name` | VARCHAR(255) | NOT NULL | Display name |
| `role` | VARCHAR(20) | NOT NULL, CHECK in ('applicant','admin') | Authorization role |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Account status |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Update timestamp |

### 4.2 `applicants`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Applicant UUID |
| `user_id` | UUID | FK(`users.id`), UNIQUE, CASCADE | Associated user account |
| `full_name` | VARCHAR(255) | NOT NULL | Legal name for document matching |
| `date_of_birth` | DATE | NULLABLE | Date of birth |
| `gender` | VARCHAR(20) | CHECK in ('male','female','other') | Demographics |
| `category` | VARCHAR(20) | NOT NULL, CHECK in ('ST','SC','OBC','General') | Category |
| `tribe_name` | VARCHAR(100) | NULLABLE | Recognized tribe (e.g. Santhal, Munda) |
| `state` | VARCHAR(100) | NULLABLE | Domicile state |
| `district` | VARCHAR(100) | NULLABLE | Domicile district |
| `address` | TEXT | NULLABLE | Address |
| `phone` | VARCHAR(15) | NULLABLE | Phone number |
| `aadhaar_number_hash` | VARCHAR(64) | NULLABLE | SHA-256 hash of Aadhaar (privacy-safe) |
| `annual_family_income` | NUMERIC(12,2) | CHECK >= 0 | Declared annual family income |
| `current_education_level` | VARCHAR(50) | NULLABLE | Education level (undergraduate, etc.) |
| `institution_name` | VARCHAR(255) | NULLABLE | Enrolled college / university |
| `course_name` | VARCHAR(255) | NULLABLE | Enrolled degree / program |

### 4.3 `schemes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Scheme UUID |
| `name` | VARCHAR(255) | UNIQUE, NOT NULL | Scheme title |
| `description` | TEXT | NULLABLE | Scheme overview |
| `scheme_type` | VARCHAR(20) | CHECK in ('scholarship','fellowship') | Scheme classification |
| `max_income_limit` | NUMERIC(12,2) | CHECK > 0 | Maximum income limit ceiling |
| `required_category` | VARCHAR(20) | NULLABLE | Required category ('ST') |
| `min_education_level` | VARCHAR(50) | NULLABLE | Minimum education required |
| `required_document_types` | VARCHAR[] | NOT NULL | Required document type codes |
| `application_deadline` | DATE | NULLABLE | Last date of submission |
| `award_amount` | NUMERIC(12,2) | CHECK > 0 | Scholarship award amount |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Scheme status |

### 4.4 `scheme_rules`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Rule UUID |
| `scheme_id` | UUID | FK(`schemes.id`), CASCADE | Parent scheme |
| `rule_field` | VARCHAR(100) | NOT NULL | Target field (e.g. 'category', 'annual_family_income') |
| `rule_operator` | VARCHAR(20) | CHECK in ('eq','ne','lt','le','gt','ge','in','contains') | Comparison operator |
| `rule_value` | VARCHAR(255) | NOT NULL | Target value |
| `error_message` | TEXT | NOT NULL | Human-readable error if violated |
| `priority` | INTEGER | NOT NULL, DEFAULT 0 | Evaluation order |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Active flag |

### 4.5 `applications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Application UUID |
| `applicant_id` | UUID | FK(`applicants.id`), CASCADE | Applicant reference |
| `scheme_id` | UUID | FK(`schemes.id`), RESTRICT | Scheme reference |
| `status` | VARCHAR(20) | CHECK in canonical statuses | Application status |
| `academic_year` | VARCHAR(9) | NULLABLE | e.g. '2025-2026' |
| `applicant_snapshot` | JSONB | NULLABLE | Frozen profile at submission |
| `remarks` | TEXT | NULLABLE | General remarks / notes |
| `submitted_at` | TIMESTAMPTZ | NULLABLE | Initial submission timestamp |

### 4.6 `documents`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Document UUID |
| `application_id` | UUID | FK(`applications.id`), CASCADE | Parent application |
| `document_type` | VARCHAR(30) | CHECK in 5 document types | Type code |
| `file_name` | VARCHAR(255) | NOT NULL | Original file name |
| `file_path` | VARCHAR(500) | NOT NULL | Server file path |
| `mime_type` | VARCHAR(100) | NULLABLE | MIME type |
| `file_size_bytes` | INTEGER | CHECK > 0 | Size in bytes |
| `upload_status` | VARCHAR(20) | CHECK in upload statuses | Processing stage |

### 4.7 `document_extractions`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Extraction UUID |
| `document_id` | UUID | FK(`documents.id`), UNIQUE, CASCADE | Target document |
| `document_type` | VARCHAR(30) | NULLABLE | Extracted type code |
| `extracted_fields` | JSONB | NOT NULL | Key-value pairs extracted by PaddleOCR |
| `extraction_status` | VARCHAR(20) | CHECK in extraction statuses | Outcome status |
| `errors` | VARCHAR[] | NOT NULL | List of error messages from OCR |
| `ocr_confidence` | FLOAT | CHECK between 0.0 and 1.0 | Mean OCR confidence score |
| `extracted_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Timestamp |

### 4.8 `verification_results`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Verification UUID |
| `application_id` | UUID | FK(`applications.id`), CASCADE | Application checked |
| `check_type` | VARCHAR(20) | CHECK in ('eligibility','document','cross_field') | Type of check |
| `check_name` | VARCHAR(100) | NOT NULL | Unique check identifier |
| `result` | VARCHAR(10) | CHECK in ('pass','fail','warning') | Outcome |
| `message` | TEXT | NULLABLE | Explanation |
| `details` | JSONB | NULLABLE | Detailed breakdown (expected vs actual) |

### 4.9 `deficiencies`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Deficiency UUID |
| `application_id` | UUID | FK(`applications.id`), CASCADE | Target application |
| `document_id` | UUID | FK(`documents.id`), SET NULL | Specific document (if applicable) |
| `deficiency_type` | VARCHAR(30) | CHECK in 5 deficiency types | Type code |
| `field_name` | VARCHAR(100) | NULLABLE | Problematic field |
| `expected_value` | TEXT | NULLABLE | Expected value |
| `actual_value` | TEXT | NULLABLE | Observed value |
| `description` | TEXT | NOT NULL | Problem explanation |
| `severity` | VARCHAR(10) | CHECK in ('critical','warning','info') | Severity level |
| `is_resolved` | BOOLEAN | NOT NULL, DEFAULT false | Resolution flag |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | Resolution timestamp |

### 4.10 `application_status_history`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | History entry UUID |
| `application_id` | UUID | FK(`applications.id`), CASCADE | Target application |
| `old_status` | VARCHAR(20) | NULLABLE | Prior status |
| `new_status` | VARCHAR(20) | NOT NULL | Updated status |
| `changed_by_user_id` | UUID | FK(`users.id`), SET NULL | User who initiated transition |
| `reason` | TEXT | NULLABLE | Audit rationale |
| `changed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Event timestamp |

### 4.11 `admin_reviews`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Review UUID |
| `application_id` | UUID | FK(`applications.id`), CASCADE | Application reviewed |
| `reviewer_id` | UUID | FK(`users.id`), RESTRICT | Admin user |
| `decision` | VARCHAR(20) | CHECK in ('approve','reject','request_info','escalate') | Review decision |
| `comments` | TEXT | NULLABLE | Officer commentary |
| `checklist` | JSONB | NULLABLE | Form checklist items |
| `reviewed_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Review timestamp |

### 4.12 `notifications`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Notification UUID |
| `user_id` | UUID | FK(`users.id`), CASCADE | Recipient user |
| `application_id` | UUID | FK(`applications.id`), SET NULL | Associated application |
| `notification_type` | VARCHAR(20) | CHECK in notification types | Category |
| `title` | VARCHAR(255) | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification body |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT false | Read indicator |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Notification timestamp |
