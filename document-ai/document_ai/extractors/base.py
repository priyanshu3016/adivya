"""Base extractor interface."""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional


class BaseExtractor(ABC):
    """Abstract base class for document field extractors."""

    @property
    @abstractmethod
    def document_type(self) -> str:
        """Return the document type string this extractor handles."""

    @property
    @abstractmethod
    def required_fields(self) -> List[str]:
        """Return list of field names required for 'success' status."""

    @abstractmethod
    def extract(self, text: str) -> Dict[str, Optional[str]]:
        """Extract fields from OCR text.

        Args:
            text: OCR text of the document.

        Returns:
            Dict mapping field names to raw extracted string values or None.
        """
