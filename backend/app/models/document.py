"""
NEXO — Document Model
"""
import enum
from typing import Optional

from sqlalchemy import BigInteger, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class DocumentStatus(str, enum.Enum):
    """Document processing pipeline status."""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    EXTRACTING = "extracting"
    EMBEDDING = "embedding"
    READY = "ready"
    FAILED = "failed"


class DocumentType(str, enum.Enum):
    """Supported document types."""
    PDF = "pdf"
    DOCX = "docx"
    TXT = "txt"
    IMAGE = "image"
    MANUAL = "manual"
    SOP = "sop"
    MAINTENANCE_LOG = "maintenance_log"
    OTHER = "other"


class Document(Base):
    """Uploaded industrial document."""
    __tablename__ = "documents"

    # Metadata
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    original_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(500), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(200), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, values_callable=lambda obj: [e.value for e in obj]),
        default=DocumentType.OTHER,
        nullable=False,
    )

    # Processing
    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=DocumentStatus.UPLOADED,
        nullable=False,
        index=True,
    )
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    chunk_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    processing_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Embeddings
    embedding_model: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    embedding_dimension: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vector_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    indexed_at: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    index_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Qdrant reference
    qdrant_collection: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # Ownership
    owner_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Tags / categories
    tags: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array as string
    category: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    # OCR
    is_ocr_processed: Mapped[bool] = mapped_column(default=False, nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    def __repr__(self) -> str:
        return f"<Document(id={self.id}, title={self.title}, status={self.status})>"
