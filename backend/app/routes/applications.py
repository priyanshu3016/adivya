from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.db.models import User, Application
from app.db.session import get_db
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationDetailResponse,
)
from app.services import application_service

router = APIRouter(prefix=f"{settings.API_V1_STR}/applications", tags=["applications"])


def _build_applicant_snapshot(applicant) -> Dict[str, Any]:
    """Capture a point-in-time dictionary snapshot of applicant profile data."""
    return {
        "applicant_id": str(applicant.id),
        "user_id": str(applicant.user_id),
        "full_name": applicant.full_name,
        "date_of_birth": str(applicant.date_of_birth) if applicant.date_of_birth else None,
        "gender": applicant.gender,
        "category": applicant.category,
        "tribe_name": applicant.tribe_name,
        "state": applicant.state,
        "district": applicant.district,
        "address": applicant.address,
        "phone": applicant.phone,
        "annual_family_income": (
            float(applicant.annual_family_income)
            if applicant.annual_family_income is not None
            else None
        ),
        "current_education_level": applicant.current_education_level,
        "institution_name": applicant.institution_name,
        "course_name": applicant.course_name,
    }


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", include_in_schema=False, response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_application(
    body: ApplicationCreate,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new scholarship application draft for the current applicant."""
    applicant = await application_service.get_applicant_by_user_id(db, user.id)
    if not applicant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An applicant profile must exist before creating an application",
        )

    scheme = await application_service.get_scheme(db, body.scheme_id)
    if not scheme or not scheme.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested scheme does not exist or is inactive",
        )

    snapshot = _build_applicant_snapshot(applicant)
    application = await application_service.create_application(
        db=db,
        applicant_id=applicant.id,
        scheme_id=scheme.id,
        academic_year=body.academic_year,
        snapshot=snapshot,
    )
    return application


@router.get("", response_model=List[ApplicationResponse])
@router.get("/", include_in_schema=False, response_model=List[ApplicationResponse])
async def list_my_applications(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all applications for the authenticated applicant."""
    applicant = await application_service.get_applicant_by_user_id(db, user.id)
    if not applicant:
        return []
    return await application_service.list_applications_by_applicant(db, applicant.id)


@router.get("/{application_id}", response_model=ApplicationDetailResponse)
async def get_application(
    application_id: UUID,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full application details, documents, extractions, deficiencies, and audit history."""
    application = await application_service.get_application(db, application_id=application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Authorization check: only owner applicant or administrator may access
    if user.role != "admin":
        applicant = await application_service.get_applicant_by_user_id(db, user.id)
        if not applicant or application.applicant_id != applicant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this application",
            )

    return application


@router.post("/{application_id}/submit", response_model=ApplicationResponse)
async def submit_application(
    application_id: UUID,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a draft or deficient application for automated verification and review."""
    application = await application_service.get_application(db, application_id=application_id, eager_load=False)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    # Authorization check
    if user.role != "admin":
        applicant = await application_service.get_applicant_by_user_id(db, user.id)
        if not applicant or application.applicant_id != applicant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to submit this application",
            )

    # Status check
    if application.status not in ("draft", "deficient"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit application with current status '{application.status}'. Only 'draft' or 'deficient' applications can be submitted.",
        )

    applicant = await application_service.get_applicant(db, application.applicant_id)
    if applicant:
        application.applicant_snapshot = _build_applicant_snapshot(applicant)

    updated = await application_service.update_application_status(
        db=db,
        application_id=application_id,
        new_status="submitted",
        changed_by_user_id=user.id,
        reason="Application submitted by applicant for verification",
    )
    return updated
