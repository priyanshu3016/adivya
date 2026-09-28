import asyncio
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.db.models import User, Document
from app.db.session import get_db
from app.schemas.document import DocumentResponse, ExtractionResponse
from app.services import application_service, document_service

router = APIRouter(prefix=f"{settings.API_V1_STR}/applications/{{application_id}}/documents", tags=["documents"])


async def _verify_application_access(
    application_id: UUID,
    user: User,
    db: AsyncSession,
):
    """Ensure application exists and requesting user is owner applicant or admin."""
    application = await application_service.get_application(db, application_id=application_id, eager_load=False)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found",
        )

    if user.role != "admin":
        applicant = await application_service.get_applicant_by_user_id(db, user.id)
        if not applicant or application.applicant_id != applicant.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this application's documents",
            )

    return application


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", include_in_schema=False, response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    application_id: UUID,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a verification document (image) for an application."""
    application = await _verify_application_access(application_id, user, db)

    # Allow uploads during draft and deficient stages
    if application.status not in ("draft", "deficient"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Documents cannot be uploaded when application status is '{application.status}'. "
                "Uploads are only permitted in 'draft' or 'deficient' status."
            ),
        )

    file_path, mime_type, file_size_bytes = await document_service.save_uploaded_file(
        application_id=application_id,
        document_type=document_type,
        file=file,
    )

    doc = await application_service.create_document_record(
        db=db,
        application_id=application_id,
        document_type=document_type,
        file_name=file.filename or f"{document_type}.png",
        file_path=file_path,
        mime_type=mime_type,
        file_size_bytes=file_size_bytes,
    )
    return doc


@router.get("", response_model=List[DocumentResponse])
@router.get("/", include_in_schema=False, response_model=List[DocumentResponse])
async def list_documents(
    application_id: UUID,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all documents uploaded for the given application."""
    await _verify_application_access(application_id, user, db)
    documents = await application_service.list_application_documents(db, application_id=application_id)
    return documents


@router.post("/{document_id}/process", response_model=ExtractionResponse)
async def process_document_extraction(
    application_id: UUID,
    document_id: UUID,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Trigger Document AI extraction pipeline on an uploaded document."""
    await _verify_application_access(application_id, user, db)

    doc = await db.get(Document, document_id)
    if not doc or doc.application_id != application_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found for this application",
        )

    # Set document status to processing
    doc.upload_status = "processing"
    await db.flush()

    # Offload CPU-bound Document AI OCR to thread pool executor
    loop = asyncio.get_running_loop()
    extraction_result = await loop.run_in_executor(
        None,
        document_service.run_document_extraction,
        doc.file_path,
        str(doc.id),
    )

    # Store extraction results into database
    extraction = await application_service.store_extraction(
        db=db,
        document_id=doc.id,
        extracted_fields=extraction_result.get("fields", {}),
        extraction_status=extraction_result.get("extraction_status", "failed"),
        document_type=extraction_result.get("document_type") or doc.document_type,
        errors=extraction_result.get("errors", []),
        ocr_confidence=extraction_result.get("ocr_confidence"),
    )

    return extraction
