"""Integration tests for Document AI pipeline."""

import json
import os
import unittest

from document_ai import process_document, process_document_from_text
from document_ai.models import ExtractionResult


class TestPipeline(unittest.TestCase):
    """Integration test suite for document processing pipeline."""

    @classmethod
    def setUpClass(cls):
        cls.sample_dir = os.path.join(os.path.dirname(__file__), "sample_texts")

    def _read_sample(self, filename: str) -> str:
        path = os.path.join(self.sample_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def test_from_text_income(self):
        text = self._read_sample("income_certificate.txt")
        result = process_document_from_text(text, document_id="INC-001")

        self.assertIsInstance(result, ExtractionResult)
        self.assertEqual(result.document_id, "INC-001")
        self.assertEqual(result.document_type, "income_certificate")
        self.assertIn(result.extraction_status, ("success", "partial"))
        self.assertIsNotNone(result.fields["name"])
        self.assertIn("Ramesh Kumar Murmu", result.fields["name"])
        # Annual income should be normalized to float 120000.0
        self.assertEqual(result.fields["annual_income"], 120000.0)
        self.assertEqual(result.fields["certificate_number"], "INC/2023/8921")
        # Issue date should be normalized to ISO YYYY-MM-DD
        self.assertEqual(result.fields["issue_date"], "2023-07-15")
        self.assertIsNone(result.ocr_confidence)

    def test_from_text_empty(self):
        result = process_document_from_text("", document_id="EMPTY-001")
        self.assertEqual(result.extraction_status, "manual_review")
        self.assertIn("Empty document text", result.errors)

        result_none = process_document_from_text(None, document_id="NONE-001")
        self.assertEqual(result_none.extraction_status, "manual_review")

    def test_from_text_all_types(self):
        cases = [
            ("income_certificate.txt", "income_certificate"),
            ("caste_certificate.txt", "caste_certificate"),
            ("marksheet.txt", "marksheet"),
            ("admission_letter.txt", "admission_letter"),
            ("identity_document.txt", "identity_document"),
        ]
        for filename, expected_type in cases:
            text = self._read_sample(filename)
            result = process_document_from_text(text, document_id=f"TEST-{expected_type}")
            self.assertEqual(
                result.document_type,
                expected_type,
                f"Failed detection for {filename}",
            )
            self.assertIn(result.extraction_status, ("success", "partial"))

    def test_from_text_explicit_override(self):
        # Override document type explicitly
        text = self._read_sample("income_certificate.txt")
        result = process_document_from_text(
            text,
            document_id="OVERRIDE-001",
            document_type="income_certificate",
        )
        self.assertEqual(result.document_type, "income_certificate")
        self.assertEqual(result.extraction_status, "success")

    def test_process_document_missing_file(self):
        result = process_document("/nonexistent/image.jpg", document_id="DOC-MISSING")
        self.assertIsInstance(result, ExtractionResult)
        self.assertEqual(result.extraction_status, "failed")
        self.assertTrue(any("not found" in err.lower() for err in result.errors))
        self.assertIsNone(result.ocr_confidence)

    def test_process_document_unsupported_extension(self):
        result = process_document("some_document.pdf", document_id="DOC-PDF")
        self.assertIsInstance(result, ExtractionResult)
        self.assertEqual(result.extraction_status, "failed")

    def test_serialization(self):
        text = self._read_sample("income_certificate.txt")
        result = process_document_from_text(text, document_id="JSON-001")
        result_dict = result.to_dict()

        self.assertIsInstance(result_dict, dict)
        self.assertEqual(result_dict["document_id"], "JSON-001")
        self.assertEqual(result_dict["document_type"], "income_certificate")

        # Must be JSON serializable without error
        json_output = json.dumps(result_dict)
        self.assertIsInstance(json_output, str)
        parsed = json.loads(json_output)
        self.assertEqual(parsed["document_id"], "JSON-001")


if __name__ == "__main__":
    unittest.main()
