"""End-to-end tests for the KYC flow."""

from __future__ import annotations

import uuid

import pytest
from httpx import AsyncClient

from app.auth import get_password_hash
from app.models import User
from app.workers.tasks import _process_kyc


@pytest.mark.asyncio
async def test_full_kyc_flow(client: AsyncClient, db_session):
    """Ensure start -> upload -> process -> status works."""

    register_resp = await client.post(
        "/user/register",
        json={"email": "user1@example.com", "password": "password123"},
    )
    assert register_resp.status_code == 201

    login_resp = await client.post(
        "/auth/login",
        json={"email": "user1@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    start_resp = await client.post("/kyc/start", json={"method": "doc"}, headers=headers)
    app_id = start_resp.json()["application_id"]

    files = {
        "application_id": (None, app_id),
        "id_front": ("id.jpg", b"fake", "image/jpeg"),
        "selfie": ("selfie.jpg", b"fake", "image/jpeg"),
    }
    upload_resp = await client.post("/kyc/upload", headers=headers, files=files)
    assert upload_resp.status_code == 200

    await _process_kyc(uuid.UUID(app_id))

    status_resp = await client.get(f"/kyc/status/{app_id}", headers=headers)
    assert status_resp.json()["status"] in {"APPROVED", "FLAGGED"}

    result_resp = await client.get(f"/kyc/result/{app_id}", headers=headers)
    assert "risk_score" in result_resp.json()


@pytest.mark.asyncio
async def test_reviewer_flow(client: AsyncClient, db_session):
    """Staff reviewer can view queue and take action."""

    staff = User(
        email="staff@example.com",
        password_hash=get_password_hash("password123"),
        is_staff=True,
    )
    db_session.add(staff)
    await db_session.commit()

    login_resp = await client.post(
        "/auth/staff/login",
        json={"email": "staff@example.com", "password": "password123"},
    )
    assert login_resp.status_code == 200

    # Seed flagged application
    flagged_user = User(
        email="flagged@example.com",
        password_hash=get_password_hash("password123"),
        is_staff=False,
    )
    db_session.add(flagged_user)
    await db_session.flush()

    from app.models import KYCApplication, KYCStatus

    application = KYCApplication(
        user_id=flagged_user.id,
        method="doc",
        status=KYCStatus.FLAGGED.value,
    )
    db_session.add(application)
    await db_session.commit()

    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    queue_resp = await client.get("/review/queue", headers=headers)
    assert queue_resp.status_code == 200
    assert any(item["application_id"] == str(application.id) for item in queue_resp.json())

    action_resp = await client.post(
        f"/review/{application.id}/action",
        headers=headers,
        json={"action": "approve"},
    )
    assert action_resp.status_code == 200
    assert action_resp.json()["status"] == "APPROVED"

