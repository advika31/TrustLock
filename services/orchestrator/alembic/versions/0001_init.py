"""Initial schema."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Apply migration."""

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("phone", sa.String(length=32)),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("is_staff", sa.Boolean(), default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "kyc_applications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=False,
        ),
        sa.Column("method", sa.String(length=32), nullable=False),
        sa.Column("status", sa.String(length=32), default="PENDING"),
        sa.Column("risk_score", sa.Integer()),
        sa.Column("drpa_level", sa.String(length=16)),
    )
    op.create_index("ix_kyc_user", "kyc_applications", ["user_id"])

    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("kyc_applications.id"),
            nullable=False,
        ),
        sa.Column("doc_type", sa.String(length=32), nullable=False),
        sa.Column("storage_path", sa.String(length=512), nullable=False),
        sa.Column("doc_hash", sa.String(length=128), nullable=False),
        sa.Column("ocr_json", sa.JSON()),
        sa.Column("doc_confidence", sa.Float()),
    )
    op.create_index("idx_documents_app", "documents", ["application_id"])

    op.create_table(
        "face_match",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("kyc_applications.id"),
            nullable=False,
        ),
        sa.Column("similarity_score", sa.Float()),
        sa.Column("liveness_result", sa.String(length=16)),
        sa.Column("embedding_hash", sa.String(length=128)),
    )
    op.create_unique_constraint(
        "uq_face_application", "face_match", ["application_id"]
    )
    op.create_index("idx_face_match_app", "face_match", ["application_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "application_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("kyc_applications.id"),
        ),
        sa.Column("actor", sa.String(length=128), nullable=False),
        sa.Column("action", sa.String(length=128), nullable=False),
        sa.Column("payload", sa.JSON()),
        sa.Column("log_hash", sa.String(length=256)),
        sa.Column("external_audit_id", sa.String(length=128)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_audit_application", "audit_logs", ["application_id"])


def downgrade() -> None:
    """Rollback migration."""

    op.drop_table("audit_logs")
    op.drop_table("face_match")
    op.drop_table("documents")
    op.drop_table("kyc_applications")
    op.drop_table("users")

