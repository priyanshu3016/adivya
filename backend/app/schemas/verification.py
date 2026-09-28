from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class VerificationResultResponse(BaseModel):
    id: UUID
    application_id: UUID
    check_type: str
    check_name: str
    result: str
    message: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    verified_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DeficiencyResponse(BaseModel):
    id: UUID
    application_id: UUID
    document_id: Optional[UUID] = None
    deficiency_type: str
    field_name: Optional[str] = None
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    description: str
    severity: str
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class VerificationSummaryResponse(BaseModel):
    application_id: UUID
    status: str
    total_checks: int
    passed_checks: int
    warning_checks: int
    failed_checks: int
    deficiencies_found: int
    results: list[VerificationResultResponse] = []
    deficiencies: list[DeficiencyResponse] = []
