"""
Document completeness and extraction integrity checker.
Verifies that all mandatory document types required by a scheme are uploaded,
processed successfully, and contain required extraction fields.
"""
from typing import Any, Dict, List

from verification.models import DocumentCheckResult

# Mandatory fields per document type matching Person 5's extractor definitions
REQUIRED_FIELDS = {
    "income_certificate": ["name", "annual_income", "certificate_number", "issue_date"],
    "caste_certificate": ["name", "certificate_number", "category", "issue_date"],
    "marksheet": ["name"],
    "admission_letter": ["name", "institution"],
    "identity_document": ["name", "id_type", "id_number"],
}


def check_documents(
    required_types: List[str],
    documents: Dict[str, Dict[str, Any]],
) -> List[DocumentCheckResult]:
    """
    Check document presence and extraction status for each required document type.

    Args:
        required_types: List of required document type strings from Scheme.
        documents: Dict keyed by document_type with extraction info:
                   {
                       "document_id": str,
                       "extraction_status": str,
                       "extracted_fields": dict,
                       "errors": list,
                       "ocr_confidence": float
                   }

    Returns:
        List of DocumentCheckResult objects.
    """
    results: List[DocumentCheckResult] = []

    for doc_type in required_types:
        if doc_type not in documents:
            results.append(
                DocumentCheckResult(
                    document_type=doc_type,
                    is_present=False,
                    extraction_status=None,
                    missing_fields=[],
                    issues=[f"Required document '{doc_type}' was not uploaded."],
                )
            )
            continue

        doc_data = documents[doc_type]
        extraction_status = doc_data.get("extraction_status")
        extracted_fields = doc_data.get("extracted_fields") or {}
        errors = doc_data.get("errors") or []

        expected_req_fields = REQUIRED_FIELDS.get(doc_type, [])
        missing_fields: List[str] = []

        for req_f in expected_req_fields:
            val = extracted_fields.get(req_f)
            if val is None or str(val).strip() == "":
                missing_fields.append(req_f)

        issues: List[str] = []

        if extraction_status == "failed":
            issues.append(f"Document extraction failed for '{doc_type}'.")
            if errors:
                issues.append(f"Errors: {'; '.join(errors)}")
        elif extraction_status == "manual_review":
            issues.append(f"Extraction requires manual review for '{doc_type}'.")
        elif extraction_status == "partial":
            if missing_fields:
                issues.append(
                    f"Extraction partial for '{doc_type}'. Missing required fields: {', '.join(missing_fields)}."
                )
            else:
                issues.append(f"Extraction partial for '{doc_type}'.")
        elif missing_fields:
            # Extraction status was marked success, but required fields are absent
            issues.append(
                f"Missing required fields for '{doc_type}': {', '.join(missing_fields)}."
            )

        results.append(
            DocumentCheckResult(
                document_type=doc_type,
                is_present=True,
                extraction_status=extraction_status,
                missing_fields=missing_fields,
                issues=issues,
            )
        )

    return results
