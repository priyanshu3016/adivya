"""Document storage and Document AI pipeline integration service."""

import os
import sys
import uuid
import shutil
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings

ALLOWED_DOCUMENT_TYPES = {
    "income_certificate",
    "caste_certificate",
    "marksheet",
    "admission_letter",
    "identity_document",
}

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".tiff",
    ".tif",
}


def _get_document_ai_path() -> str:
    """Return the absolute path to the sibling document-ai package."""
    # backend/app/services/ -> backend -> root (adivya) -> document-ai
    base_dir = Path(__file__).resolve().parent.parent.parent.parent
    return str(base_dir / "document-ai")


async def save_uploaded_file(
    application_id: uuid.UUID,
    document_type: str,
    file: UploadFile,
) -> Tuple[str, str, int]:
    """Save an uploaded document to local storage and return (file_path, mime_type, file_size_bytes)."""
    if document_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid document_type '{document_type}'. "
                f"Must be one of: {sorted(list(ALLOWED_DOCUMENT_TYPES))}"
            ),
        )

    file_name = file.filename or f"doc_{document_type}.png"
    ext = Path(file_name).suffix.lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file format '{ext}'. "
                f"Document AI only supports image formats: {sorted(list(ALLOWED_EXTENSIONS))}. "
                "PDF uploads are not supported in this version."
            ),
        )

    storage_dir = Path(settings.FILE_STORAGE_PATH) / str(application_id)
    storage_dir.mkdir(parents=True, exist_ok=True)

    unique_filename = f"{document_type}_{uuid.uuid4().hex[:8]}{ext}"
    destination_path = storage_dir / unique_filename

    contents = await file.read()
    file_size_bytes = len(contents)

    if file_size_bytes == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)",
        )

    with open(destination_path, "wb") as f:
        f.write(contents)

    mime_type = file.content_type or "application/octet-stream"
    return str(destination_path.resolve()), mime_type, file_size_bytes


def run_document_extraction(file_path: str, document_id: str) -> Dict[str, Any]:
    """Execute Person 5's synchronous Document AI pipeline on the saved document image."""
    doc_ai_dir = _get_document_ai_path()
    if doc_ai_dir not in sys.path:
        sys.path.insert(0, doc_ai_dir)

    try:
        from document_ai.pipeline import process_document
        result = process_document(file_path=file_path, document_id=str(document_id))
        return result.to_dict()
    except Exception as e:
        return {
            "document_id": str(document_id),
            "document_type": None,
            "fields": {},
            "extraction_status": "failed",
            "errors": [f"Document AI processing exception: {str(e)}"],
            "ocr_confidence": None,
        }
