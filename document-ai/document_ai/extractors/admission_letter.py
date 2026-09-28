"""Admission letter field extractor."""

import re
from typing import Dict, List, Optional

from document_ai.extractors import register_extractor
from document_ai.extractors.base import BaseExtractor


@register_extractor
class AdmissionLetterExtractor(BaseExtractor):
    """Extracts fields from admission letter OCR text."""

    @property
    def document_type(self) -> str:
        return "admission_letter"

    @property
    def required_fields(self) -> List[str]:
        return ["name", "institution"]

    def extract(self, text: Optional[str]) -> Dict[str, Optional[str]]:
        """Extract name, institution, course, admission_date, and reference_number."""
        fields: Dict[str, Optional[str]] = {
            "name": None,
            "institution": None,
            "course": None,
            "admission_date": None,
            "reference_number": None,
        }

        if not text:
            return fields

        name_patterns = [
            r"(?:dear|mr\.|ms\.|shri|smt)\s*\.?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
            r"(?:name\s*(?:of\s*(?:student|candidate))?)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
            r"(?:candidate\s*name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
        ]

        institution_patterns = [
            r"^([A-Z][A-Z\t ]*(?:UNIVERSITY|COLLEGE|INSTITUTE|ACADEMY|BOARD)[A-Z\t ]*)",
            r"(?:institution|university|college|institute)\s*[:\-]?\s*([A-Za-z\s]+?)(?:,|\n|$)",
        ]

        course_patterns = [
            r"(?:admitted\s+to|course|programme?|degree)\s*[:\-]?\s*([A-Za-z\s\.\(\)]+?)(?:,|\.|\n|$)",
            r"(?:branch|discipline)\s*[:\-]?\s*([A-Za-z\s\.\(\)]+?)(?:,|\.|\n|$)",
        ]

        date_patterns = [
            r"(?:date\s*(?:of\s*issue)?|admission\s*date|enrollment\s*date|dated)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
            r"(?:reporting\s*date)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
        ]

        reference_patterns = [
            r"(?:ref(?:erence)?\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-/]+)",
            r"(?:application\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-/]+)",
        ]

        fields["name"] = self._match_first(name_patterns, text)
        fields["institution"] = self._match_first(institution_patterns, text, flags=re.MULTILINE)
        fields["course"] = self._match_first(course_patterns, text)
        fields["admission_date"] = self._match_first(date_patterns, text)
        fields["reference_number"] = self._match_first(reference_patterns, text)

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
