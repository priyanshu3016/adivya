"""Extractor registry and dispatcher."""

from typing import Dict, Optional, Type

from .base import BaseExtractor

_REGISTRY: Dict[str, Type[BaseExtractor]] = {}


def register_extractor(cls: Type[BaseExtractor]) -> Type[BaseExtractor]:
    """Register an extractor class by its document_type property."""
    instance = cls()
    _REGISTRY[instance.document_type] = cls
    return cls


def get_extractor(document_type: str) -> Optional[BaseExtractor]:
    """Look up an extractor class by document type and return a new instance."""
    cls = _REGISTRY.get(document_type)
    return cls() if cls else None


# Register extractor implementations
from . import income_certificate  # noqa: E402, F401
from . import caste_certificate  # noqa: E402, F401
from . import marksheet  # noqa: E402, F401
from . import admission_letter  # noqa: E402, F401




