"""HTTP clients for downstream services with retry + optional stubs."""

from __future__ import annotations

import base64
import json
import logging
from pathlib import Path
from typing import Any

import httpx
from tenacity import RetryError, retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from .config import settings

logger = logging.getLogger(__name__)
ROOT_DIR = Path(__file__).resolve().parents[1]
FIXTURES_DIR = ROOT_DIR / "test_fixtures"


class ClientError(RuntimeError):
    """Custom exception for downstream client failures."""


def _stub_payload(name: str) -> dict[str, Any]:
    """Load JSON stub payloads when USE_STUBS is enabled."""

    path = FIXTURES_DIR / f"{name}.json"
    if not path.exists():
        raise ClientError(f"Missing stub fixture: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def _http_client() -> httpx.Client:
    """Instantiate a configured httpx client."""

    return httpx.Client(timeout=settings.process_timeout)


def _should_retry(response: httpx.Response) -> bool:
    """Return True if response indicates retryable state."""

    return response.status_code in (502, 503, 504)


def _request_with_retry(
    method: str,
    url: str,
    **kwargs: Any,
) -> httpx.Response:
    """Perform HTTP request with retry + logging."""

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type((httpx.RequestError, ClientError)),
        reraise=True,
    )
    def _do_request() -> httpx.Response:
        with _http_client() as client:
            logger.debug("HTTP %s %s", method, url)
            response = client.request(method, url, **kwargs)
            if _should_retry(response):
                logger.warning("Retryable status %s from %s", response.status_code, url)
                raise ClientError(f"Retryable status {response.status_code}")
            response.raise_for_status()
            return response

    try:
        return _do_request()
    except RetryError as exc:  # pragma: no cover - defensive logging
        raise ClientError(f"Failed calling {url}") from exc


def upload_to_storage(file_bytes: bytes, filename: str) -> dict[str, Any]:
    """Upload a file to Storage service."""

    if settings.use_stubs:
        payload = _stub_payload("storage_upload_response")
        payload["storage_path"] = payload["storage_path"].replace("filename", filename)
        return payload

    files = {"file": (filename, file_bytes)}
    response = _request_with_retry(
        "POST",
        f"{settings.service_urls.storage}/store/upload",
        files=files,
    )
    return response.json()


def call_ocr_service(
    application_id: str,
    doc_type: str,
    image_bytes: bytes,
    meta: dict[str, Any],
) -> dict[str, Any]:
    """Call OCR inference service."""

    if settings.use_stubs:
        payload = _stub_payload("ocr_infer_response")
        payload["application_id"] = application_id
        payload["document_type"] = doc_type
        return payload

    encoded = base64.b64encode(image_bytes).decode()
    response = _request_with_retry(
        "POST",
        f"{settings.service_urls.ocr}/infer/document",
        json={
            "application_id": application_id,
            "document_type": doc_type,
            "image_base64": encoded,
            "meta": meta,
        },
    )
    return response.json()


def call_facematch_service(
    application_id: str,
    id_photo_bytes: bytes,
    selfie_bytes: bytes,
) -> dict[str, Any]:
    """Call FaceMatch service."""

    if settings.use_stubs:
        payload = _stub_payload("face_match_response")
        payload["application_id"] = application_id
        return payload

    response = _request_with_retry(
        "POST",
        f"{settings.service_urls.facematch}/face/match",
        json={
            "application_id": application_id,
            "id_photo_base64": base64.b64encode(id_photo_bytes).decode(),
            "selfie_base64": base64.b64encode(selfie_bytes).decode(),
            "require_liveness": True,
        },
    )
    return response.json()


def call_risk_service(
    application_id: str,
    features: dict[str, Any],
    meta: dict[str, Any],
) -> dict[str, Any]:
    """Call Risk scoring service."""

    if settings.use_stubs:
        payload = _stub_payload("risk_score_response")
        payload["application_id"] = application_id
        payload["features"] = features
        return payload

    response = _request_with_retry(
        "POST",
        f"{settings.service_urls.risk}/score",
        json={
            "application_id": application_id,
            "features": features,
            "meta": meta,
        },
    )
    return response.json()


def call_audit_append(payload: dict[str, Any]) -> dict[str, Any]:
    """Append entry to Audit service."""

    if settings.use_stubs:
        stub = _stub_payload("audit_append_response")
        stub["payload"] = payload
        return stub

    response = _request_with_retry(
        "POST",
        f"{settings.service_urls.audit}/audit/append",
        json=payload,
    )
    return response.json()

