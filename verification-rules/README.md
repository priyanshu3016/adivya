# TribalScholar AI — Verification & Eligibility Engine (Person 6)

## Overview

The `verification-rules` module is the automated, deterministic, and auditable verification engine of **TribalScholar AI (ADIVYA)**. It processes scholarship applications submitted by tribal students, comparing applicant declarations against extracted document data, validating eligibility against configurable scheme rules, and generating structured deficiency items when issues are found.

> **Zero LLM Policy**: All matching, comparisons, and rule evaluations in this pipeline are strictly deterministic, transparent, and explainable. No generative models or hallucinations are permitted in the adjudication pipeline.

---

## Directory Structure

```
verification-rules/
├── README.md                          # Documentation (this file)
├── service.py                         # Database integration service (bridges DB and orchestrator)
├── deficiency/                        # Canonical deficiency definitions & templates
│   ├── __init__.py
│   ├── codes.py                       # Enums mirroring DB CHECK constraints
│   └── templates.py                   # Deterministic deficiency description rendering
├── eligibility/                       # Scheme rule operator evaluation engine
│   ├── __init__.py
│   ├── operators.py                   # 8 deterministic operators (eq, ne, lt, le, gt, ge, in, contains)
│   └── evaluator.py                   # Scheme rule evaluator ordered by priority ASC
├── verification/                      # Core verification logic
│   ├── __init__.py
│   ├── models.py                      # Pure Python dataclasses for reports & outcomes
│   ├── name_matcher.py                # Deterministic name matching & initials variation support
│   ├── field_comparators.py           # Income, category, marks, and date comparators
│   ├── document_checker.py            # Document completeness & integrity checker
│   └── orchestrator.py                # Stateless verification orchestrator
└── tests/                             # Comprehensive test suite (30+ test cases)
    ├── __init__.py
    ├── conftest.py                    # Path configuration and test fixtures
    ├── test_templates.py              # Deficiency codes & template tests
    ├── test_name_matcher.py           # Name matching unit tests
    ├── test_field_comparators.py      # Field comparator unit tests
    ├── test_document_checker.py       # Document completeness unit tests
    ├── test_eligibility.py            # Operator & scheme rule evaluator unit tests
    ├── test_orchestrator.py           # Integration tests for 5 demo scenarios
    └── test_service.py                # End-to-end database integration tests
```

---

## Key Invariants & Safety Guarantees

1. **Database Constraint Adherence**:
   - `deficiency_type` values strictly adhere to: `'missing_document'`, `'data_mismatch'`, `'name_mismatch'`, `'invalid_data'`, `'expired_document'`.
   - `severity` values strictly adhere to: `'critical'`, `'warning'`, `'info'`.
   - `check_type` values strictly adhere to: `'eligibility'`, `'document'`, `'cross_field'`.
   - `result` values strictly adhere to: `'pass'`, `'fail'`, `'warning'`.
   - Application status is set **only** to `'verified'`, `'deficient'`, or `'rejected'`. **Never `'approved'`** (approval is reserved exclusively for authorized officers via `AdminReview`).

2. **Name Variations Never Reject Automatically**:
   - Minor typos or initials differences (e.g. *"Deepak Kumar Tirkey"* vs *"Dipak K. Tirkey"*) produce `MatchOutcome.POTENTIAL_MATCH`.
   - `POTENTIAL_MATCH` **always** results in `severity="warning"`, flagging the application for manual review by an officer rather than auto-rejecting.

3. **Stateless Core**:
   - The orchestrator (`verification/orchestrator.py`) is pure, stateless Python with zero database dependencies.
   - `service.py` is the isolated boundary that reads database models and persists results via `app.db.crud`.

---

## Running Tests

From the project root:

```bash
python -m pytest verification-rules/tests/ -v
```

All tests execute against pure dataclasses or SQLite in-memory databases with foreign keys enabled.
