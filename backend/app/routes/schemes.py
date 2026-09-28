from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.schemas.scheme import SchemeResponse, SchemeDetailResponse
from app.services import application_service

router = APIRouter(prefix=f"{settings.API_V1_STR}/schemes", tags=["schemes"])


@router.get("", response_model=List[SchemeResponse])
@router.get("/", include_in_schema=False, response_model=List[SchemeResponse])
async def list_schemes(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all active scholarship and fellowship schemes."""
    schemes = await application_service.list_schemes(db, active_only=active_only)
    return schemes


@router.get("/{scheme_id}", response_model=SchemeDetailResponse)
async def get_scheme(
    scheme_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete scheme details including eligibility evaluation rules."""
    scheme = await application_service.get_scheme(db, scheme_id=scheme_id)
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme with ID '{scheme_id}' was not found",
        )
    return scheme
