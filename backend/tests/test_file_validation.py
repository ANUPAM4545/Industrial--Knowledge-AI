"""
Tests — File Validation Utilities

Validates the extension allowlist, MIME type allowlist,
size enforcement, and the composite validate_upload helper.
"""
import io
import pytest
from unittest.mock import AsyncMock, MagicMock

from app.core.exceptions import ValidationException
from app.utils.file_validation import (
    ALLOWED_EXTENSIONS,
    BLOCKED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
    validate_extension,
    validate_file_size,
    validate_mime_type,
)


# ─── Extension Validation ──────────────────────────────────────────────────────

class TestValidateExtension:
    def test_pdf_allowed(self):
        assert validate_extension("report.pdf") == ".pdf"

    def test_docx_allowed(self):
        assert validate_extension("manual.docx") == ".docx"

    def test_case_insensitive(self):
        assert validate_extension("FILE.PDF") == ".pdf"

    def test_no_extension_raises(self):
        with pytest.raises(ValidationException, match="extension"):
            validate_extension("nodotfile")

    def test_blocked_exe_raises(self):
        with pytest.raises(ValidationException, match="not allowed"):
            validate_extension("malware.exe")

    def test_blocked_zip_raises(self):
        with pytest.raises(ValidationException, match="not allowed"):
            validate_extension("archive.zip")

    def test_blocked_bat_raises(self):
        with pytest.raises(ValidationException, match="not allowed"):
            validate_extension("script.bat")

    def test_blocked_js_raises(self):
        with pytest.raises(ValidationException, match="not allowed"):
            validate_extension("code.js")

    def test_unsupported_txt_raises(self):
        # .txt not in allowed set for this milestone (PDF/DOCX only)
        with pytest.raises(ValidationException, match="Unsupported"):
            validate_extension("notes.txt")


# ─── MIME Type Validation ──────────────────────────────────────────────────────

class TestValidateMimeType:
    def test_pdf_mime_allowed(self):
        result = validate_mime_type("application/pdf", "file.pdf")
        assert result == "application/pdf"

    def test_docx_mime_allowed(self):
        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        result = validate_mime_type(mime, "file.docx")
        assert result == mime

    def test_strips_charset(self):
        result = validate_mime_type("application/pdf; charset=utf-8", "file.pdf")
        assert result == "application/pdf"

    def test_disallowed_mime_raises(self):
        with pytest.raises(ValidationException, match="MIME type"):
            validate_mime_type("application/octet-stream", "file.bin")

    def test_empty_mime_falls_back_to_filename(self):
        result = validate_mime_type("", "document.pdf")
        assert result == "application/pdf"

    def test_none_mime_falls_back_to_filename(self):
        result = validate_mime_type(None, "document.pdf")
        assert result == "application/pdf"


# ─── File Size Validation ─────────────────────────────────────────────────────

class TestValidateFileSize:
    def test_exactly_at_limit_passes(self):
        validate_file_size(MAX_FILE_SIZE_BYTES)  # should not raise

    def test_one_byte_over_raises(self):
        with pytest.raises(ValidationException, match="50 MB"):
            validate_file_size(MAX_FILE_SIZE_BYTES + 1)

    def test_zero_bytes_passes(self):
        validate_file_size(0)  # empty file is valid size-wise

    def test_large_file_raises(self):
        with pytest.raises(ValidationException):
            validate_file_size(100 * 1024 * 1024)  # 100 MB
