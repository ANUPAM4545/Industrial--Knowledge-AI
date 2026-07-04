"""
File Validation Utilities

Centralizes all file-type and size validation for document uploads.
Never trust the client-supplied filename or Content-Type alone —
we validate both the MIME type and the file extension.
"""
import mimetypes
from typing import Final

from fastapi import UploadFile

from app.core.exceptions import ValidationException

# ─── Constants ────────────────────────────────────────────────────────────────

MAX_FILE_SIZE_BYTES: Final[int] = 50 * 1024 * 1024  # 50 MB

ALLOWED_MIME_TYPES: Final[frozenset[str]] = frozenset({
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # docx
    "application/msword",  # legacy .doc
})

ALLOWED_EXTENSIONS: Final[frozenset[str]] = frozenset({".pdf", ".docx", ".doc"})

BLOCKED_EXTENSIONS: Final[frozenset[str]] = frozenset({
    ".exe", ".zip", ".bat", ".js", ".sh", ".ps1",
    ".msi", ".cmd", ".vbs", ".jar", ".py", ".rb",
})

MIME_TO_EXTENSION: Final[dict[str, str]] = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/msword": ".doc",
}


# ─── Validators ───────────────────────────────────────────────────────────────

def validate_extension(filename: str) -> str:
    """
    Extract and validate the file extension.

    Returns the lowercase extension (e.g. '.pdf').
    Raises ValidationException for blocked or unsupported extensions.
    """
    dot_index = filename.rfind(".")
    if dot_index == -1:
        raise ValidationException("File must have an extension.")

    ext = filename[dot_index:].lower()

    if ext in BLOCKED_EXTENSIONS:
        raise ValidationException(
            f"File type '{ext}' is not allowed for security reasons."
        )

    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationException(
            f"Unsupported file type '{ext}'. "
            f"Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    return ext


def validate_mime_type(content_type: str | None, filename: str) -> str:
    """
    Validate the MIME type against the allowlist.

    Falls back to guessing from filename when Content-Type is missing.
    Returns the validated MIME type string.
    """
    # Normalise: strip charset suffix e.g. "application/pdf; charset=utf-8"
    mime = (content_type or "").split(";")[0].strip().lower()

    if not mime:
        guessed, _ = mimetypes.guess_type(filename)
        mime = guessed or ""

    if mime not in ALLOWED_MIME_TYPES:
        raise ValidationException(
            f"MIME type '{mime}' is not permitted. "
            f"Upload PDF or DOCX files only."
        )

    return mime


def validate_file_size(size: int) -> None:
    """
    Raise ValidationException if the file exceeds the 50 MB limit.
    """
    if size > MAX_FILE_SIZE_BYTES:
        mb = size / (1024 * 1024)
        raise ValidationException(
            f"File size {mb:.1f} MB exceeds the 50 MB maximum."
        )


async def validate_upload(file: UploadFile) -> tuple[str, str, int]:
    """
    Full validation pipeline for an incoming UploadFile.

    Reads the file content once to determine actual size, then resets
    the stream for downstream storage operations.

    Returns:
        (validated_mime_type, validated_extension, file_size_bytes)

    Raises:
        ValidationException: on any validation failure.
    """
    if not file.filename:
        raise ValidationException("Uploaded file must have a filename.")

    ext = validate_extension(file.filename)
    mime = validate_mime_type(file.content_type, file.filename)

    # Read full content to calculate actual size (stream is now consumed)
    content = await file.read()
    size = len(content)
    validate_file_size(size)

    # Rewind so storage provider can read it again
    await file.seek(0)

    return mime, ext, size
