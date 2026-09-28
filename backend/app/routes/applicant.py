from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.db.models import User
from app.db.session import get_db
from app.schemas.application import ApplicantProfileResponse
from app.services import application_service

router = APIRouter(prefix=f"{settings.API_V1_STR}/applicant", tags=["applicant"])


@router.get("/profile", response_model=ApplicantProfileResponse)
async def get_my_profile(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve the current logged-in user's applicant profile."""
    applicant = await application_service.get_applicant_by_user_id(db, user.id)
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No applicant profile found for the authenticated user",
        )
    return applicant
