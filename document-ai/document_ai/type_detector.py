"""Document type detection via weighted keyword scoring."""

from typing import Dict, List, Optional, Tuple

from document_ai.models import DetectionResult

KEYWORD_CONFIG: Dict[str, List[Tuple[str, int]]] = {
    "income_certificate": [
        ("income certificate", 3),
        ("annual income", 3),
        ("family income", 3),
        ("income", 2),
        ("annual family", 2),
        ("tehsildar", 1),
        ("revenue", 1),
    ],
    "caste_certificate": [
        ("caste certificate", 3),
        ("tribe certificate", 3),
        ("scheduled tribe", 3),
        ("scheduled caste", 3),
        ("caste", 2),
        ("tribe", 2),
        ("community certificate", 2),
        ("category", 1),
        ("backward", 1),
    ],
    "marksheet": [
        ("marksheet", 3),
        ("mark sheet", 3),
        ("statement of marks", 3),
        ("grade card", 3),
        ("marks obtained", 2),
        ("total marks", 2),
        ("percentage", 2),
        ("examination", 2),
        ("pass", 1),
        ("division", 1),
        ("semester", 1),
    ],
    "admission_letter": [
        ("admission letter", 3),
        ("offer of admission", 3),
        ("admission offer", 3),
        ("admission", 2),
        ("admitted", 2),
        ("enrolled", 2),
        ("enrollment", 1),
        ("registration", 1),
    ],
    "identity_document": [
        ("aadhaar", 3),
        ("aadhar", 3),
        ("voter id", 3),
        ("election commission", 3),
        ("driving licence", 3),
        ("unique identification", 2),
        ("identity card", 2),
        ("date of birth", 1),
    ],
}


def detect_document_type(text: Optional[str]) -> DetectionResult:
    """Classify OCR text into a document type using weighted keyword scoring.

    Args:
        text: OCR extracted text to classify.

    Returns:
        DetectionResult containing predicted document type, confidence level,
        and scores for all candidate document types.
    """
    initial_scores = {doc_type: 0 for doc_type in KEYWORD_CONFIG}

    if not text or not text.strip():
        return DetectionResult(
            document_type=None,
            confidence_level="low",
            all_scores=initial_scores,
        )

    text_lower = text.lower()
    all_scores: Dict[str, int] = {}

    for doc_type, kw_list in KEYWORD_CONFIG.items():
        score = 0
        for kw, weight in kw_list:
            if kw in text_lower:
                score += weight
        all_scores[doc_type] = score

    sorted_scores = sorted(all_scores.items(), key=lambda item: item[1], reverse=True)
    top_type, top_score = sorted_scores[0]
    second_score = sorted_scores[1][1] if len(sorted_scores) > 1 else 0

    if top_score < 3 or (top_score - second_score <= 1):
        return DetectionResult(
            document_type=None,
            confidence_level="low",
            all_scores=all_scores,
        )

    if top_score >= 5:
        confidence = "high"
    else:
        confidence = "medium"

    return DetectionResult(
        document_type=top_type,
        confidence_level=confidence,
        all_scores=all_scores,
    )
