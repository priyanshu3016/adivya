# TribalScholar AI (ADIVYA) — Deficiency Codes & Handling Specification

**Module:** Verification Rules & Deficiency Management  
**Owner:** Person 4 (Database Engineer) & Person 5 (Verification Rules)  
**Status:** Approved & Implemented  
**Date:** 2026-09-28  

---

## 1. Overview

During scholarship processing, the automated verification engine evaluates applicant data and OCR-extracted document records. Whenever a rule is breached, a document is missing, or contradictory data is detected, the engine generates an entry in the `deficiencies` database table.

Applications with unresolved deficiencies of severity `critical` are placed in the `deficient` status, requiring either applicant re-submission or administrative review.

---

## 2. Canonical Deficiency Types

| Deficiency Code | Name | Default Severity | Description | Triggers & Examples | Resolution Action |
|---|---|---|---|---|---|
| `missing_document` | Missing Required Document | `critical` | A document required by the scheme's `required_document_types` was not uploaded. | Scheme requires `admission_letter`, but applicant only provided 4 documents. | Applicant must upload the missing document. |
| `data_mismatch` | Form vs. Certificate Mismatch | `critical` | Declared application value conflicts with the value extracted from an official certificate. | Applicant declared income = ₹1,80,000, but income certificate OCR shows ₹3,40,000. | Applicant must explain discrepancy or upload updated certificate. |
| `name_mismatch` | Name Spelling Variation | `warning` | Fuzzy/phonetic match between profile name and certificate name is below 1.0 but above threshold (e.g. 0.75–0.99). | Profile: "Deepak Kumar Tirkey", Caste Cert: "Dipak K. Tirkey". | Flagged for officer visual inspection; admin can override or approve. |
| `invalid_data` | Invalid or Corrupted Data | `critical` | Extracted field fails formatting or structural validation (e.g., negative income, invalid date, malformed ID). | Certificate number has invalid characters or OCR confidence < 0.30. | Applicant must re-upload a clear, unblurred scan. |
| `expired_document` | Document Validity Expired | `critical` | The certificate issue date exceeds the scheme's validity window (e.g. income certificate older than 1 financial year). | Certificate issued 3 years ago for a 1-year annual income validity rule. | Applicant must provide currently valid certificate. |

---

## 3. Severity Levels

| Severity | Impact on Application Status | Can Auto-Approve? | Requires Officer Review? |
|---|---|---|---|
| `critical` | Application status set to `deficient` | ❌ No | ✅ Yes (blocks approval until resolved) |
| `warning` | Application status remains `under_review` or moves to `deficient` for manual review | ❌ No | ✅ Yes (admin can dismiss warning and approve) |
| `info` | Purely informational note; does not block pipeline | ✅ Yes | Optional |

---

## 4. Database Schema Mapping

When a deficiency is created via `crud.create_deficiency`, it is stored in the `deficiencies` table:

```sql
INSERT INTO deficiencies (
    id,
    application_id,
    document_id,        -- NULL if missing_document
    deficiency_type,    -- 'missing_document' | 'data_mismatch' | 'name_mismatch' | 'invalid_data' | 'expired_document'
    field_name,         -- e.g. 'annual_family_income', 'name', 'admission_letter'
    expected_value,     -- e.g. '180000'
    actual_value,       -- e.g. '340000'
    description,        -- Clear explanation in plain English
    severity,           -- 'critical' | 'warning' | 'info'
    is_resolved,        -- FALSE initially
    resolved_at,        -- NULL until resolved
    created_at
) VALUES (...);
```

---

## 5. Lifecycle & Resolution Flow

1. **Detection:** Automated verification rule fails during `under_review` processing.
2. **Deficiency Recorded:** Engine records deficiency and updates application status to `deficient`.
3. **Notification Generated:** System inserts a `Notification` with `notification_type='deficiency'` alerting the applicant.
4. **Resolution:**
   - **Applicant Action:** Applicant uploads corrected file or re-submits form.
   - **Admin Override:** Reviewing officer inspects document in `admin_reviews`, verifies authenticity, and marks `is_resolved=True`.
5. **Re-Verification:** Once all critical deficiencies have `is_resolved=True`, application status transitions to `verified`.
