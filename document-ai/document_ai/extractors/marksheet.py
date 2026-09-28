"""Marksheet field extractor."""

import re
from typing import Dict, List, Optional

from document_ai.extractors import register_extractor
from document_ai.extractors.base import BaseExtractor


@register_extractor
class MarksheetExtractor(BaseExtractor):
    """Extracts fields from marksheet and grade card OCR text."""

    @property
    def document_type(self) -> str:
        return "marksheet"

    @property
    def required_fields(self) -> List[str]:
        return ["name"]

    def extract(self, text: Optional[str]) -> Dict[str, Optional[str]]:
        """Extract name, institution, course, total_marks, marks_obtained, percentage, academic_year."""
        fields: Dict[str, Optional[str]] = {
            "name": None,
            "institution": None,
            "course": None,
            "total_marks": None,
            "marks_obtained": None,
            "percentage": None,
            "academic_year": None,
        }

        if not text:
            return fields

        name_patterns = [
            r"(?:name\s*(?:of\s*(?:student|candidate))?)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\s+roll|\s+enroll|\n|$)",
            r"(?:student\s*name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
        ]

        institution_patterns = [
            r"^([A-Z][A-Z\s]+(?:UNIVERSITY|COLLEGE|INSTITUTE|BOARD|ACADEMY))",
            r"(?:institution|college|university)\s*[:\-]?\s*([A-Za-z\s]+?)(?:,|\n|$)",
        ]

        course_patterns = [
            r"(?:course|programme?|degree|branch)\s*[:\-]?\s*([A-Za-z\s\.\(\)]+?)(?:,|\n|$)",
            r"(?:examination|exam)\s*[:\-]?\s*([A-Za-z0-9\s\.\(\)]+?)(?:,|\n|$)",
        ]

        total_marks_patterns = [
            r"(?:total\s*marks|maximum\s*marks|max\s*marks)\s*[:\-]?\s*(\d+)",
        ]

        marks_obtained_patterns = [
            r"(?:marks\s*obtained|total\s*secured|secured\s*marks)\s*[:\-]?\s*(\d+)",
        ]

        percentage_patterns = [
            r"(?:percentage|percent)\s*[:\-]?\s*([\d\.]+)\s*%?",
            r"(?:aggregate)\s*[:\-]?\s*([\d\.]+)\s*%?",
        ]

        academic_year_patterns = [
            r"(?:academic\s*year|session)\s*[:\-]?\s*(\d{4}\s*[\-/]\s*\d{2,4})",
            r"(?:year\s*of\s*passing|year)\s*[:\-]?\s*(\d{4})",
        ]

        fields["name"] = self._match_first(name_patterns, text)
        fields["institution"] = self._match_first(institution_patterns, text, flags=re.MULTILINE)
        fields["course"] = self._match_first(course_patterns, text)
        fields["total_marks"] = self._match_first(total_marks_patterns, text)
        fields["marks_obtained"] = self._match_first(marks_obtained_patterns, text)
        fields["percentage"] = self._match_first(percentage_patterns, text)
        fields["academic_year"] = self._match_first(academic_year_patterns, text)

        return fields

    def _match_first(self, patterns: List[str], text: str, flags: int = 0) -> Optional[str]:
        combined_flags = re.IGNORECASE | flags
        for pattern in patterns:
            match = re.search(pattern, text, combined_flags)
            if match:
                val = match.group(1).strip()
                if val:
                    return val
        return None
