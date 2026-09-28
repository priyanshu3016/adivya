# Database Seeds

This directory documents and references the synthetic seed data for the 5 demo scenarios:

1. **Scenario 1 — Valid Applicant (Full Approval):** Sunita Soren (ST - Santal)
2. **Scenario 2 — Missing Document:** Rahul Munda (ST - Munda)
3. **Scenario 3 — Income Mismatch:** Priya Lakra (ST - Oraon)
4. **Scenario 4 — Name Mismatch / Warning:** Deepak Kumar Tirkey (ST - Kharia)
5. **Scenario 5 — Ineligible Applicant:** Amit Verma (OBC)

### Running Seed Data

From the project root:

```bash
# Via backend module
python -m app.db.seed

# Or full reset & re-seed
python -m app.db.reset
```

The primary seed implementation lives at [`backend/app/db/seed.py`](file:///Users/dev/Desktop/TribalScholar-AI/backend/app/db/seed.py).
