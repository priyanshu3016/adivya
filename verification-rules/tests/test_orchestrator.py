"""
Integration tests for the verification orchestrator simulating all 5 seed scenarios.
"""
import unittest

from deficiency.codes import DeficiencyType, Severity
from verification.orchestrator import verify_application

POST_MATRIC_ST_SCHEME = {
    "required_document_types": [
        "income_certificate",
        "caste_certificate",
        "marksheet",
        "admission_letter",
        "identity_document",
    ],
    "max_income_limit": 250000.00,
    "required_category": "ST",
    "min_education_level": "undergraduate",
}

SEED_SCHEME_RULES = [
    {
        "rule_field": "category",
        "rule_operator": "eq",
        "rule_value": "ST",
        "error_message": "Applicant must belong to Scheduled Tribe (ST) category",
        "priority": 1,
        "is_active": True,
    },
    {
        "rule_field": "annual_family_income",
        "rule_operator": "le",
        "rule_value": "250000",
        "error_message": "Annual family income must not exceed ₹2,50,000",
        "priority": 2,
        "is_active": True,
    },
    {
        "rule_field": "current_education_level",
        "rule_operator": "in",
        "rule_value": "undergraduate,postgraduate",
        "error_message": "Education level must be undergraduate or postgraduate",
        "priority": 3,
        "is_active": True,
    },
]


class TestVerificationOrchestrator(unittest.TestCase):
    """Test full verification orchestrator against the 5 seed scenarios."""

    def test_scenario_1_sunita_soren_verified(self):
        """Sunita Soren: All 5 documents valid, matching data, all rules pass -> verified."""
        applicant = {
            "full_name": "Sunita Soren",
            "category": "ST",
            "annual_family_income": 120000.0,
            "tribe_name": "Santhal",
            "institution_name": "Ranchi University",
            "course_name": "B.Sc. Computer Science",
            "current_education_level": "undergraduate",
            "date_of_birth": "2003-05-15",
        }
        docs = {
            "income_certificate": {
                "document_id": "doc-s1-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "annual_income": 120000,
                    "certificate_number": "INC/2025/08921",
                    "issue_date": "2025-06-10",
                },
            },
            "caste_certificate": {
                "document_id": "doc-s1-2",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "certificate_number": "CST/2023/11402",
                    "category": "ST",
                    "tribe_name": "Santhal",
                    "issue_date": "2023-01-15",
                },
            },
            "marksheet": {
                "document_id": "doc-s1-3",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "institution": "St. Xavier's College, Ranchi",
                    "total_marks": 500,
                    "marks_obtained": 412,
                    "percentage": 82.4,
                },
            },
            "admission_letter": {
                "document_id": "doc-s1-4",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "institution": "Ranchi University",
                    "admission_date": "2025-07-01",
                },
            },
            "identity_document": {
                "document_id": "doc-s1-5",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "id_type": "aadhaar",
                    "id_number": "987654321098",
                },
            },
        }

        report = verify_application(applicant, POST_MATRIC_ST_SCHEME, SEED_SCHEME_RULES, docs, "app-1")

        self.assertEqual(report.overall_status, "verified")
        self.assertEqual(len(report.deficiencies), 0)
        self.assertFalse(report.requires_manual_review)
        self.assertIn("passed successfully", report.summary)

    def test_scenario_2_rahul_munda_missing_document(self):
        """Rahul Munda: Missing admission_letter -> deficient (missing_document, critical)."""
        applicant = {
            "full_name": "Rahul Munda",
            "category": "ST",
            "annual_family_income": 95000.0,
            "tribe_name": "Munda",
            "institution_name": "Birsa Institute of Technology, Sindri",
            "course_name": "B.Tech Mechanical Engineering",
            "current_education_level": "undergraduate",
            "date_of_birth": "2002-11-20",
        }
        docs = {
            "income_certificate": {
                "document_id": "doc-r-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Rahul Munda",
                    "annual_income": 95000,
                    "certificate_number": "INC/2025/04312",
                    "issue_date": "2025-05-18",
                },
            },
            "caste_certificate": {
                "document_id": "doc-r-2",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Rahul Munda",
                    "certificate_number": "CST/2022/08761",
                    "category": "ST",
                    "tribe_name": "Munda",
                    "issue_date": "2022-08-20",
                },
            },
            "marksheet": {
                "document_id": "doc-r-3",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Rahul Munda",
                    "percentage": 76.8,
                },
            },
            "identity_document": {
                "document_id": "doc-r-4",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Rahul Munda",
                    "id_type": "aadhaar",
                    "id_number": "876543210987",
                },
            },
            # admission_letter is missing!
        }

        report = verify_application(applicant, POST_MATRIC_ST_SCHEME, SEED_SCHEME_RULES, docs, "app-2")

        self.assertEqual(report.overall_status, "deficient")
        self.assertGreaterEqual(len(report.deficiencies), 1)
        missing_defs = [d for d in report.deficiencies if d["deficiency_type"] == DeficiencyType.MISSING_DOCUMENT.value]
        self.assertEqual(len(missing_defs), 1)
        self.assertEqual(missing_defs[0]["severity"], Severity.CRITICAL.value)
        self.assertIn("admission_letter", missing_defs[0]["description"])

    def test_scenario_3_priya_lakra_income_mismatch(self):
        """Priya Lakra: Income mismatch declared ₹1,80,000 vs certificate ₹3,40,000 -> deficient (data_mismatch, critical)."""
        applicant = {
            "full_name": "Priya Lakra",
            "category": "ST",
            "annual_family_income": 180000.0,
            "tribe_name": "Oraon",
            "institution_name": "National Institute of Technology, Jamshedpur",
            "course_name": "MCA",
            "current_education_level": "postgraduate",
            "date_of_birth": "2001-08-08",
        }
        docs = {
            "income_certificate": {
                "document_id": "doc-p-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Priya Lakra",
                    "annual_income": 340000,  # Mismatch!
                    "certificate_number": "INC/2025/11234",
                    "issue_date": "2025-04-12",
                },
            },
            "caste_certificate": {
                "document_id": "doc-p-2",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Priya Lakra",
                    "certificate_number": "CST/2021/04512",
                    "category": "ST",
                    "tribe_name": "Oraon",
                    "issue_date": "2021-11-10",
                },
            },
            "marksheet": {
                "document_id": "doc-p-3",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Priya Lakra",
                    "percentage": 88.2,
                },
            },
            "admission_letter": {
                "document_id": "doc-p-4",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Priya Lakra",
                    "institution": "National Institute of Technology, Jamshedpur",
                },
            },
            "identity_document": {
                "document_id": "doc-p-5",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Priya Lakra",
                    "id_type": "aadhaar",
                    "id_number": "765432109876",
                },
            },
        }

        report = verify_application(applicant, POST_MATRIC_ST_SCHEME, SEED_SCHEME_RULES, docs, "app-3")

        self.assertEqual(report.overall_status, "deficient")
        self.assertGreaterEqual(len(report.deficiencies), 1)
        income_defs = [
            d for d in report.deficiencies
            if d["deficiency_type"] == DeficiencyType.DATA_MISMATCH.value and d.get("field_name") == "annual_family_income"
        ]
        self.assertEqual(len(income_defs), 1)
        self.assertEqual(income_defs[0]["severity"], Severity.CRITICAL.value)
        self.assertIn("180,000", income_defs[0]["description"])
        self.assertIn("340,000", income_defs[0]["description"])

    def test_scenario_4_deepak_tirkey_name_variation(self):
        """Deepak Kumar Tirkey: 'Deepak Kumar Tirkey' vs 'Dipak K. Tirkey' -> deficient (warning, manual review)."""
        applicant = {
            "full_name": "Deepak Kumar Tirkey",
            "category": "ST",
            "annual_family_income": 140000.0,
            "tribe_name": "Kharia",
            "institution_name": "DSPMU, Ranchi",
            "course_name": "B.A. Political Science",
            "current_education_level": "undergraduate",
            "date_of_birth": "2004-03-25",
        }
        docs = {
            "income_certificate": {
                "document_id": "doc-d-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Deepak Kumar Tirkey",
                    "annual_income": 140000,
                    "certificate_number": "INC/2025/06789",
                    "issue_date": "2025-05-22",
                },
            },
            "caste_certificate": {
                "document_id": "doc-d-2",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Deepak Kumar Tirkey",
                    "certificate_number": "CST/2023/09871",
                    "category": "ST",
                    "tribe_name": "Kharia",
                    "issue_date": "2023-04-18",
                },
            },
            "marksheet": {
                "document_id": "doc-d-3",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Dipak K. Tirkey",  # Name variation!
                    "percentage": 69.4,
                },
            },
            "admission_letter": {
                "document_id": "doc-d-4",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Deepak Kumar Tirkey",
                    "institution": "DSPMU, Ranchi",
                },
            },
            "identity_document": {
                "document_id": "doc-d-5",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Deepak Kumar Tirkey",
                    "id_type": "aadhaar",
                    "id_number": "654321098765",
                },
            },
        }

        report = verify_application(applicant, POST_MATRIC_ST_SCHEME, SEED_SCHEME_RULES, docs, "app-4")

        self.assertEqual(report.overall_status, "deficient")
        self.assertTrue(report.requires_manual_review)
        name_defs = [
            d for d in report.deficiencies
            if d["deficiency_type"] == DeficiencyType.NAME_MISMATCH.value
        ]
        self.assertEqual(len(name_defs), 1)
        # Invariant: name variations are warning severity, not critical
        self.assertEqual(name_defs[0]["severity"], Severity.WARNING.value)
        self.assertIn("officer review", name_defs[0]["description"])

    def test_scenario_5_amit_verma_ineligible_rejected(self):
        """Amit Verma: Category OBC vs required ST -> rejected, 0 deficiencies."""
        applicant = {
            "full_name": "Amit Verma",
            "category": "OBC",  # Ineligible for ST scheme!
            "annual_family_income": 200000.0,
            "tribe_name": None,
            "institution_name": "Ranchi Women's College",
            "course_name": "B.Com",
            "current_education_level": "undergraduate",
            "date_of_birth": "2003-09-12",
        }
        docs = {
            "income_certificate": {
                "document_id": "doc-a-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Amit Verma",
                    "annual_income": 200000,
                    "certificate_number": "INC/2025/01245",
                    "issue_date": "2025-06-01",
                },
            },
            "caste_certificate": {
                "document_id": "doc-a-2",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Amit Verma",
                    "certificate_number": "CST/2024/05678",
                    "category": "OBC",
                    "issue_date": "2024-03-10",
                },
            },
            "marksheet": {
                "document_id": "doc-a-3",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Amit Verma",
                    "percentage": 74.0,
                },
            },
            "admission_letter": {
                "document_id": "doc-a-4",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Amit Verma",
                    "institution": "Ranchi University",
                },
            },
            "identity_document": {
                "document_id": "doc-a-5",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Amit Verma",
                    "id_type": "aadhaar",
                    "id_number": "543210987654",
                },
            },
        }

        report = verify_application(applicant, POST_MATRIC_ST_SCHEME, SEED_SCHEME_RULES, docs, "app-5")

        self.assertEqual(report.overall_status, "rejected")
        self.assertIn("rejected", report.summary.lower())

    def test_multiple_deficiencies(self):
        """Applicant with missing doc AND income mismatch has multiple deficiencies."""
        applicant = {
            "full_name": "Test Student",
            "category": "ST",
            "annual_family_income": 100000.0,
            "current_education_level": "undergraduate",
        }
        docs = {
            "income_certificate": {
                "document_id": "doc-m-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Test Student",
                    "annual_income": 300000,  # Mismatch
                },
            }
            # Missing remaining 4 documents
        }
        report = verify_application(applicant, POST_MATRIC_ST_SCHEME, SEED_SCHEME_RULES, docs, "app-multi")
        self.assertEqual(report.overall_status, "deficient")
        self.assertGreaterEqual(len(report.deficiencies), 2)


if __name__ == "__main__":
    unittest.main()
