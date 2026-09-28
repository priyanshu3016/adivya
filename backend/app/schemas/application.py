from datetime import date, datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from app.schemas.document import DocumentResponse
from app.schemas.verification import DeficiencyResponse, VerificationResultResponse


class ApplicantProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    category: str = "ST"
    tribe_name: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    annual_family_income: Optional[float] = None
    current_education_level: Optional[str] = None
    institution_name: Optional[str] = None
    course_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationCreate(BaseModel):
    scheme_id: UUID
    academic_year: Optional[str] = "2026-2027"


class StatusHistoryResponse(BaseModel):
    id: UUID
    application_id: UUID
    old_status: Optional[str] = None
    new_status: str
    changed_by_user_id: Optional[UUID] = None
    reason: Optional[str] = None
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationResponse(BaseModel):
    id: UUID
    applicant_id: UUID
    scheme_id: UUID
    status: str
    academic_year: Optional[str] = None
    applicant_snapshot: Optional[Dict[str, Any]] = None
    remarks: Optional[str] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ApplicationDetailResponse(ApplicationResponse):
    documents: List[DocumentResponse] = []
    deficiencies: List[DeficiencyResponse] = []
    verification_results: List[VerificationResultResponse] = []
    status_history: List[StatusHistoryResponse] = []
