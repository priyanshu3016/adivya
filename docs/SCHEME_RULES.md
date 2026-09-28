# TribalScholar AI (ADIVYA) — Scheme Eligibility Rules Specification

**Module:** Verification Rules Engine & Scheme Administration  
**Owner:** Person 4 (Database Engineer) & Person 5 (Verification Rules)  
**Status:** Approved & Implemented  
**Date:** 2026-09-28  

---

## 1. Overview

Each scholarship or fellowship scheme defines deterministic eligibility rules stored in the `scheme_rules` table. These rules allow administrators to configure dynamic criteria without modifying application code.

The backend verification engine evaluates these rules in priority order against the applicant's profile and application data.

---

## 2. Supported Rule Operators

| Operator Code | Operation | Target Data Types | Description & Example |
|---|---|---|---|
| `eq` | Equal to | String, Numeric, Boolean | Exact match (e.g., `category eq 'ST'`) |
| `ne` | Not equal to | String, Numeric, Boolean | Negated match (e.g., `state ne 'Restricted'`) |
| `lt` | Less than | Numeric, Date | Strict upper bound (e.g., `age lt 30`) |
| `le` | Less than or equal to | Numeric, Date | Inclusive upper bound (e.g., `annual_family_income le 250000`) |
| `gt` | Greater than | Numeric, Date | Strict lower bound (e.g., `percentage gt 60.0`) |
| `ge` | Greater than or equal to | Numeric, Date | Inclusive lower bound (e.g., `percentage ge 50.0`) |
| `in` | Set membership | Comma-separated Strings | Value exists in comma-separated list (e.g., `current_education_level in 'undergraduate,postgraduate'`) |
| `contains` | Substring / Array element | String, Array | String contains substring or array contains item |

---

## 3. Seed Rules for Demonstration

### Scheme: *Post-Matric Scholarship for ST Students*
- **ID:** `00000000-0000-0001-0000-000000000001`
- **Max Income Limit:** ₹2,50,000.00
- **Category:** ST
- **Award Amount:** ₹50,000.00
- **Required Documents:** `income_certificate`, `caste_certificate`, `marksheet`, `admission_letter`, `identity_document`

#### Configured Rules in `scheme_rules`:

```sql
-- Rule 1: Scheduled Tribe Category Requirement
INSERT INTO scheme_rules (
    id, scheme_id, rule_field, rule_operator, rule_value, 
    error_message, priority, is_active
) VALUES (
    '00000000-0000-0002-0000-000000000001',
    '00000000-0000-0001-0000-000000000001',
    'category',
    'eq',
    'ST',
    'Applicant must belong to Scheduled Tribe category',
    1,
    true
);

-- Rule 2: Annual Family Income Ceiling
INSERT INTO scheme_rules (
    id, scheme_id, rule_field, rule_operator, rule_value, 
    error_message, priority, is_active
) VALUES (
    '00000000-0000-0002-0000-000000000002',
    '00000000-0000-0001-0000-000000000001',
    'annual_family_income',
    'le',
    '250000',
    'Annual family income must not exceed ₹2,50,000',
    2,
    true
);

-- Rule 3: Higher Education Level Requirement
INSERT INTO scheme_rules (
    id, scheme_id, rule_field, rule_operator, rule_value, 
    error_message, priority, is_active
) VALUES (
    '00000000-0000-0002-0000-000000000003',
    '00000000-0000-0001-0000-000000000001',
    'current_education_level',
    'in',
    'undergraduate,postgraduate',
    'Applicant must be pursuing higher education',
    3,
    true
);
```

---

## 4. Evaluation Engine Contract

When evaluating an application:
1. Query active rules for `scheme_id` ordered by `priority ASC`.
2. Extract the field value from `Applicant` profile or application form data.
3. Compare using `rule_operator`:
   - Cast string `rule_value` to `float`/`Decimal` for numeric comparisons (`lt`, `le`, `gt`, `ge`).
   - Split comma-separated string for `in` operator.
4. Record every evaluation result into `verification_results`:
   - If condition met: record with `result='pass'`.
   - If condition failed: record with `result='fail'`, `message=error_message`.
5. If any rule fails:
   - For hard eligibility constraints (e.g. Category), set application status to `rejected`.
   - For fixable data issues, record a deficiency and transition to `deficient`.
