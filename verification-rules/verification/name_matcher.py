"""
Deterministic name comparison with explicit thresholds and initials handling.
Reuses normalize_name from document_ai.normalizers.
"""
import difflib
import re
from typing import List, Optional

from document_ai.normalizers import normalize_name
from verification.models import FieldComparisonResult, MatchOutcome

# Module-level configurable thresholds
EXACT_MATCH_THRESHOLD = 1.0
POTENTIAL_MATCH_THRESHOLD = 0.82
MISMATCH_THRESHOLD = 0.82


def _clean_token(t: str) -> str:
    """Strip punctuation like periods or hyphens from tokens."""
    return re.sub(r"[^\w]", "", t).lower()


def _check_initials_compatibility(tokens_a: List[str], tokens_b: List[str]) -> bool:
    """
    Check if two token lists are compatible under initials/name variations.
    Assumes last tokens (surnames) are already matched.
    """
    clean_a = [_clean_token(t) for t in tokens_a[:-1]]
    clean_b = [_clean_token(t) for t in tokens_b[:-1]]

    # Filter out empty tokens
    clean_a = [t for t in clean_a if t]
    clean_b = [t for t in clean_b if t]

    if not clean_a or not clean_b:
        return False

    # Case 1: Same number of prefix tokens
    if len(clean_a) == len(clean_b):
        for ta, tb in zip(clean_a, clean_b):
            if ta == tb:
                continue
            # Check if one is an initial of the other
            if len(ta) == 1 and tb.startswith(ta):
                continue
            if len(tb) == 1 and ta.startswith(tb):
                continue
            # Check if they are close phonetic/spelling variants (e.g., deepak vs dipak)
            token_sim = difflib.SequenceMatcher(None, ta, tb).ratio()
            if token_sim >= 0.70 and ta[0] == tb[0]:
                continue
            return False
        return True

    # Case 2: Unequal lengths (e.g., "Deepak Kumar" vs "D. K.")
    # Check if short list matches initials of long list in order
    short_list, long_list = (clean_a, clean_b) if len(clean_a) < len(clean_b) else (clean_b, clean_a)
    if all(len(st) == 1 for st in short_list):
        if len(short_list) == len(long_list):
            return all(lt.startswith(st) for st, lt in zip(short_list, long_list))

    return False


def compare_names(
    application_name: Optional[str],
    document_name: Optional[str],
    document_type: str = "document",
) -> FieldComparisonResult:
    """
    Compare applicant declared name against document extracted name deterministically.

    Thresholds:
    - Exactly identical (case-insensitive / normalized) -> MATCH (similarity=1.0)
    - Initials / variations or similarity >= 0.82 -> POTENTIAL_MATCH (warning, manual review)
    - Below 0.82 -> MISMATCH

    Safety invariant: POTENTIAL_MATCH never causes critical deficiency.
    """
    field_name = "name"

    # Step 1: None or empty check
    if application_name is None or document_name is None:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=application_name,
            document_value=document_name,
            similarity=None,
            message=f"Name missing on {'application' if application_name is None else document_type}.",
        )

    if not str(application_name).strip() or not str(document_name).strip():
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MISSING,
            application_value=application_name,
            document_value=document_name,
            similarity=None,
            message="Empty name provided for comparison.",
        )

    # Step 2: Normalize both names
    norm_a = normalize_name(str(application_name))
    norm_b = normalize_name(str(document_name))

    # Step 3: Unparseable check (e.g. less than 2 valid characters)
    if norm_a is None or norm_b is None:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.UNPARSEABLE,
            application_value=application_name,
            document_value=document_name,
            similarity=None,
            message="Name string contains insufficient or unparseable characters.",
        )

    # Step 4: Exact normalized match
    if norm_a == norm_b:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MATCH,
            application_value=norm_a,
            document_value=norm_b,
            similarity=1.0,
            message=f"Names match exactly with {document_type}.",
        )

    lower_a = norm_a.lower()
    lower_b = norm_b.lower()

    if lower_a == lower_b:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.MATCH,
            application_value=norm_a,
            document_value=norm_b,
            similarity=1.0,
            message=f"Names match exactly (case-insensitive) with {document_type}.",
        )

    # Step 5 & 6: Compute SequenceMatcher ratio
    ratio = difflib.SequenceMatcher(None, lower_a, lower_b).ratio()
    rounded_ratio = round(ratio, 4)

    # Step 7: Token-based initials check
    tokens_a = lower_a.split()
    tokens_b = lower_b.split()

    if len(tokens_a) >= 2 and len(tokens_b) >= 2:
        last_a = _clean_token(tokens_a[-1])
        last_b = _clean_token(tokens_b[-1])
        # Surnames match or are nearly identical
        surnames_match = (last_a == last_b) or (difflib.SequenceMatcher(None, last_a, last_b).ratio() >= 0.85)

        if surnames_match and _check_initials_compatibility(tokens_a, tokens_b):
            if ratio >= 0.60:
                return FieldComparisonResult(
                    field_name=field_name,
                    document_type=document_type,
                    outcome=MatchOutcome.POTENTIAL_MATCH,
                    application_value=norm_a,
                    document_value=norm_b,
                    similarity=rounded_ratio,
                    message=f"Name on application ('{norm_a}') potentially matches '{norm_b}' on {document_type} (initials/variation detected).",
                )

    # Step 8: Ratio threshold evaluation
    if ratio >= POTENTIAL_MATCH_THRESHOLD:
        return FieldComparisonResult(
            field_name=field_name,
            document_type=document_type,
            outcome=MatchOutcome.POTENTIAL_MATCH,
            application_value=norm_a,
            document_value=norm_b,
            similarity=rounded_ratio,
            message=f"Name on application ('{norm_a}') closely matches '{norm_b}' on {document_type} (similarity: {rounded_ratio:.2f}).",
        )

    # Step 9: Mismatch
    return FieldComparisonResult(
        field_name=field_name,
        document_type=document_type,
        outcome=MatchOutcome.MISMATCH,
        application_value=norm_a,
        document_value=norm_b,
        similarity=rounded_ratio,
        message=f"Name mismatch between application ('{norm_a}') and {document_type} ('{norm_b}').",
    )
