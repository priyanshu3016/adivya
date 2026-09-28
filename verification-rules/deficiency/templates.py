"""
Deterministic, template-based deficiency description strings.
NO LLM - purely rule-based, explainable, and auditable descriptions.
"""
from collections import defaultdict
from typing import Any

from deficiency.codes import DeficiencyType


class SafeFormatDict(defaultdict):
    """defaultdict that returns '[unknown]' for missing format keys."""
    def __init__(self, *args, **kwargs):
        super().__init__(lambda: "[unknown]", *args, **kwargs)

    def __missing__(self, key: str) -> str:
        return "[unknown]"


TEMPLATES = {
    DeficiencyType.MISSING_DOCUMENT.value: (
        "Required document '{document_type}' was not uploaded for this application."
    ),
    "data_mismatch_annual_family_income": (
        "Annual family income declared in application (₹{expected}) does not match income certificate (₹{actual}). Please verify and correct."
    ),
    "data_mismatch_category": (
        "Category declared in application ('{expected}') does not match caste certificate ('{actual}')."
    ),
    DeficiencyType.DATA_MISMATCH.value: (
        "Value of '{field_name}' in application ('{expected}') does not match document value ('{actual}')."
    ),
    DeficiencyType.NAME_MISMATCH.value: (
        "Name on application ('{expected}') differs from name on {document_type} ('{actual}'). Flagged for officer review."
    ),
    "invalid_data_field_missing": (
        "Required field '{field_name}' could not be extracted from '{document_type}'."
    ),
    "invalid_data_unreadable": (
        "Document '{document_type}' could not be processed (extraction status: {status}). Please upload a clearer copy."
    ),
    "invalid_data_invalid_date": (
        "Date value '{actual}' in '{document_type}' could not be parsed as a valid date."
    ),
    DeficiencyType.INVALID_DATA.value: (
        "Invalid or incomplete data detected in '{document_type}'."
    ),
    DeficiencyType.EXPIRED_DOCUMENT.value: (
        "Document '{document_type}' issued on {actual} may be expired. Validity cutoff: {expected}."
    ),
}

FALLBACK_DESCRIPTION = "A verification issue was detected. Please contact support."


def render_description(deficiency_type: str, **kwargs: Any) -> str:
    """
    Render a human-readable deficiency description deterministically.

    Args:
        deficiency_type: One of canonical DeficiencyType values.
        **kwargs: Contextual values (document_type, field_name, expected, actual, subtype, status, etc.)

    Returns:
        Formatted description string. Never raises an exception.
    """
    try:
        # Determine the template key based on deficiency_type and context
        field_name = kwargs.get("field_name")
        subtype = kwargs.get("subtype")

        template_key = deficiency_type

        if deficiency_type == DeficiencyType.DATA_MISMATCH.value:
            if field_name == "annual_family_income":
                template_key = "data_mismatch_annual_family_income"
            elif field_name == "category":
                template_key = "data_mismatch_category"
        elif deficiency_type == DeficiencyType.INVALID_DATA.value:
            if subtype == "field_missing":
                template_key = "invalid_data_field_missing"
            elif subtype == "unreadable":
                template_key = "invalid_data_unreadable"
            elif subtype == "invalid_date":
                template_key = "invalid_data_invalid_date"

        template = TEMPLATES.get(template_key)
        if template is None:
            # Fallback to base type if specific subkey was not found
            template = TEMPLATES.get(deficiency_type)

        if template is None:
            return FALLBACK_DESCRIPTION

        # Safe formatting
        safe_kwargs = SafeFormatDict()
        for k, v in kwargs.items():
            safe_kwargs[k] = "" if v is None else str(v)

        return template.format_map(safe_kwargs)

    except Exception:
        return FALLBACK_DESCRIPTION
