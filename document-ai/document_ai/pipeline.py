"""Main document processing pipeline orchestrating validation, OCR, type detection, and extraction."""

from typing import Any, Callable, Dict, List, Optional, Tuple

from document_ai.extractors import get_extractor
from document_ai.models import (
    DetectionResult,
    ExtractionResult,
    FileValidationError,
    OcrError,
    PreprocessingError,
)
from document_ai.normalizers import (
    normalize_certificate_number,
    normalize_date,
    normalize_id_number,
    normalize_income,
    normalize_marks,
    normalize_name,
    normalize_percentage,
)
from document_ai.ocr_engine import run_ocr
from document_ai.preprocessor import preprocess_image, validate_file
from document_ai.text_cleanup import cleanup_text
from document_ai.type_detector import detect_document_type

FIELD_NORMALIZERS: Dict[str, Callable[[Optional[str]], Any]] = {
    "name": normalize_name,
    "annual_income": normalize_income,
    "issue_date": normalize_date,
    "admission_date": normalize_date,
    "date_of_birth": normalize_date,
    "certificate_number": normalize_certificate_number,
    "reference_number": normalize_certificate_number,
    "percentage": normalize_percentage,
    "total_marks": normalize_marks,
    "marks_obtained": normalize_marks,
    "tribe_name": normalize_name,
    "institution": normalize_name,
}


def _normalize_extracted_fields(
    raw_fields: Dict[str, Optional[str]],
    document_type: Optional[str] = None,
) -> Tuple[Dict[str, Any], List[str]]:
    """Normalize extracted raw string values and collect normalization warnings.

    Args:
        raw_fields: Dict mapping field names to raw string values or None.
        document_type: Type of document being processed.

    Returns:
        Tuple of (normalized_fields_dict, warnings_list).
    """
    normalized: Dict[str, Any] = {}
    warnings: List[str] = []

    for field_name, raw_val in raw_fields.items():
        if raw_val is None:
            normalized[field_name] = None
            continue

        norm_val: Any = None
        if field_name == "id_number":
            id_type = raw_fields.get("id_type")
            norm_val = normalize_id_number(raw_val, id_type)
        elif field_name in FIELD_NORMALIZERS:
            norm_val = FIELD_NORMALIZERS[field_name](raw_val)
        else:
            norm_val = raw_val.strip()

        if norm_val is None and raw_val is not None:
            warnings.append(f"Failed to normalize {field_name} value: '{raw_val}'")

        normalized[field_name] = norm_val

    return normalized, warnings


def _determine_status(
    document_type: Optional[str],
    fields: Dict[str, Any],
    required_fields: List[str],
    errors: List[str],
) -> str:
    """Determine extraction status ('success', 'partial', 'manual_review').

    Args:
        document_type: Detected or specified document type.
        fields: Normalized extracted fields.
        required_fields: List of required field names.
        errors: Error list to append missing field warnings to.

    Returns:
        Status string.
    """
    if document_type is None:
        return "manual_review"

    missing = [rf for rf in required_fields if fields.get(rf) is None]
    if not missing:
        return "success"

    for field in missing:
        errors.append(f"Missing required field: {field}")
    return "partial"


def process_document(file_path: str, document_id: str) -> ExtractionResult:
    """End-to-end processing of a document image file.

    Validates file, preprocesses image, executes OCR, cleans text,
    detects document type, extracts fields, normalizes them, and returns
    a structured ExtractionResult. This function NEVER raises an exception.

    Args:
        file_path: Path to the target document image.
        document_id: Unique identifier for the document.

    Returns:
        ExtractionResult dataclass instance.
    """
    errors: List[str] = []

    # Step 1: Validate file path and extension
    try:
        abs_path = validate_file(file_path)
    except FileValidationError as e:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="failed",
            errors=[str(e)],
            ocr_confidence=None,
        )
    except Exception as e:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="failed",
            errors=[f"Unexpected validation error: {e}"],
            ocr_confidence=None,
        )

    # Step 2: Preprocess image
    try:
        processed_path = preprocess_image(abs_path)
    except PreprocessingError as e:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="failed",
            errors=[str(e)],
            ocr_confidence=None,
        )
    except Exception as e:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="failed",
            errors=[f"Unexpected preprocessing error: {e}"],
            ocr_confidence=None,
        )

    # Step 3: Run OCR
    try:
        ocr_result = run_ocr(processed_path)
    except OcrError as e:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="failed",
            errors=[str(e)],
            ocr_confidence=None,
        )
    except Exception as e:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="failed",
            errors=[f"Unexpected OCR error: {e}"],
            ocr_confidence=None,
        )

    ocr_confidence = ocr_result.avg_confidence

    # Step 4: Clean extracted OCR text
    cleaned_text = cleanup_text(ocr_result.full_text)
    if not cleaned_text:
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="manual_review",
            errors=["No text extracted from document"],
            ocr_confidence=ocr_confidence,
        )

    # Step 5: Check OCR confidence threshold
    low_confidence = False
    if ocr_confidence < 0.3:
        low_confidence = True
        errors.append(f"Low OCR confidence ({ocr_confidence:.2f})")

    # Step 6: Detect document type
    detection: DetectionResult = detect_document_type(cleaned_text)
    if detection.document_type is None:
        errors.append("Could not determine document type")
        return ExtractionResult(
            document_id=document_id,
            document_type=None,
            fields={},
            extraction_status="manual_review",
            errors=errors,
            ocr_confidence=ocr_confidence,
        )

    doc_type = detection.document_type

    # Step 7: Get registered extractor
    extractor = get_extractor(doc_type)
    if extractor is None:
        errors.append(f"No extractor registered for document type: {doc_type}")
        return ExtractionResult(
            document_id=document_id,
            document_type=doc_type,
            fields={},
            extraction_status="manual_review",
            errors=errors,
            ocr_confidence=ocr_confidence,
        )

    # Step 8: Extract fields
    try:
        raw_fields = extractor.extract(cleaned_text)
    except Exception as e:
        errors.append(f"Field extraction error: {e}")
        return ExtractionResult(
            document_id=document_id,
            document_type=doc_type,
            fields={},
            extraction_status="failed",
            errors=errors,
            ocr_confidence=ocr_confidence,
        )

    # Step 9: Normalize extracted fields
    normalized_fields, norm_warnings = _normalize_extracted_fields(raw_fields, doc_type)
    errors.extend(norm_warnings)

    # Step 10: Determine status
    status = _determine_status(doc_type, normalized_fields, extractor.required_fields, errors)
    if low_confidence:
        status = "manual_review"

    return ExtractionResult(
        document_id=document_id,
        document_type=doc_type,
        fields=normalized_fields,
        extraction_status=status,
        errors=errors,
        ocr_confidence=ocr_confidence,
    )


def process_document_from_text(
    text: Optional[str],
    document_id: str,
    document_type: Optional[str] = None,
) -> ExtractionResult:
    """Process document directly from raw text string (bypasses OCR and image preprocessing).

    Args:
        text: Raw document text string.
        document_id: Unique identifier for the document.
        document_type: Optional explicit document type override. If omitted,
            type is detected automatically.

    Returns:
        ExtractionResult dataclass instance with ocr_confidence=None.
    """
    try:
        errors: List[str] = []

        cleaned_text = cleanup_text(text)
        if not cleaned_text:
            return ExtractionResult(
                document_id=document_id,
                document_type=document_type,
                fields={},
                extraction_status="manual_review",
                errors=["Empty document text"],
                ocr_confidence=None,
            )

        if document_type:
            doc_type = document_type
        else:
            detection: DetectionResult = detect_document_type(cleaned_text)
            doc_type = detection.document_type
            if doc_type is None:
                return ExtractionResult(
                    document_id=document_id,
                    document_type=None,
                    fields={},
                    extraction_status="manual_review",
                    errors=["Could not determine document type"],
                    ocr_confidence=None,
                )

        extractor = get_extractor(doc_type)
        if extractor is None:
            return ExtractionResult(
                document_id=document_id,
                document_type=doc_type,
                fields={},
                extraction_status="manual_review",
                errors=[f"No extractor registered for document type: {doc_type}"],
                ocr_confidence=None,
            )

        raw_fields = extractor.extract(cleaned_text)
        normalized_fields, norm_warnings = _normalize_extracted_fields(raw_fields, doc_type)
        errors.extend(norm_warnings)

        status = _determine_status(doc_type, normalized_fields, extractor.required_fields, errors)

        return ExtractionResult(
            document_id=document_id,
            document_type=doc_type,
            fields=normalized_fields,
            extraction_status=status,
            errors=errors,
            ocr_confidence=None,
        )
    except Exception as exc:
        return ExtractionResult(
            document_id=document_id,
            document_type=document_type,
            fields={},
            extraction_status="failed",
            errors=[f"Unexpected processing error: {exc}"],
            ocr_confidence=None,
        )
