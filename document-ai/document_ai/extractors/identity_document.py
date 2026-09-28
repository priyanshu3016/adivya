"""Identity document field extractor."""

import re
from typing import Dict, List, Optional

from document_ai.extractors import register_extractor
from document_ai.extractors.base import BaseExtractor


@register_extractor
class IdentityDocumentExtractor(BaseExtractor):
    """Extracts fields from identity documents (Aadhaar, Voter ID, PAN, etc.)."""

    @property
    def document_type(self) -> str:
        return "identity_document"

    @property
    def required_fields(self) -> List[str]:
        return ["name", "id_type", "id_number"]

    def extract(self, text: Optional[str]) -> Dict[str, Optional[str]]:
        """Extract name, id_type, id_number, and date_of_birth."""
        fields: Dict[str, Optional[str]] = {
            "name": None,
            "id_type": None,
            "id_number": None,
            "date_of_birth": None,
        }

        if not text:
            return fields

        # 1. Detect id_type
        id_type = self._detect_id_type(text)
        fields["id_type"] = id_type

        # 2. Extract id_number based on detected type or fallback
        fields["id_number"] = self._extract_id_number(text, id_type)

        # 3. Extract name
        name_patterns = [
            r"(?:name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\s+dob|\s+year|\s+gender|\n|$)",
            r"(?:cardholder(?:\s*name)?)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
        ]
        fields["name"] = self._match_first(name_patterns, text)

        # 4. Extract date of birth
        dob_patterns = [
            r"(?:DOB|date\s*of\s*birth|birth\s*date)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
            r"(?:year\s*of\s*birth|yob)\s*[:\-]?\s*(\d{4})",
        ]
        fields["date_of_birth"] = self._match_first(dob_patterns, text)

        return fields

    def _detect_id_type(self, text: str) -> Optional[str]:
        text_lower = text.lower()
        if "aadhaar" in text_lower or "aadhar" in text_lower or "uidai" in text_lower:
            return "aadhaar"
        if "election commission" in text_lower or "voter" in text_lower or "epic" in text_lower:
            return "voter_id"
        if re.search(r"\bPAN\b", text) or "permanent account number" in text_lower:
            return "pan_card"
        if "driving licence" in text_lower or "driving license" in text_lower:
            return "driving_licence"
        if "ration card" in text_lower:
            return "ration_card"
        return None

    def _extract_id_number(self, text: str, id_type: Optional[str]) -> Optional[str]:
        if id_type == "aadhaar":
            m = re.search(r"\b(\d{4}\s?\d{4}\s?\d{4})\b", text)
            if m:
                return m.group(1).strip()
        elif id_type == "pan_card":
            m = re.search(r"\b([A-Z]{5}\d{4}[A-Z])\b", text)
            if m:
                return m.group(1).strip()
        elif id_type == "voter_id":
            m = re.search(r"\b([A-Z]{3}\d{7})\b", text)
            if m:
                return m.group(1).strip()
        elif id_type == "driving_licence":
            m = re.search(r"\b([A-Z]{2}[0-9]{2}\s?[0-9]{11})\b", text)
            if m:
                return m.group(1).strip()

        # Fallback pattern for general ID numbers
        fallback_patterns = [
            r"(?:id\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-\s]+?)(?:,|\n|$)",
            r"(?:card\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-\s]+?)(?:,|\n|$)",
        ]
        return self._match_first(fallback_patterns, text)

    def _match_first(self, patterns: List[str], text: str, flags: int = 0) -> Optional[str]:
        combined_flags = re.IGNORECASE | flags
        for pattern in patterns:
            match = re.search(pattern, text, combined_flags)
            if match:
                val = match.group(1).strip()
                if val:
                    return val
        return None
