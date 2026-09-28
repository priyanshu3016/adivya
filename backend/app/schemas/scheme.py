from datetime import date, datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SchemeRuleResponse(BaseModel):
    id: UUID
    scheme_id: UUID
    rule_field: str
    rule_operator: str
    rule_value: str
    error_message: str
    priority: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SchemeResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    scheme_type: str
    max_income_limit: Optional[float] = None
    required_category: Optional[str] = None
    min_education_level: Optional[str] = None
    required_document_types: List[str] = []
    application_deadline: Optional[date] = None
    award_amount: Optional[float] = None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SchemeDetailResponse(SchemeResponse):
    rules: List[SchemeRuleResponse] = []
