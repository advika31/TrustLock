"""KYC lifecycle routes."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_user
from ..db import get_db
from ..models import User
from ..schemas import (
    KYCResultResponse,
    KYCStartRequest,
    KYCStartResponse,
    KYCStatusResponse,
    KYCUploadResponse,
)
from ..services import orchestrator_service

router = APIRouter(prefix="/kyc", tags=["kyc"])


@router.post("/start", response_model=KYCStartResponse, status_code=status.HTTP_201_CREATED)
async def start_kyc(
    payload: KYCStartRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> KYCStartResponse:
    """Create a KYC application."""

    application = await orchestrator_service.start_kyc_application(session, user, payload)
    return KYCStartResponse(application_id=application.id)


@router.post("/upload", response_model=KYCUploadResponse)
async def upload_documents(
    application_id: UUID = Form(...),
    id_front: UploadFile = File(...),
    selfie: UploadFile = File(...),
    id_back: UploadFile | None = File(None),
    device_info: str | None = Form(None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> KYCUploadResponse:
    """Upload KYC documents and enqueue processing."""

    application = await orchestrator_service.handle_upload(
        session,
        user,
        application_id=application_id,
        id_front=id_front,
        selfie=selfie,
        id_back=id_back,
        device_info=device_info,
    )
    return KYCUploadResponse(
        message="Upload received, processing started",
        application_id=application.id,
    )


@router.get("/status/{application_id}", response_model=KYCStatusResponse)
async def get_status(
    application_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> KYCStatusResponse:
    """Return current application status."""

    application = await orchestrator_service.get_application_or_404(
        session, application_id, owner_id=user.id
    )
    return await orchestrator_service.get_status_response(application)


@router.get("/result/{application_id}", response_model=KYCResultResponse)
async def get_result(
    application_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> KYCResultResponse:
    """Return final result with audit data."""

    application = await orchestrator_service.get_application_or_404(
        session, application_id, owner_id=user.id
    )
    audits = await orchestrator_service.fetch_audit_logs(session, application_id)
    explanations = []
    audit_id = None
    if audits:
        last = audits[-1]
        risk_payload = (last.payload or {}).get("risk_response", {})
        explanations = risk_payload.get("explanations", [])
        audit_id = risk_payload.get("audit_id") or last.external_audit_id
    return orchestrator_service.build_result_response(
        application,
        explanations=explanations,
        audit_id=audit_id,
    )

