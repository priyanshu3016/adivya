"""PaddleOCR engine wrapper with lazy initialization and structured output."""

from typing import Any, List, Optional

from document_ai.models import OcrError, OcrLine, OcrResult

_ocr_instance: Optional[Any] = None


def _init_ocr() -> Any:
    """Initialize PaddleOCR lazy singleton instance.

    Raises:
        OcrError: If PaddleOCR is not installed or fails to initialize.
    """
    global _ocr_instance
    if _ocr_instance is not None:
        return _ocr_instance

    try:
        from paddleocr import PaddleOCR  # type: ignore[import-untyped]

        _ocr_instance = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        return _ocr_instance
    except Exception as exc:
        raise OcrError(f"Failed to initialize PaddleOCR: {exc}") from exc


def run_ocr(image_path: str) -> OcrResult:
    """Run OCR on the given image file.

    Args:
        image_path: Path to the image file to process.

    Returns:
        OcrResult containing full text, detected lines, and average confidence.

    Raises:
        OcrError: If PaddleOCR fails to initialize or process the image.
    """
    ocr = _init_ocr()

    try:
        result = ocr.ocr(image_path, cls=True)
    except Exception as exc:
        raise OcrError(f"OCR processing failed for '{image_path}': {exc}") from exc

    if result is None or len(result) == 0 or result[0] is None:
        raise OcrError(f"OCR returned no results for: {image_path}")

    page = result[0]
    lines: List[OcrLine] = []

    for detection in page:
        try:
            bbox = detection[0]
            text = str(detection[1][0])
            confidence = float(detection[1][1])
            lines.append(OcrLine(text=text, confidence=confidence, bbox=bbox))
        except (IndexError, TypeError, ValueError) as parse_err:
            continue

    if not lines:
        raise OcrError(f"OCR returned empty results for: {image_path}")

    avg_confidence = sum(line.confidence for line in lines) / len(lines)
    full_text = "\n".join(line.text for line in lines)

    return OcrResult(full_text=full_text, lines=lines, avg_confidence=avg_confidence)


def reset_ocr() -> None:
    """Reset the cached OCR instance (primarily for testing and memory cleanup)."""
    global _ocr_instance
    _ocr_instance = None
