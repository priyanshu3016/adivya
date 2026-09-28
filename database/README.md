# TribalScholar AI — Database Architecture & Setup Guide

**Module:** Database & Data Persistence  
**Role:** Person 4 — Database Engineer  
**Project:** TribalScholar AI (ADIVYA) | Smart India Hackathon 2026  
**Repository:** [priyanshu3016/adivya](https://github.com/priyanshu3016/adivya)

---

## 1. Overview

The TribalScholar AI database layer is built using **SQLAlchemy 2.0** and **Alembic**, designed natively for **PostgreSQL 15+** with async engine support (`asyncpg`) for FastAPI and sync driver support (`psycopg2-binary`) for migrations and administrative CLI tools.

It models the entire lifecycle of an AI-assisted scholarship application for Scheduled Tribe (ST) students:
- User accounts and authentication credentials
- Applicant demographic and academic profiles
- Scholarship and fellowship schemes with deterministic eligibility rules
- Multi-document upload and PaddleOCR extraction results (matching `document-ai`'s `ExtractionResult` contract)
- Automated verification checks and deficiency tracking
- Complete status history audit logs and administrative reviews
- Real-time user notifications

---

## 2. Table Summary (12 Tables)

| # | Table | Purpose | Primary Key | Foreign Keys |
|---|---|---|---|---|
| 1 | `users` | User credentials and RBAC roles (`applicant`, `admin`) | UUID | — |
| 2 | `applicants` | ST applicant profile (demographics, income, domicile) | UUID | `user_id` -> `users.id` (CASCADE) |
| 3 | `schemes` | Scholarship & fellowship definitions | UUID | — |
| 4 | `scheme_rules` | Deterministic eligibility evaluation rules | UUID | `scheme_id` -> `schemes.id` (CASCADE) |
| 5 | `applications` | Individual applications submitted for a scheme | UUID | `applicant_id` -> `applicants.id`, `scheme_id` -> `schemes.id` |
| 6 | `documents` | Uploaded document metadata and processing status | UUID | `application_id` -> `applications.id` (CASCADE) |
| 7 | `document_extractions` | OCR extracted fields (`ExtractionResult` mirror) | UUID | `document_id` -> `documents.id` (CASCADE, UNIQUE) |
| 8 | `verification_results` | Results of eligibility and cross-field checks | UUID | `application_id` -> `applications.id` (CASCADE) |
| 9 | `deficiencies` | Flagged issues (missing docs, income/name mismatches) | UUID | `application_id` -> `applications.id`, `document_id` -> `documents.id` |
| 10 | `application_status_history` | Immutable audit trail of status transitions | UUID | `application_id` -> `applications.id`, `changed_by_user_id` -> `users.id` |
| 11 | `admin_reviews` | Reviewer decisions, comments, and checklists | UUID | `application_id` -> `applications.id`, `reviewer_id` -> `users.id` |
| 12 | `notifications` | In-app alerts for applicants and reviewers | UUID | `user_id` -> `users.id`, `application_id` -> `applications.id` |

---

## 3. Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o| applicants : "has profile"
    users ||--o{ admin_reviews : "conducts"
    users ||--o{ application_status_history : "updates"
    users ||--o{ notifications : "receives"

    applicants ||--o{ applications : "submits"

    schemes ||--o{ applications : "receives"
    schemes ||--o{ scheme_rules : "defines"

    applications ||--o{ documents : "contains"
    applications ||--o{ verification_results : "evaluated by"
    applications ||--o{ deficiencies : "flags"
    applications ||--o{ application_status_history : "audited by"
    applications ||--o{ admin_reviews : "decided by"
    applications ||--o{ notifications : "generates"

    documents ||--o| document_extractions : "extracted by OCR"
    documents ||--o{ deficiencies : "subject to"
```

---

## 4. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

Key variables:

```env
# Async PostgreSQL connection for FastAPI
DATABASE_URL=postgresql+asyncpg://tribalscholar:tribalscholar@localhost:5432/tribalscholar_db

# Synchronous connection for Alembic & CLI seed scripts
DATABASE_URL_SYNC=postgresql://tribalscholar:tribalscholar@localhost:5432/tribalscholar_db

# Storage path for uploaded verification documents
FILE_STORAGE_PATH=./uploads
```

---

## 5. Quickstart & Migration Commands

### Option A: Local or Docker PostgreSQL

Start a local PostgreSQL 15+ container if not running natively:

```bash
docker run -d \
  --name tribalscholar-postgres \
  -e POSTGRES_USER=tribalscholar \
  -e POSTGRES_PASSWORD=tribalscholar \
  -e POSTGRES_DB=tribalscholar_db \
  -p 5432:5432 \
  postgres:15-alpine
```

### Option B: Run Migrations with Alembic

From the `backend/` directory:

```bash
cd backend

# Apply migrations to head
alembic upgrade head

# Check current revision
alembic current
```

### Option C: Direct SQL Execution (Supabase / psql)

You can execute the pre-generated DDL directly without Python:

```bash
psql -U tribalscholar -d tribalscholar_db -f database/migrations/001_initial_schema.sql
```

---

## 6. Demo Seed Scenarios

To populate the database with the **5 canonical SIH demo scenarios** and admin account:

```bash
python -m app.db.seed
```

### Seed Scenario Summary

| Scenario | Applicant Name | Category | Status | Highlights / Verification Outcome |
|---|---|---|---|---|
| **Scenario 1** | Sunita Soren | ST (Santal) | `approved` | All 5 documents uploaded, income ₹1.2L <= ₹2.5L limit, 0 deficiencies. Fully approved. |
| **Scenario 2** | Rahul Munda | ST (Munda) | `deficient` | 4 of 5 documents uploaded. `admission_letter` missing. Flagged as critical deficiency. |
| **Scenario 3** | Priya Lakra | ST (Oraon) | `deficient` | Form self-reports ₹1,80,000 income, but OCR-extracted income certificate shows ₹3,40,000 (> ₹2.5L limit). Critical mismatch flagged. |
| **Scenario 4** | Deepak Kumar Tirkey | ST (Kharia) | `deficient` | Caste certificate has slight spelling variation ("Dipak K. Tirkey"). System generates a warning deficiency for human officer confirmation. |
| **Scenario 5** | Amit Verma | OBC | `rejected` | Self-reported and verified category is OBC. Post-Matric scheme strictly requires ST. System deterministically rejects. |

**Admin User:**
- Email: `admin@tribalscholar.demo`
- Name: `Dr. Anita Sharma`
- Role: `admin`

---

## 7. Database Reset Utility

To reset the database cleanly to the initial seeded state for demos:

```bash
python -m app.db.reset
```

This drops all tables in dependency order, recreates all schemas, and seeds fresh demo records in under 2 seconds.

---

## 8. Running Automated Tests

Run the test suite from `backend/`:

```bash
cd backend
pytest -v tests/test_db.py
```

Validates:
- All 12 tables and schemas
- Constraints (`CHECK`, `UNIQUE`, `NOT NULL`, `FOREIGN KEY`, `CASCADE`)
- Complete CRUD workflow
- Idempotent seed loading
- All 5 scenario correctness checks
