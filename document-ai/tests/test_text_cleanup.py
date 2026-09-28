"""Unit tests for OCR text cleanup."""

import unittest
from document_ai.text_cleanup import cleanup_text


class TestTextCleanup(unittest.TestCase):

    def test_cleanup_basic_spacing(self):
        self.assertEqual(cleanup_text("  hello   world  "), "hello world")
        self.assertEqual(cleanup_text("a   b   c"), "a b c")

    def test_cleanup_multiline(self):
        self.assertEqual(cleanup_text("line1\n\n\n\nline2"), "line1\n\nline2")
        self.assertEqual(cleanup_text("  line1  \n  line2  "), "line1\nline2")

    def test_cleanup_empty_and_none(self):
        self.assertEqual(cleanup_text(""), "")
        self.assertEqual(cleanup_text(None), "")

    def test_cleanup_null_bytes(self):
        result = cleanup_text("hello\x00world")
        self.assertNotIn("\x00", result)
        self.assertEqual(result, "helloworld")

    def test_unicode_normalization(self):
        # Combining character decomposed -> normalized into NFC
        decomposed = "e\u0301"  # e + acute accent
        normalized = "é"
        self.assertEqual(cleanup_text(decomposed), normalized)


if __name__ == "__main__":
    unittest.main()
