"""Audit routes."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import get_current_staff
from ..db import get_db
from ..schemas import AuditLogResponse
from ..services import orchestrator_service

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/{application_id}", response_model=list[AuditLogResponse])
async def get_audit_entries(
    application_id: UUID,
    _staff=Depends(get_current_staff),
    session: AsyncSession = Depends(get_db),
) -> list[AuditLogResponse]:
    """Return audit logs for an application."""

    audits = await orchestrator_service.fetch_audit_logs(session, application_id)
    return [
        AuditLogResponse(
            actor=a.actor,
            action=a.action,
            payload=a.payload,
            log_hash=a.log_hash,
            created_at=a.created_at,
        )
        for a in audits
    ]

