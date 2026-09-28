"""
Deterministic field comparison functions for income, category, marks, and dates.
Reuses normalizers from document_ai.normalizers.
"""
from typing import Optional, Union

from document_ai.normalizers import (
    normalize_date,
    normalize_income,
    normalize_marks,
    normalize_percentage,
)
from verification.models import FieldComparisonResult, MatchOutcome


def compare_income(
    declared: Optional[Union[float, int, str]],
    extracted: Optional[Union[int, str]],
    document_type: str = "income_certificate",
) -> FieldComparisonResult:
    """
    Compare declared annual family income against extracted income certificate value.
    """
    field_name = "annual_family_income"

    if declared is None or str(declared).strip() == "":
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=declared,
            document_value=extracted,
            message="No income declared in application profile.",
        )

    if extracted is None or str(extracted).strip() == "":
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=declared,
            document_value=extracted,
            message=f"Income could not be extracted from {document_type}.",
        )

    try:
        dec_val = int(float(str(declared).replace(",", "").replace("₹", "").strip()))
    except (ValueError, TypeError):
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=declared,
            document_value=extracted,
            message="Declared income is not a valid numeric value.",
        )

    try:
        if isinstance(extracted, int):
            ext_val = extracted
        else:
            norm_ext = normalize_income(str(extracted))
            ext_val = norm_ext if norm_ext is not None else int(float(str(extracted)))
    except (ValueError, TypeError):
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=declared,
            document_value=extracted,
            message=f"Income from {document_type} could not be converted to a valid number.",
        )

    if dec_val == ext_val:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MATCH,
            application_value=dec_val,
            document_value=ext_val,
            message="Declared income matches income certificate.",
        )

    return FieldComparisonResult(
        field_name=field_name,
        document_type=document_type,
        outcome=MatchOutcome.MISMATCH,
        application_value=dec_val,
        document_value=ext_val,
        message=f"Declared income (₹{dec_val:,}) does not match {document_type} (₹{ext_val:,}).",
    )


def compare_category(
    declared: Optional[str],
    extracted: Optional[str],
    document_type: str = "caste_certificate",
) -> FieldComparisonResult:
    """
    Compare declared reservation category (ST/SC/OBC/General) against caste certificate.
    """
    field_name = "category"

    if declared is None or str(declared).strip() == "":
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=declared,
            document_value=extracted,
            message="No category declared in application profile.",
        )

    if extracted is None or str(extracted).strip() == "":
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=declared,
            document_value=extracted,
            message=f"Category missing or not extracted from {document_type}.",
        )

    dec_clean = str(declared).strip().upper()
    ext_clean = str(extracted).strip().upper()

    if dec_clean == ext_clean:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MATCH,
            application_value=dec_clean,
            document_value=ext_clean,
            message=f"Declared category ('{dec_clean}') matches {document_type}.",
        )

    return FieldComparisonResult(
        field_name=field_name,
        document_type=document_type,
        outcome=MatchOutcome.MISMATCH,
        application_value=dec_clean,
        document_value=ext_clean,
        message=f"Declared category ('{dec_clean}') does not match {document_type} ('{ext_clean}').",
    )


def compare_marks(
    declared_pct: Optional[Union[float, int, str]],
    extracted_pct: Optional[Union[float, int, str]] = None,
    extracted_obtained: Optional[Union[int, str]] = None,
    extracted_total: Optional[Union[int, str]] = None,
    document_type: str = "marksheet",
) -> FieldComparisonResult:
    """
    Compare declared percentage against marksheet extracted percentage or calculated ratio.
    Allows ±1.0 tolerance for rounding differences.
    """
    field_name = "percentage"

    if declared_pct is None or str(declared_pct).strip() == "":
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=declared_pct,
            document_value=extracted_pct,
            message="No percentage declared in application profile.",
        )

    try:
        norm_dec = normalize_percentage(str(declared_pct)) if not isinstance(declared_pct, (int, float)) else float(declared_pct)
        if norm_dec is None:
            return FieldComparisonResult(
                field_name=field_name,
                document_type=document_type,
                outcome=MatchOutcome.UNPARSEABLE,
                application_value=declared_pct,
                document_value=extracted_pct,
                message="Declared percentage is invalid or out of 0-100 range.",
            )
    except Exception:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=declared_pct,
            document_value=extracted_pct,
            message="Declared percentage could not be parsed.",
        )

    # Determine extracted percentage
    calc_ext: Optional[float] = None
    if extracted_pct is not None and str(extracted_pct).strip() != "":
        calc_ext = normalize_percentage(str(extracted_pct)) if not isinstance(extracted_pct, (int, float)) else float(extracted_pct)

    if calc_ext is None and extracted_obtained is not None and extracted_total is not None:
        try:
            obt = int(extracted_obtained)
            tot = int(extracted_total)
            if tot > 0:
                calc_ext = round((obt / tot) * 100.0, 2)
        except (ValueError, TypeError):
            pass

    if calc_ext is None:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=norm_dec,
            document_value=None,
            message=f"Percentage could not be verified from {document_type}.",
        )

    # Compare within 1.0% tolerance
    if abs(norm_dec - calc_ext) <= 1.0:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MATCH,
            application_value=norm_dec,
            document_value=calc_ext,
            message=f"Declared marks/percentage ({norm_dec}%) matches {document_type} ({calc_ext}%).",
        )

    return FieldComparisonResult(
        field_name=field_name,
        document_type=document_type,
        outcome=MatchOutcome.MISMATCH,
        application_value=norm_dec,
        document_value=calc_ext,
        message=f"Declared percentage ({norm_dec}%) differs from {document_type} ({calc_ext}%).",
    )


def validate_date(
    date_str: Optional[str],
    field_name: str,
    document_type: str,
) -> FieldComparisonResult:
    """
    Validate that a date string from an extraction is parseable and valid ISO format.
    """
    if date_str is None or str(date_str).strip() == "":
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=None,
            document_value=date_str,
            message=f"Date field '{field_name}' is missing in {document_type}.",
        )

    norm_d = normalize_date(str(date_str))
    if norm_d is None:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=None,
            document_value=date_str,
            message=f"Date '{date_str}' in {document_type} could not be parsed as a valid date.",
        )

    return FieldComparisonResult(
        field_name=field_name,
        document_type=document_type,
        outcome=MatchOutcome.MATCH,
        application_value=norm_d,
        document_value=norm_d,
        message=f"Date '{field_name}' ({norm_d}) is valid in {document_type}.",
    )
