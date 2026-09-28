"""Unit tests for document type detection."""

import os
import unittest
from document_ai.type_detector import detect_document_type


class TestTypeDetector(unittest.TestCase):
    """Test suite for detect_document_type."""

    @classmethod
    def setUpClass(cls):
        cls.sample_dir = os.path.join(os.path.dirname(__file__), "sample_texts")

    def _read_sample(self, filename: str) -> str:
        path = os.path.join(self.sample_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def test_detect_income_certificate(self):
        text = self._read_sample("income_certificate.txt")
        result = detect_document_type(text)
        self.assertEqual(result.document_type, "income_certificate")
        self.assertEqual(result.confidence_level, "high")
        self.assertGreaterEqual(result.all_scores["income_certificate"], 5)

    def test_detect_caste_certificate(self):
        text = self._read_sample("caste_certificate.txt")
        result = detect_document_type(text)
        self.assertEqual(result.document_type, "caste_certificate")
        self.assertEqual(result.confidence_level, "high")
        self.assertGreaterEqual(result.all_scores["caste_certificate"], 5)

    def test_detect_marksheet(self):
        text = self._read_sample("marksheet.txt")
        result = detect_document_type(text)
        self.assertEqual(result.document_type, "marksheet")
        self.assertEqual(result.confidence_level, "high")
        self.assertGreaterEqual(result.all_scores["marksheet"], 5)

    def test_detect_admission_letter(self):
        text = self._read_sample("admission_letter.txt")
        result = detect_document_type(text)
        self.assertEqual(result.document_type, "admission_letter")
        self.assertEqual(result.confidence_level, "high")
        self.assertGreaterEqual(result.all_scores["admission_letter"], 5)

    def test_detect_identity_document(self):
        text = self._read_sample("identity_document.txt")
        result = detect_document_type(text)
        self.assertEqual(result.document_type, "identity_document")
        self.assertEqual(result.confidence_level, "high")
        self.assertGreaterEqual(result.all_scores["identity_document"], 5)

    def test_detect_empty_and_whitespace(self):
        result_empty = detect_document_type("")
        self.assertIsNone(result_empty.document_type)
        self.assertEqual(result_empty.confidence_level, "low")

        result_none = detect_document_type(None)
        self.assertIsNone(result_none.document_type)
        self.assertEqual(result_none.confidence_level, "low")

        result_space = detect_document_type("   \n\t  ")
        self.assertIsNone(result_space.document_type)
        self.assertEqual(result_space.confidence_level, "low")

    def test_detect_unrelated_text(self):
        unrelated = "The quick brown fox jumps over the lazy dog in the forest on a sunny day."
        result = detect_document_type(unrelated)
        self.assertIsNone(result.document_type)
        self.assertEqual(result.confidence_level, "low")

    def test_detect_ambiguous_text(self):
        # Text with equal high weights from both income and caste
        ambiguous = "annual income caste certificate"
        result = detect_document_type(ambiguous)
        self.assertIsNone(result.document_type)
        self.assertEqual(result.confidence_level, "low")


if __name__ == "__main__":
    unittest.main()
