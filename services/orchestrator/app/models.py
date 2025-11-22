"""Database models for the orchestrator service."""

from __future__ import annotations

import uuid
from datetime import datetime

from enum import Enum as PyEnum

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Declarative base class for ORM models."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )


class TimestampMixin:
    """Mixin providing timestamp columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )


class User(Base):
    """Application user capable of submitting KYC applications."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    is_staff: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    applications: Mapped[list["KYCApplication"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class KYCStatus(str, PyEnum):
    """Enumeration of application states."""

    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    APPROVED = "APPROVED"
    FLAGGED = "FLAGGED"
    REJECTED = "REJECTED"


class DRPALevel(str, PyEnum):
    """Enumeration of DRPA (risk) levels."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class KYCApplication(Base, TimestampMixin):
    """KYC application entity."""

    __tablename__ = "kyc_applications"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    method: Mapped[str] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(32), default=KYCStatus.PENDING.value)
    risk_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    drpa_level: Mapped[str | None] = mapped_column(String(16), nullable=True)

    user: Mapped[User] = relationship(back_populates="applications")
    documents: Mapped[list["Document"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )
    face_match: Mapped["FaceMatch | None"] = relationship(
        back_populates="application", uselist=False, cascade="all, delete-orphan"
    )
    audits: Mapped[list["AuditLog"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )


class Document(Base, TimestampMixin):
    """Documents linked to a KYC application."""

    __tablename__ = "documents"

    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("kyc_applications.id"), index=True
    )
    doc_type: Mapped[str] = mapped_column(String(32))
    storage_path: Mapped[str] = mapped_column(String(512))
    doc_hash: Mapped[str] = mapped_column(String(128))
    ocr_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    doc_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    application: Mapped[KYCApplication] = relationship(back_populates="documents")


class FaceMatch(Base, TimestampMixin):
    """Face match results for an application."""

    __tablename__ = "face_match"
    __table_args__ = (UniqueConstraint("application_id", name="uq_face_application"),)

    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("kyc_applications.id"), index=True
    )
    similarity_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    liveness_result: Mapped[str | None] = mapped_column(String(16), nullable=True)
    embedding_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)

    application: Mapped[KYCApplication] = relationship(back_populates="face_match")


class AuditLog(Base):
    """Audit trail entries linked to applications."""

    __tablename__ = "audit_logs"
    __table_args__ = (Index("idx_audit_application", "application_id"),)

    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("kyc_applications.id"), index=True, nullable=True
    )
    actor: Mapped[str] = mapped_column(String(128))
    action: Mapped[str] = mapped_column(String(128))
    payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    log_hash: Mapped[str | None] = mapped_column(String(256), nullable=True)
    external_audit_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow
    )

    application: Mapped[KYCApplication | None] = relationship(back_populates="audits")


Index("idx_documents_app", Document.application_id)
Index("idx_face_match_app", FaceMatch.application_id)

