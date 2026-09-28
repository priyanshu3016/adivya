"""Caste and tribe certificate field extractor."""

import re
from typing import Dict, List, Optional

from document_ai.extractors import register_extractor
from document_ai.extractors.base import BaseExtractor


@register_extractor
class CasteCertificateExtractor(BaseExtractor):
    """Extracts fields from caste/tribe certificate OCR text."""

    @property
    def document_type(self) -> str:
        return "caste_certificate"

    @property
    def required_fields(self) -> List[str]:
        return ["name", "certificate_number", "category", "issue_date"]

    def extract(self, text: Optional[str]) -> Dict[str, Optional[str]]:
        """Extract name, certificate_number, category, tribe_name, and issue_date."""
        fields: Dict[str, Optional[str]] = {
            "name": None,
            "certificate_number": None,
            "category": None,
            "tribe_name": None,
            "issue_date": None,
        }

        if not text:
            return fields

        # 1. Category via keyword search
        text_lower = text.lower()
        if re.search(r"\b(?:scheduled\s+tribe|st)\b", text_lower):
            fields["category"] = "ST"
        elif re.search(r"\b(?:scheduled\s+caste|sc)\b", text_lower):
            fields["category"] = "SC"
        elif re.search(r"\b(?:other\s+backward\s+class(?:es)?|obc)\b", text_lower):
            fields["category"] = "OBC"

        # 2. Tribe name (optional)
        tribe_patterns = [
            r"(?:belongs?\s+to\s+(?:the\s+)?)([\w\s]+?)(?:\s+(?:tribe|caste|community))",
            r"(?:sub-?caste|tribe)\s*[:\-]?\s*([A-Za-z\s]+?)(?:,|\n|$)",
        ]
        fields["tribe_name"] = self._match_first(tribe_patterns, text)

        # 3. Name
        name_patterns = [
            r"(?:certify\s+that\s+(?:shri|smt|kumari)\s+)([A-Za-z\s\.]+?)(?:,|\s+son|\s+daughter|\s+s/o|\s+d/o|\s+w/o|\n|$)",
            r"(?:name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
        ]
        fields["name"] = self._match_first(name_patterns, text)

        # 4. Certificate Number
        cert_patterns = [
            r"(?:certificate\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-/]+)",
            r"(?:cert\.?\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-/]+)",
        ]
        fields["certificate_number"] = self._match_first(cert_patterns, text)

        # 5. Issue Date
        date_patterns = [
            r"(?:date\s*(?:of\s*issue)?)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
            r"(?:issue\s*date)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
            r"(?:dated)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
        ]
        fields["issue_date"] = self._match_first(date_patterns, text)

        return fields

    def _match_first(self, patterns: List[str], text: str) -> Optional[str]:
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                val = match.group(1).strip()
                if val:
                    return val
        return None
