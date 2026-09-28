# TribalScholar AI (ADIVYA) — REST API Contract

**Module:** Backend REST API Endpoints  
**Target Roles:** Person 3 (Backend Engineer) & Person 1 (Frontend Engineer)  
**Status:** Initial Specification  
**Base URL:** `/api/v1`

---

## 1. Authentication Endpoints

### 1.1 User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Request:**
  ```json
  {
    "email": "sunita.soren@tribalscholar.demo",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "jwt-token-string",
    "token_type": "bearer",
    "user": {
      "id": "00000000-0000-0000-0003-000000000001",
      "email": "sunita.soren@tribalscholar.demo",
      "full_name": "Sunita Soren",
      "role": "applicant"
    }
  }
  ```

---

## 2. Schemes & Rules Endpoints

### 2.1 List Active Schemes
- **Endpoint:** `GET /api/v1/schemes`
- **Response (200 OK):**
  ```json
  [
    {
      "id": "00000000-0000-0001-0000-000000000001",
      "name": "Post-Matric Scholarship for ST Students",
      "description": "Comprehensive financial support scheme for Scheduled Tribe students.",
      "max_income_limit": 250000.0,
      "required_category": "ST",
      "min_education_level": "undergraduate",
      "required_document_types": [
        "income_certificate",
        "caste_certificate",
        "marksheet",
        "admission_letter",
        "identity_document"
      ],
      "award_amount": 50000.0,
      "application_deadline": "2026-12-31"
    }
  ]
  ```

---

## 3. Applicant Profile Endpoints

### 3.1 Get Profile
- **Endpoint:** `GET /api/v1/applicant/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "id": "00000000-0000-0000-0004-000000000001",
    "full_name": "Sunita Soren",
    "category": "ST",
    "tribe_name": "Santal",
    "state": "Jharkhand",
    "district": "Ranchi",
    "annual_family_income": 120000.0,
    "institution_name": "Ranchi University",
    "course_name": "B.Tech Computer Science"
  }
  ```

---

## 4. Application Lifecycle Endpoints

### 4.1 Create Application Draft
- **Endpoint:** `POST /api/v1/applications`
- **Request:**
  ```json
  {
    "scheme_id": "00000000-0000-0001-0000-000000000001",
    "academic_year": "2025-2026"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "id": "00000000-0000-0000-0005-000000000001",
    "scheme_id": "00000000-0000-0001-0000-000000000001",
    "status": "draft",
    "created_at": "2026-09-28T22:00:00Z"
  }
  ```

### 4.2 Upload Application Document
- **Endpoint:** `POST /api/v1/applications/{application_id}/documents`
- **Form Data:**
  - `document_type`: `income_certificate`
  - `file`: binary file upload (PDF/PNG/JPEG)
- **Response (201 Created):**
  ```json
  {
    "document_id": "00000000-0000-0001-0001-000000000001",
    "document_type": "income_certificate",
    "file_name": "income_cert.pdf",
    "upload_status": "uploaded"
  }
  ```

### 4.3 Submit Application
- **Endpoint:** `POST /api/v1/applications/{application_id}/submit`
- **Response (200 OK):**
  ```json
  {
    "id": "00000000-0000-0000-0005-000000000001",
    "status": "submitted",
    "submitted_at": "2026-09-28T22:30:00Z"
  }
  ```

### 4.4 Get Application Status & Deficiencies
- **Endpoint:** `GET /api/v1/applications/{application_id}`
- **Response (200 OK):**
  ```json
  {
    "id": "00000000-0000-0000-0005-000000000002",
    "status": "deficient",
    "deficiencies": [
      {
        "id": "00000000-0000-0002-0007-000000000001",
        "deficiency_type": "missing_document",
        "field_name": "admission_letter",
        "description": "Required document admission_letter not uploaded",
        "severity": "critical",
        "is_resolved": false
      }
    ]
  }
  ```

---

## 5. Admin & Review Endpoints

### 5.1 Review Application
- **Endpoint:** `POST /api/v1/admin/applications/{application_id}/review`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Request:**
  ```json
  {
    "decision": "approve",
    "comments": "All documents verified and authentic.",
    "checklist": {
      "income_verified": true,
      "caste_verified": true,
      "admission_verified": true
    }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "review_id": "00000000-0000-0001-0005-000000000001",
    "application_id": "00000000-0000-0000-0005-000000000001",
    "status": "approved",
    "decision": "approve"
  }
  ```
