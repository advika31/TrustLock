"""Audit helper utilities."""

from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from ..clients import call_audit_append
from ..models import AuditLog

logger = logging.getLogger(__name__)


async def create_audit_log(
    session: AsyncSession,
    *,
    application_id: UUID | None,
    actor: str,
    action: str,
    payload: dict[str, Any] | None = None,
) -> AuditLog:
    """Persist an audit log locally and via external service."""

    audit_payload = {
        "application_id": str(application_id) if application_id else None,
        "actor": actor,
        "action": action,
        "payload": payload or {},
    }
    external_response = call_audit_append(audit_payload)

    audit_log = AuditLog(
        application_id=application_id,
        actor=actor,
        action=action,
        payload=payload,
        log_hash=external_response.get("log_hash"),
        external_audit_id=external_response.get("audit_id"),
    )
    session.add(audit_log)
    await session.commit()
    await session.refresh(audit_log)
    logger.info(
        "Audit log created action=%s app=%s hash=%s",
        action,
        application_id,
        audit_log.log_hash,
    )
    return audit_log

