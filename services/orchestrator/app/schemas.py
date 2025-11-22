"""Pydantic schemas for request and response models."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Schema for user registration."""

    email: EmailStr
    phone: str | None = None
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    """Schema returned after user registration."""

    id: UUID
    email: EmailStr


class TokenResponse(BaseModel):
    """Authentication token response."""

    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Schema for login endpoints."""

    email: EmailStr
    password: str


class KYCStartRequest(BaseModel):
    """Request payload for starting a new KYC application."""

    method: str = Field(pattern="^(doc|ssi|branch)$", default="doc")


class KYCStartResponse(BaseModel):
    """Response after creating a KYC application."""

    application_id: UUID


class KYCUploadResponse(BaseModel):
    """Response returned after upload endpoint."""

    message: str
    application_id: UUID


class KYCStatusResponse(BaseModel):
    """Response for KYC status endpoint."""

    application_id: UUID
    status: str
    risk_score: int | None = None
    drpa_level: str | None = None


class KYCResultResponse(KYCStatusResponse):
    """Detailed result response including explanations."""

    explanations: list[dict[str, Any]] = Field(default_factory=list)
    audit_id: str | None = None


class ReviewQueueItem(BaseModel):
    """Item returned in reviewer queue."""

    application_id: UUID
    user_email: EmailStr
    risk_score: int | None = None
    status: str
    updated_at: datetime


class ReviewActionRequest(BaseModel):
    """Reviewer action request."""

    action: str = Field(pattern="^(approve|reject|request_info)$")
    notes: str | None = None


class AuditLogResponse(BaseModel):
    """Audit log entry response."""

    actor: str
    action: str
    payload: dict | None = None
    log_hash: str | None = None
    created_at: datetime


class HealthResponse(BaseModel):
    """Health check response."""

    db: str
    redis: str

