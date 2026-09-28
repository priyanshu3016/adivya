"""Unit tests for document extractors."""

import os
import unittest
from document_ai.extractors import get_extractor
from document_ai.extractors.income_certificate import IncomeCertificateExtractor


class TestExtractors(unittest.TestCase):
    """Test suite for document field extractors."""

    @classmethod
    def setUpClass(cls):
        cls.sample_dir = os.path.join(os.path.dirname(__file__), "sample_texts")

    def _read_sample(self, filename: str) -> str:
        path = os.path.join(self.sample_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def test_income_certificate_registration(self):
        extractor = get_extractor("income_certificate")
        self.assertIsNotNone(extractor)
        self.assertIsInstance(extractor, IncomeCertificateExtractor)
        self.assertEqual(extractor.document_type, "income_certificate")
        self.assertEqual(
            extractor.required_fields,
            ["name", "annual_income", "certificate_number", "issue_date"],
        )

    def test_income_extract(self):
        text = self._read_sample("income_certificate.txt")
        extractor = get_extractor("income_certificate")
        fields = extractor.extract(text)

        self.assertIsNotNone(fields["name"])
        self.assertIn("Ramesh Kumar Murmu", fields["name"])
        self.assertIsNotNone(fields["annual_income"])
        self.assertEqual(fields["annual_income"], "1,20,000")
        self.assertIsNotNone(fields["certificate_number"])
        self.assertEqual(fields["certificate_number"], "INC/2023/8921")
        self.assertIsNotNone(fields["issue_date"])
        self.assertEqual(fields["issue_date"], "15/07/2023")

    def test_income_empty(self):
        extractor = get_extractor("income_certificate")
        fields = extractor.extract("")
        self.assertIsNone(fields["name"])
        self.assertIsNone(fields["annual_income"])
        self.assertIsNone(fields["certificate_number"])
        self.assertIsNone(fields["issue_date"])

    def test_caste_certificate_registration(self):
        extractor = get_extractor("caste_certificate")
        self.assertIsNotNone(extractor)
        self.assertEqual(extractor.document_type, "caste_certificate")
        self.assertEqual(
            extractor.required_fields,
            ["name", "certificate_number", "category", "issue_date"],
        )

    def test_caste_extract(self):
        text = self._read_sample("caste_certificate.txt")
        extractor = get_extractor("caste_certificate")
        fields = extractor.extract(text)

        self.assertIsNotNone(fields["name"])
        self.assertIn("Rajesh Marandi", fields["name"])
        self.assertEqual(fields["category"], "ST")
        self.assertIsNotNone(fields["tribe_name"])
        self.assertIn("Santal", fields["tribe_name"])
        self.assertEqual(fields["certificate_number"], "CST-JH-2022-4412")
        self.assertEqual(fields["issue_date"], "12/04/2022")

    def test_caste_empty(self):
        extractor = get_extractor("caste_certificate")
        fields = extractor.extract("")
        self.assertIsNone(fields["name"])
        self.assertIsNone(fields["certificate_number"])
        self.assertIsNone(fields["category"])
        self.assertIsNone(fields["tribe_name"])
        self.assertIsNone(fields["issue_date"])


if __name__ == "__main__":
    unittest.main()
