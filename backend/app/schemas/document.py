from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ExtractionResponse(BaseModel):
    id: UUID
    document_id: UUID
    document_type: Optional[str] = None
    extracted_fields: Dict[str, Any] = {}
    extraction_status: str
    errors: List[str] = []
    ocr_confidence: Optional[float] = None
    extracted_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentResponse(BaseModel):
    id: UUID
    application_id: UUID
    document_type: str
    file_name: str
    upload_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentDetailResponse(DocumentResponse):
    file_path: str
    mime_type: Optional[str] = None
    file_size_bytes: Optional[int] = None
    extraction: Optional[ExtractionResponse] = None
