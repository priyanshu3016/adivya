from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_active_user, require_admin
from app.db.models import User
from app.db.session import get_db
from app.schemas.verification import (
    VerificationResultResponse,
    DeficiencyResponse,
    VerificationSummaryResponse,
)
from app.services import application_service, verification_service

router = APIRouter(prefix=f"{settings.API_V1_STR}/applications/{{application_id}}", tags=["verification"])


async def _verify_access(application_id: UUID, user: User, db: AsyncSession):
    """Verify application exists and user has permission to view."""
    app = await application_service.get_application(db, application_id=application_id, eager_load=False)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if user.role != "admin":
        applicant = await application_service.get_applicant_by_user_id(db, user.id)
        if not applicant or app.applicant_id != applicant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this application's verification results",
            )
    return app


@router.get("/verification", response_model=List[VerificationResultResponse])
async def get_verification_results(
    application_id: UUID,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all verification evaluation results for an application."""
    await _verify_access(application_id, user, db)
    return await verification_service.get_application_verification_results(db, application_id=application_id)


@router.post("/verify", response_model=VerificationSummaryResponse)
async def trigger_verification(
    application_id: UUID,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Trigger the automated rule verification pipeline for an application (Admin only)."""
    app = await application_service.get_application(db, application_id=application_id, eager_load=False)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Transition to under_review if currently submitted or draft
    if app.status in ("submitted", "draft"):
        await application_service.update_application_status(
            db=db,
            application_id=application_id,
            new_status="under_review",
            changed_by_user_id=user.id,
            reason="Automated verification pipeline triggered by administrator",
        )

    summary = await verification_service.run_verification(db, application_id=application_id)
    return summary


@router.get("/deficiencies", response_model=List[DeficiencyResponse])
async def get_deficiencies(
    application_id: UUID,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all deficiency items flagged for an application."""
    await _verify_access(application_id, user, db)
    return await verification_service.get_application_deficiencies(db, application_id=application_id)


@router.post("/deficiencies/{deficiency_id}/resolve", response_model=DeficiencyResponse)
async def resolve_deficiency(
    application_id: UUID,
    deficiency_id: UUID,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Mark a deficiency as resolved (Admin only). Transitions to 'verified' if all critical deficiencies are resolved."""
    app = await application_service.get_application(db, application_id=application_id, eager_load=False)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    try:
        resolved = await verification_service.resolve_deficiency(
            db=db,
            application_id=application_id,
            deficiency_id=deficiency_id,
        )
        return resolved
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
