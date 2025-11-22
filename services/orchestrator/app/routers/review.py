"""Reviewer endpoints for staff members."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_staff
from ..db import get_db
from ..models import User
from ..schemas import AuditLogResponse, ReviewActionRequest, ReviewQueueItem
from ..services import orchestrator_service

router = APIRouter(prefix="/review", tags=["review"])


@router.get("/queue", response_model=list[ReviewQueueItem])
async def review_queue(
    _: User = Depends(get_current_staff),
    session: AsyncSession = Depends(get_db),
) -> list[ReviewQueueItem]:
    """Return queue of flagged applications."""

    return await orchestrator_service.list_flagged_applications(session)


@router.get("/{application_id}")
async def review_detail(
    application_id: UUID,
    _: User = Depends(get_current_staff),
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Return detail for a KYC application."""

    application = await orchestrator_service.get_application_or_404(session, application_id)
    documents = [
        {
            "doc_type": doc.doc_type,
            "storage_path": doc.storage_path,
            "doc_confidence": doc.doc_confidence,
        }
        for doc in application.documents
    ]
    audits = await orchestrator_service.fetch_audit_logs(session, application_id)
    return {
        "application": orchestrator_service.build_result_response(application).model_dump(),
        "documents": documents,
        "audits": [
            AuditLogResponse(
                actor=a.actor,
                action=a.action,
                payload=a.payload,
                log_hash=a.log_hash,
                created_at=a.created_at,
            ).model_dump()
            for a in audits
        ],
    }


@router.post("/{application_id}/action")
async def review_action(
    application_id: UUID,
    payload: ReviewActionRequest,
    reviewer: User = Depends(get_current_staff),
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Perform review action."""

    application = await orchestrator_service.get_application_or_404(session, application_id)
    application = await orchestrator_service.apply_review_action(
        session, application=application, reviewer=reviewer, payload=payload
    )
    return {"status": application.status}



