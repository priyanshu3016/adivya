from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class AdminReviewRequest(BaseModel):
    decision: str = Field(..., description="Decision must be one of: approve, reject, request_info, escalate")
    comments: Optional[str] = None
    checklist: Optional[Dict[str, Any]] = None


class AdminReviewResponse(BaseModel):
    id: UUID
    application_id: UUID
    reviewer_id: UUID
    decision: str
    comments: Optional[str] = None
    checklist: Optional[Dict[str, Any]] = None
    reviewed_at: datetime

    model_config = ConfigDict(from_attributes=True)
