"""Data models for document extraction results."""

import json
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional


# ==========================================
# Exception Hierarchy
# ==========================================

class DocumentAIError(Exception):
    """Base exception for document-ai module."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class FileValidationError(DocumentAIError):
    """File does not exist, is not readable, or has unsupported format."""


class PreprocessingError(DocumentAIError):
    """Image could not be opened or preprocessed."""


class OcrError(DocumentAIError):
    """PaddleOCR failed to initialize or process the image."""


# ==========================================
# OCR & Detection Models
# ==========================================

@dataclass
class OcrLine:
    """Represents a single detected line of text from OCR."""

    text: str
    confidence: float
    bbox: List[Any]


@dataclass
class OcrResult:
    """Full result returned by the OCR engine."""

    full_text: str
    lines: List[OcrLine]
    avg_confidence: float


@dataclass
class DetectionResult:
    """Result of document type classification."""

    document_type: Optional[str]
    confidence_level: str  # "high", "medium", or "low"
    all_scores: Dict[str, int] = field(default_factory=dict)


# ==========================================
# Final Extraction Contract
# ==========================================

@dataclass
class ExtractionResult:
    """Standardized extraction result output contract."""

    document_id: str
    document_type: Optional[str]
    fields: Dict[str, Any]
    extraction_status: str  # "success", "partial", "manual_review", "failed"
    errors: List[str] = field(default_factory=list)
    ocr_confidence: Optional[float] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert result to a plain JSON-serializable dictionary."""
        return asdict(self)
