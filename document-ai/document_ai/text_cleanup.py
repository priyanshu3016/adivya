"""Post-OCR text cleanup utilities."""

import re
from typing import Optional
import unicodedata


def cleanup_text(raw_text: Optional[str]) -> str:
    """Clean and normalize OCR-extracted text.
    
    - Handles None or empty string input gracefully -> returns ""
    - Normalizes unicode into NFC form.
    - Removes null bytes (\\x00).
    - Strips leading and trailing whitespace per line.
    - Collapses multiple consecutive horizontal spaces to a single space.
    - Collapses 3 or more consecutive newlines down to a double newline (paragraph break).
    - Strips overall leading and trailing whitespace.
    """
    if raw_text is None:
        return ""

    if not raw_text:
        return ""

    # Unicode normalization (NFC)
    text = unicodedata.normalize("NFC", raw_text)

    # Remove null bytes
    text = text.replace("\x00", "")

    # Split lines, strip each line, collapse multiple spaces within lines
    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        stripped_line = line.strip()
        # Collapse multiple horizontal whitespace characters to single space
        collapsed_line = re.sub(r"[ \t]+", " ", stripped_line)
        cleaned_lines.append(collapsed_line)

    text = "\n".join(cleaned_lines)

    # Collapse 3+ newlines to 2 newlines
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
