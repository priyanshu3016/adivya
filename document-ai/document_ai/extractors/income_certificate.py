"""Income certificate field extractor."""

import re
from typing import Dict, List, Optional

from document_ai.extractors import register_extractor
from document_ai.extractors.base import BaseExtractor


@register_extractor
class IncomeCertificateExtractor(BaseExtractor):
    """Extracts fields from income certificate OCR text."""

    @property
    def document_type(self) -> str:
        return "income_certificate"

    @property
    def required_fields(self) -> List[str]:
        return ["name", "annual_income", "certificate_number", "issue_date"]

    def extract(self, text: Optional[str]) -> Dict[str, Optional[str]]:
        """Extract name, annual_income, certificate_number, and issue_date."""
        fields: Dict[str, Optional[str]] = {
            "name": None,
            "annual_income": None,
            "certificate_number": None,
            "issue_date": None,
        }

        if not text:
            return fields

        name_patterns = [
            r"(?:certify\s+that\s+(?:shri|smt|kumari)\s+)([A-Za-z\s\.]+?)(?:,|\s+son|\s+daughter|\s+s/o|\s+d/o|\s+w/o|\n|$)",
            r"(?:name)\s*[:\-]?\s*([A-Za-z\s\.]+?)(?:,|\n|$)",
        ]

        income_patterns = [
            r"(?:annual\s*(?:family\s*)?income)\s*(?:of|is)?\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([\d,\.\s]+(?:\s*(?:lakh|lac))?)",
            r"(?:income)\s*[:\-]?\s*(?:Rs\.?|₹)?\s*([\d,\.\s]+(?:\s*(?:lakh|lac))?)",
        ]

        cert_patterns = [
            r"(?:certificate\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-/]+)",
            r"(?:cert\.?\s*(?:no|number)\.?)\s*[:\-]?\s*([A-Za-z0-9\-/]+)",
        ]

        date_patterns = [
            r"(?:date\s*(?:of\s*issue)?)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
            r"(?:issue\s*date)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
            r"(?:dated)\s*[:\-]?\s*(\d{1,2}[\-/\.]\d{1,2}[\-/\.]\d{2,4})",
        ]

        fields["name"] = self._match_first(name_patterns, text)
        fields["annual_income"] = self._match_first(income_patterns, text)
        fields["certificate_number"] = self._match_first(cert_patterns, text)
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
