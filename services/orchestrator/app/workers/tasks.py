"""Celery tasks for asynchronous orchestration."""

from __future__ import annotations

import asyncio
import json
import logging
from statistics import mean
from uuid import UUID

from celery import Celery
from redis import Redis
from sqlalchemy import select

from ..clients import (
    call_facematch_service,
    call_ocr_service,
    call_risk_service,
)
from ..config import settings
from ..db import SessionLocal
from ..models import Document, FaceMatch, KYCApplication, KYCStatus
from ..services.audit_helper import create_audit_log

logger = logging.getLogger(__name__)

celery_app = Celery(
    "orchestrator",
    broker=settings.celery_broker_url,
    backend=settings.celery_backend_url,
)


@celery_app.task(bind=True, max_retries=3)
def process_kyc(self, application_id: str) -> None:
    """Celery entrypoint for KYC processing."""

    asyncio.run(_process_kyc(UUID(application_id)))


async def _process_kyc(application_id: UUID) -> None:
    """Asynchronous processing pipeline."""

    async with SessionLocal() as session:
        result = await session.execute(
            select(KYCApplication).where(KYCApplication.id == application_id)
        )
        application = result.scalar_one_or_none()
        if not application:
            logger.error("Application %s not found", application_id)
            return
        if application.status != KYCStatus.PROCESSING.value:
            logger.info("Application %s not in PROCESSING", application_id)
            return

        documents = application.documents
        id_doc = next((doc for doc in documents if doc.doc_type == "id_card"), None)
        selfie_doc = next((doc for doc in documents if doc.doc_type == "selfie"), None)

        if not id_doc or not selfie_doc:
            logger.error("Missing required documents for %s", application_id)
            return

        # Placeholder bytes; production would fetch from storage.
        fake_bytes = b"stub"

        for doc in documents:
            ocr = call_ocr_service(
                str(application.id),
                doc.doc_type,
                fake_bytes,
                meta={"doc_type": doc.doc_type},
            )
            doc.ocr_json = ocr.get("ocr_json")
            doc.doc_confidence = ocr.get("doc_confidence", 0.8)
            doc.doc_hash = ocr.get("doc_hash", doc.doc_hash)
            session.add(doc)

        facematch = call_facematch_service(
            str(application.id),
            fake_bytes,
            fake_bytes,
        )
        face_record = application.face_match or FaceMatch(application_id=application.id)
        face_record.similarity_score = facematch.get("similarity", 0.8)
        face_record.liveness_result = facematch.get("liveness_result", "UNKNOWN")
        face_record.embedding_hash = facematch.get("embedding_hash")
        session.add(face_record)

        doc_confidences = [doc.doc_confidence or 0 for doc in documents]
        features = {
            "doc_confidence": mean(doc_confidences) if doc_confidences else 0,
            "face_similarity": face_record.similarity_score or 0,
            "sanctions_hit": 0,
            "geo_variance": 0,
            "device_trust_score": 0.7,
        }
        risk_response = call_risk_service(
            str(application.id),
            features,
            meta={"actor": "orchestrator"},
        )
        application.risk_score = risk_response.get("risk_score")
        application.drpa_level = risk_response.get("drpa_level")
        threshold = settings.risk_approve_threshold
        if application.risk_score is not None and application.risk_score < threshold:
            application.status = KYCStatus.APPROVED.value
        else:
            application.status = KYCStatus.FLAGGED.value
        session.add(application)
        await session.commit()

        await create_audit_log(
            session,
            application_id=application.id,
            actor="orchestrator",
            action="risk_scored",
            payload={
                "features": features,
                "risk_response": risk_response,
            },
        )

        # Publish minimal event
        try:
            redis_client = Redis.from_url(settings.redis_url)
            redis_client.publish(
                "risk_scored",
                json.dumps(
                    {
                        "application_id": str(application.id),
                        "risk_score": application.risk_score,
                    }
                ),
            )
        except Exception as exc:  # pragma: no cover
            logger.warning("Failed to publish Redis event: %s", exc)

