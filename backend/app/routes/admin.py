from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import require_admin
from app.db.models import User
from app.db.session import get_db
from app.schemas.admin import AdminReviewRequest, AdminReviewResponse
from app.schemas.application import ApplicationResponse, ApplicationDetailResponse
from app.services import application_service

router = APIRouter(prefix=f"{settings.API_V1_STR}/admin", tags=["admin"])

VALID_DECISIONS = {"approve", "reject", "request_info", "escalate"}


@router.get("/applications", response_model=List[ApplicationResponse])
async def list_all_applications(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all submitted applications with optional status filtering and pagination (Admin only)."""
    return await application_service.list_applications_for_admin(
        db=db,
        status_filter=status_filter,
        limit=limit,
        offset=offset,
    )


@router.get("/applications/{application_id}", response_model=ApplicationDetailResponse)
async def get_application_admin(
    application_id: UUID,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve complete application details for administrative review (Admin only)."""
    app = await application_service.get_application(db, application_id=application_id, eager_load=True)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )
    return app


@router.post("/applications/{application_id}/review", response_model=AdminReviewResponse)
async def review_application(
    application_id: UUID,
    body: AdminReviewRequest,
    user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Submit an officer review decision and comments on an application (Admin only)."""
    if body.decision not in VALID_DECISIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid decision '{body.decision}'. Must be one of: {sorted(list(VALID_DECISIONS))}",
        )

    app = await application_service.get_application(db, application_id=application_id, eager_load=True)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )

    # Record the admin review entry
    review = await application_service.create_admin_review(
        db=db,
        application_id=application_id,
        reviewer_id=user.id,
        decision=body.decision,
        comments=body.comments,
        checklist=body.checklist,
    )

    # Determine status transition based on decision
    new_status = None
    reason = body.comments or f"Administrative decision: {body.decision}"

    if body.decision == "approve":
        new_status = "approved"
    elif body.decision == "reject":
        new_status = "rejected"
    elif body.decision == "request_info":
        new_status = "deficient"
    elif body.decision == "escalate":
        # Keep current status or remain under_review
        pass

    if new_status and new_status != app.status:
        await application_service.update_application_status(
            db=db,
            application_id=application_id,
            new_status=new_status,
            changed_by_user_id=user.id,
            reason=reason,
        )

    # Create notification for applicant
    if app.applicant:
        await application_service.create_notification(
            db=db,
            user_id=app.applicant.user_id,
            notification_type="review",
            title=f"Application Review: {body.decision.replace('_', ' ').title()}",
            message=reason,
            application_id=application_id,
        )

    return review
