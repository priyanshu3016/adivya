"""Image preprocessing and file validation."""

import os
import tempfile
from typing import Optional, Set

from PIL import Image

from document_ai.models import FileValidationError, PreprocessingError

SUPPORTED_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}
MAX_DIMENSION: int = 4000


def validate_file(file_path: Optional[str]) -> str:
    """Validate that the file exists and is a supported image format.

    Args:
        file_path: Path to the target file.

    Returns:
        Canonical absolute path to the file.

    Raises:
        FileValidationError: If path is missing, does not exist, or has unsupported extension.
    """
    if not file_path or not str(file_path).strip():
        raise FileValidationError("No file path provided")

    abs_path = os.path.abspath(str(file_path).strip())

    if not os.path.isfile(abs_path):
        raise FileValidationError(f"File not found: {abs_path}")

    _, ext = os.path.splitext(abs_path)
    if ext.lower() not in SUPPORTED_EXTENSIONS:
        raise FileValidationError(f"Unsupported file type: {ext} (expected one of {sorted(SUPPORTED_EXTENSIONS)})")

    return abs_path


def preprocess_image(file_path: str) -> str:
    """Validate and optionally resize/convert image before OCR.

    Args:
        file_path: Path to image file.

    Returns:
        Path to processed image file (either original or temporary file).

    Raises:
        PreprocessingError: If image cannot be opened or processed.
    """
    try:
        img = Image.open(file_path)
        img.load()
    except Exception as exc:
        raise PreprocessingError(f"Cannot open image '{file_path}': {exc}") from exc

    modified = False

    # Convert modes like RGBA, CMYK, P to RGB
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")
        modified = True

    # Resize if dimensions exceed MAX_DIMENSION
    width, height = img.size
    max_dim = max(width, height)
    if max_dim > MAX_DIMENSION:
        scale = MAX_DIMENSION / max_dim
        new_width = int(width * scale)
        new_height = int(height * scale)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        modified = True

    if modified:
        tmp = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
        tmp_path = tmp.name
        tmp.close()
        img.save(tmp_path, format="JPEG", quality=95)
        return tmp_path

    return file_path
