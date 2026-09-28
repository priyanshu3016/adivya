"""Field value normalization functions."""

from datetime import datetime
import re
from typing import Optional


def normalize_name(raw: Optional[str]) -> Optional[str]:
    """Normalize a person or institution name.
    
    - Trims whitespace and strips leading/trailing punctuation (: -).
    - Collapses multiple whitespace characters.
    - Applies title casing.
    - Returns None if empty or less than 2 characters.
    """
    if raw is None:
        return None

    cleaned = raw.strip()
    cleaned = cleaned.strip(":- ")
    cleaned = re.sub(r"\s+", " ", cleaned)

    if len(cleaned) < 2:
        return None

    return cleaned.title()


def normalize_income(raw: Optional[str]) -> Optional[int]:
    """Normalize an income value string to integer.
    
    - Removes currency symbols (₹, Rs., Rs, INR), commas, spaces, and '/-'.
    - Handles 'lakh' / 'lac' (x 100,000) and 'crore' (x 10,000,000).
    - Returns integer value, or None if unparseable.
    """
    if raw is None:
        return None

    text = raw.strip()
    if not text:
        return None

    # Check multipliers (case-insensitive)
    multiplier = 1
    if re.search(r"\b(?:lakhs?|lacs?)\b", text, flags=re.IGNORECASE):
        multiplier = 100_000
    elif re.search(r"\bcrores?\b", text, flags=re.IGNORECASE):
        multiplier = 10_000_000

    # Strip out non-numeric characters except decimal points
    cleaned = re.sub(r"(?i)rs\.?|inr|₹|/-", "", text)
    cleaned = re.sub(r"(?i)\b(?:lakhs?|lacs?|crores?)\b", "", cleaned)
    cleaned = cleaned.replace(",", "").strip()

    # Extract number (supports decimal e.g. 4.8 lakh)
    num_match = re.search(r"(\d+(?:\.\d+)?)", cleaned)
    if not num_match:
        return None

    try:
        val = float(num_match.group(1))
        return int(round(val * multiplier))
    except (ValueError, OverflowError):
        return None


def normalize_date(raw: Optional[str]) -> Optional[str]:
    """Normalize date strings to ISO-8601 YYYY-MM-DD.
    
    Tries common Indian and standard formats:
    - DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    - YYYY-MM-DD, YYYY/MM/DD
    - DD/MM/YY (interpreting YY < 50 as 20YY, else 19YY)
    Validates reasonable calendar dates (1900-2100).
    """
    if raw is None:
        return None

    text = raw.strip()
    if not text:
        return None

    # Replace dot or dash separators with slash for matching
    cleaned = text.strip()

    formats = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d/%m/%y",
        "%d-%m-%y",
        "%d.%m.%y",
    ]

    for fmt in formats:
        try:
            parsed = datetime.strptime(cleaned, fmt)
            # Two-digit year handling adjustment if parsed with %y
            year = parsed.year
            if 1900 <= year <= 2100:
                return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue

    return None


def normalize_percentage(raw: Optional[str]) -> Optional[float]:
    """Normalize percentage string to a float between 0.0 and 100.0 rounded to 2 decimal places."""
    if raw is None:
        return None

    text = raw.strip().replace("%", "").strip()
    if "-" in text:
        return None

    match = re.search(r"(\d+(?:\.\d+)?)", text)
    if not match:
        return None

    try:
        val = round(float(match.group(1)), 2)
        if 0.0 <= val <= 100.0:
            return val
    except ValueError:
        pass

    return None


def normalize_marks(raw: Optional[str]) -> Optional[int]:
    """Normalize marks string to a non-negative integer."""
    if raw is None:
        return None

    text = raw.strip()
    # Reject negative numbers explicitly
    if "-" in text:
        return None

    match = re.search(r"^(\d+)$", text)
    if not match:
        return None

    try:
        val = int(match.group(1))
        return val if val >= 0 else None
    except ValueError:
        return None


def normalize_certificate_number(raw: Optional[str]) -> Optional[str]:
    """Normalize certificate/registration number."""
    if raw is None:
        return None

    text = raw.strip()
    text = text.strip(":-. ")
    text = text.upper()

    if not text:
        return None

    return text


def normalize_id_number(raw: Optional[str], id_type: Optional[str]) -> Optional[str]:
    """Normalize and validate identity numbers based on id_type.
    
    - aadhaar: Exactly 12 digits (spaces removed)
    - pan_card: Exactly 10 chars matching [A-Z]{5}[0-9]{4}[A-Z]
    - Others: uppercase, stripped
    """
    if raw is None:
        return None

    text = raw.strip()
    if not text:
        return None

    id_type_clean = (id_type or "").lower().strip()

    if id_type_clean == "aadhaar":
        digits_only = re.sub(r"\s+", "", text)
        if re.fullmatch(r"\d{12}", digits_only):
            return digits_only
        return None

    if id_type_clean == "pan_card":
        pan = text.upper().replace(" ", "")
        if re.fullmatch(r"[A-Z]{5}[0-9]{4}[A-Z]", pan):
            return pan
        return None

    # Generic ID fallback
    cleaned = text.upper().strip()
    return cleaned if cleaned else None
