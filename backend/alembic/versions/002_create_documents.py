"""Create documents table

Revision ID: 002_create_documents
Revises: 001_create_users
Create Date: 2026-07-03
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_create_documents"
down_revision: Union[str, None] = "001_create_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Alembic creates documenttype/documentstatus enums automatically
    # as part of create_table — no manual op.execute needed.
    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True, nullable=False),

        # Metadata
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("original_filename", sa.String(500), nullable=False),
        sa.Column("stored_filename", sa.String(500), nullable=False),
        sa.Column("file_path", sa.String(1000), nullable=False),
        sa.Column("file_size", sa.BigInteger, nullable=False),
        sa.Column("mime_type", sa.String(200), nullable=False),
        sa.Column(
            "document_type",
            sa.Enum("pdf", "docx", "txt", "image", "manual", "sop",
                    "maintenance_log", "other", name="documenttype"),
            nullable=False,
            server_default="other",
        ),

        # Processing pipeline
        sa.Column(
            "status",
            sa.Enum("uploaded", "processing", "extracting",
                    "embedding", "ready", "failed", name="documentstatus"),
            nullable=False,
            server_default="uploaded",
        ),
        sa.Column("page_count", sa.Integer, nullable=True),
        sa.Column("chunk_count", sa.Integer, nullable=True),
        sa.Column("processing_error", sa.Text, nullable=True),

        # Qdrant reference (used in Milestone 3)
        sa.Column("qdrant_collection", sa.String(200), nullable=True),

        # Ownership
        sa.Column(
            "owner_id",
            sa.String(36),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),

        # Classification
        sa.Column("tags", sa.Text, nullable=True),
        sa.Column("category", sa.String(200), nullable=True),
        sa.Column("department", sa.String(200), nullable=True),

        # OCR (Milestone 3)
        sa.Column("is_ocr_processed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("language", sa.String(10), nullable=False, server_default="en"),

        # Timestamps
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )

    # ── Indexes ──────────────────────────────────────────────────────────
    op.create_index("ix_documents_id",         "documents", ["id"])
    op.create_index("ix_documents_owner_id",   "documents", ["owner_id"])
    op.create_index("ix_documents_status",     "documents", ["status"])
    op.create_index("ix_documents_created_at", "documents", ["created_at"])
    op.create_index("ix_documents_owner_status", "documents", ["owner_id", "status"])


def downgrade() -> None:
    op.drop_index("ix_documents_owner_status", table_name="documents")
    op.drop_index("ix_documents_created_at",   table_name="documents")
    op.drop_index("ix_documents_status",       table_name="documents")
    op.drop_index("ix_documents_owner_id",     table_name="documents")
    op.drop_index("ix_documents_id",           table_name="documents")
    op.drop_table("documents")

    op.execute("DROP TYPE IF EXISTS documentstatus")
    op.execute("DROP TYPE IF EXISTS documenttype")
