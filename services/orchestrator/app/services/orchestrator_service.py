"""Business logic for orchestrator endpoints."""

from __future__ import annotations

import json
import logging
from typing import Iterable
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from .. import schemas
from ..clients import upload_to_storage
from ..config import settings
from ..models import AuditLog, Document, KYCApplication, KYCStatus, User
from ..services.audit_helper import create_audit_log
from ..workers.tasks import process_kyc

logger = logging.getLogger(__name__)


async def register_user(
    session: AsyncSession,
    payload: schemas.UserRegisterRequest,
    *,
    password_hash: str,
    is_staff: bool = False,
) -> User:
    """Register a new user or staff."""

    existing = await session.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email in use")

    user = User(
        email=payload.email,
        phone=payload.phone,
        password_hash=password_hash,
        is_staff=is_staff,
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


async def get_application_or_404(
    session: AsyncSession,
    application_id: UUID,
    *,
    owner_id: UUID | None = None,
) -> KYCApplication:
    """Fetch application ensuring ownership when provided."""

    result = await session.execute(
        select(KYCApplication)
        .options(
            selectinload(KYCApplication.documents),
            selectinload(KYCApplication.audits),
        )
        .where(KYCApplication.id == application_id)
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    if owner_id and application.user_id != owner_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return application


async def start_kyc_application(
    session: AsyncSession,
    user: User,
    payload: schemas.KYCStartRequest,
) -> KYCApplication:
    """Create a new KYC application."""

    application = KYCApplication(user_id=user.id, method=payload.method)
    session.add(application)
    await session.commit()
    await session.refresh(application)
    await create_audit_log(
        session,
        application_id=application.id,
        actor=str(user.id),
        action="kyc_start",
        payload={"method": payload.method},
    )
    return application


async def _persist_document(
    session: AsyncSession,
    application: KYCApplication,
    *,
    file: UploadFile,
    doc_type: str,
) -> Document:
    """Store a file via Storage service and persist Document metadata."""

    file_bytes = await file.read()
    storage_response = upload_to_storage(file_bytes, file.filename or doc_type)
    document = Document(
        application_id=application.id,
        doc_type=doc_type,
        storage_path=storage_response["storage_path"],
        doc_hash=storage_response.get("hash", "na"),
    )
    session.add(document)
    await session.flush()
    logger.info(
        "Document stored app=%s type=%s path=%s",
        application.id,
        doc_type,
        document.storage_path,
    )
    return document


async def handle_upload(
    session: AsyncSession,
    user: User,
    *,
    application_id: UUID,
    id_front: UploadFile,
    selfie: UploadFile,
    id_back: UploadFile | None = None,
    device_info: str | None = None,
) -> KYCApplication:
    """Process upload request and enqueue Celery task."""

    application = await get_application_or_404(
        session, application_id, owner_id=user.id
    )
    if application.status not in {KYCStatus.PENDING.value, KYCStatus.PROCESSING.value}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application already processed",
        )

    await _persist_document(session, application, file=id_front, doc_type="id_card")
    if id_back:
        await _persist_document(session, application, file=id_back, doc_type="address_proof")
    await _persist_document(session, application, file=selfie, doc_type="selfie")

    application.status = KYCStatus.PROCESSING.value
    session.add(application)
    await session.commit()

    meta = {}
    if device_info:
        try:
            meta = json.loads(device_info)
        except json.JSONDecodeError:
            meta = {"raw": device_info}
    await create_audit_log(
        session,
        application_id=application.id,
        actor=str(user.id),
        action="kyc_upload",
        payload={"device_info": meta},
    )

    process_kyc.delay(str(application.id))
    logger.info("Enqueued process_kyc for %s", application.id)
    return application


async def get_status_response(
    application: KYCApplication,
) -> schemas.KYCStatusResponse:
    """Convert application to status response."""

    return schemas.KYCStatusResponse(
        application_id=application.id,
        status=application.status,
        risk_score=application.risk_score,
        drpa_level=application.drpa_level,
    )


async def list_flagged_applications(session: AsyncSession) -> list[schemas.ReviewQueueItem]:
    """Return all flagged applications."""

    result = await session.execute(
        select(KYCApplication, User)
        .join(User, KYCApplication.user_id == User.id)
        .where(KYCApplication.status == KYCStatus.FLAGGED.value)
    )
    items: list[schemas.ReviewQueueItem] = []
    for app, user in result.all():
        items.append(
            schemas.ReviewQueueItem(
                application_id=app.id,
                user_email=user.email,
                risk_score=app.risk_score,
                status=app.status,
                updated_at=app.updated_at,
            )
        )
    return items


async def fetch_audit_logs(session: AsyncSession, application_id: UUID) -> list[AuditLog]:
    """Fetch audit logs for an application."""

    result = await session.execute(
        select(AuditLog)
        .where(AuditLog.application_id == application_id)
        .order_by(AuditLog.created_at.asc())
    )
    return list(result.scalars().all())


async def apply_review_action(
    session: AsyncSession,
    *,
    application: KYCApplication,
    reviewer: User,
    payload: schemas.ReviewActionRequest,
) -> KYCApplication:
    """Apply reviewer decision."""

    status_mapping = {
        "approve": KYCStatus.APPROVED.value,
        "reject": KYCStatus.REJECTED.value,
        "request_info": KYCStatus.FLAGGED.value,
    }
    application.status = status_mapping[payload.action]
    session.add(application)
    await session.commit()
    await create_audit_log(
        session,
        application_id=application.id,
        actor=str(reviewer.id),
        action=f"review_{payload.action}",
        payload={"notes": payload.notes},
    )
    return application


def build_result_response(
    application: KYCApplication,
    *,
    explanations: Iterable[dict] | None = None,
    audit_id: str | None = None,
) -> schemas.KYCResultResponse:
    """Construct result response."""

    return schemas.KYCResultResponse(
        application_id=application.id,
        status=application.status,
        risk_score=application.risk_score,
        drpa_level=application.drpa_level,
        explanations=list(explanations or []),
        audit_id=audit_id,
    )

