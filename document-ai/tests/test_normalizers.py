"""Unit tests for field normalizers."""

import unittest
from document_ai.normalizers import (
    normalize_certificate_number,
    normalize_date,
    normalize_id_number,
    normalize_income,
    normalize_marks,
    normalize_name,
    normalize_percentage,
)


class TestNormalizers(unittest.TestCase):

    def test_normalize_income(self):
        self.assertEqual(normalize_income("Rs. 4,80,000"), 480000)
        self.assertEqual(normalize_income("4.8 lakh"), 480000)
        self.assertEqual(normalize_income("4.8 Lakhs"), 480000)
        self.assertEqual(normalize_income("₹4,80,000"), 480000)
        self.assertEqual(normalize_income("480000"), 480000)
        self.assertEqual(normalize_income("4,80,000/-"), 480000)
        self.assertEqual(normalize_income("Rs 2.5 lakh"), 250000)
        self.assertIsNone(normalize_income("invalid"))
        self.assertIsNone(normalize_income(None))
        self.assertIsNone(normalize_income(""))

    def test_normalize_date(self):
        self.assertEqual(normalize_date("12/08/2026"), "2026-08-12")
        self.assertEqual(normalize_date("2026-08-12"), "2026-08-12")
        self.assertEqual(normalize_date("12-08-2026"), "2026-08-12")
        self.assertEqual(normalize_date("12.08.2026"), "2026-08-12")
        self.assertEqual(normalize_date("2026/08/12"), "2026-08-12")
        self.assertIsNone(normalize_date("garbage"))
        self.assertIsNone(normalize_date(None))
        self.assertIsNone(normalize_date("32/08/2026"))
        self.assertIsNone(normalize_date("12/13/2026"))

    def test_normalize_name(self):
        self.assertEqual(normalize_name("  rahul   kumar  "), "Rahul Kumar")
        self.assertEqual(normalize_name(":- shri rahul kumar -"), "Shri Rahul Kumar")
        self.assertIsNone(normalize_name(""))
        self.assertIsNone(normalize_name("a"))
        self.assertIsNone(normalize_name(None))

    def test_normalize_percentage(self):
        self.assertEqual(normalize_percentage("85.5%"), 85.5)
        self.assertEqual(normalize_percentage("85.5"), 85.5)
        self.assertIsNone(normalize_percentage("105"))
        self.assertIsNone(normalize_percentage("-5%"))
        self.assertIsNone(normalize_percentage("abc"))
        self.assertIsNone(normalize_percentage(None))

    def test_normalize_marks(self):
        self.assertEqual(normalize_marks("450"), 450)
        self.assertEqual(normalize_marks("  500  "), 500)
        self.assertIsNone(normalize_marks("-5"))
        self.assertIsNone(normalize_marks("abc"))
        self.assertIsNone(normalize_marks(None))

    def test_normalize_certificate_number(self):
        self.assertEqual(normalize_certificate_number("  inc/2026/12345.  "), "INC/2026/12345")
        self.assertEqual(normalize_certificate_number("cert-999"), "CERT-999")
        self.assertIsNone(normalize_certificate_number(""))
        self.assertIsNone(normalize_certificate_number(None))

    def test_normalize_id_number(self):
        self.assertEqual(normalize_id_number("1234 5678 9012", "aadhaar"), "123456789012")
        self.assertEqual(normalize_id_number("123456789012", "aadhaar"), "123456789012")
        self.assertIsNone(normalize_id_number("12345", "aadhaar"))
        self.assertIsNone(normalize_id_number("1234 5678 901a", "aadhaar"))

        self.assertEqual(normalize_id_number("ABCDE1234F", "pan_card"), "ABCDE1234F")
        self.assertEqual(normalize_id_number("abcde1234f", "pan_card"), "ABCDE1234F")
        self.assertIsNone(normalize_id_number("ABCD12345F", "pan_card"))

        self.assertEqual(normalize_id_number("xyz-123", "voter_id"), "XYZ-123")
        self.assertIsNone(normalize_id_number(None, "aadhaar"))


if __name__ == "__main__":
    unittest.main()
