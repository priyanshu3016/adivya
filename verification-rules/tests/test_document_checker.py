"""
Unit tests for document completeness and integrity checking.
"""
import unittest

from verification.document_checker import check_documents

REQUIRED_5_DOCS = [
    "income_certificate",
    "caste_certificate",
    "marksheet",
    "admission_letter",
    "identity_document",
]


class TestDocumentChecker(unittest.TestCase):
    """Test suite for check_documents."""

    def test_all_five_documents_present_and_valid(self):
        docs = {
            "income_certificate": {
                "document_id": "doc-1",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "annual_income": 120000,
                    "certificate_number": "INC-2025-001",
                    "issue_date": "2025-05-10",
                },
            },
            "caste_certificate": {
                "document_id": "doc-2",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "certificate_number": "CST-2024-999",
                    "category": "ST",
                    "issue_date": "2024-06-15",
                },
            },
            "marksheet": {
                "document_id": "doc-3",
                "extraction_status": "success",
                "extracted_fields": {"name": "Sunita Soren", "percentage": 82.5},
            },
            "admission_letter": {
                "document_id": "doc-4",
                "extraction_status": "success",
                "extracted_fields": {"name": "Sunita Soren", "institution": "Ranchi University"},
            },
            "identity_document": {
                "document_id": "doc-5",
                "extraction_status": "success",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    "id_type": "aadhaar",
                    "id_number": "123456789012",
                },
            },
        }

        results = check_documents(REQUIRED_5_DOCS, docs)
        self.assertEqual(len(results), 5)
        for res in results:
            self.assertTrue(res.is_present)
            self.assertEqual(len(res.missing_fields), 0)
            self.assertEqual(len(res.issues), 0)

    def test_one_missing_document_rahul_scenario(self):
        # Rahul Munda scenario: admission_letter is missing
        docs = {
            "income_certificate": {"extraction_status": "success", "extracted_fields": {"name": "Rahul Munda", "annual_income": 95000, "certificate_number": "INC-1", "issue_date": "2025-01-01"}},
            "caste_certificate": {"extraction_status": "success", "extracted_fields": {"name": "Rahul Munda", "certificate_number": "CST-1", "category": "ST", "issue_date": "2025-01-01"}},
            "marksheet": {"extraction_status": "success", "extracted_fields": {"name": "Rahul Munda"}},
            "identity_document": {"extraction_status": "success", "extracted_fields": {"name": "Rahul Munda", "id_type": "aadhaar", "id_number": "987654321098"}},
        }
        results = check_documents(REQUIRED_5_DOCS, docs)
        res_map = {r.document_type: r for r in results}

        self.assertFalse(res_map["admission_letter"].is_present)
        self.assertIn("not uploaded", res_map["admission_letter"].issues[0])
        self.assertTrue(res_map["income_certificate"].is_present)

    def test_failed_extraction_status(self):
        docs = {
            "income_certificate": {
                "extraction_status": "failed",
                "extracted_fields": {},
                "errors": ["Corrupt PDF file"],
            }
        }
        results = check_documents(["income_certificate"], docs)
        self.assertEqual(len(results), 1)
        self.assertTrue(results[0].is_present)
        self.assertIn("failed", results[0].issues[0])
        self.assertTrue(any("Corrupt" in issue for issue in results[0].issues))

    def test_partial_extraction_missing_required_fields(self):
        docs = {
            "income_certificate": {
                "extraction_status": "partial",
                "extracted_fields": {
                    "name": "Sunita Soren",
                    # annual_income is missing!
                    "certificate_number": "INC-1",
                    "issue_date": "2025-01-01",
                },
            }
        }
        results = check_documents(["income_certificate"], docs)
        self.assertEqual(len(results), 1)
        self.assertIn("annual_income", results[0].missing_fields)
        self.assertTrue(len(results[0].issues) > 0)


if __name__ == "__main__":
    unittest.main()
