"""
Document Security Gateway & Classification
"""
import filetype
from enum import Enum
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException

class DocumentPolicyType(Enum):
    STANDARD = "standard"
    INDUSTRIAL = "industrial"
    HEALTHCARE = "healthcare"
    FINANCIAL = "financial"

class DocumentSecurityPolicy:
    def __init__(
        self, 
        policy_type: DocumentPolicyType, 
        max_size_bytes: int, 
        allowed_mime_types: List[str], 
        blocked_keywords: List[str]
    ):
        self.policy_type = policy_type
        self.max_size_bytes = max_size_bytes
        self.allowed_mime_types = allowed_mime_types
        self.blocked_keywords = blocked_keywords


# Default policies
POLICIES = {
    DocumentPolicyType.STANDARD: DocumentSecurityPolicy(
        policy_type=DocumentPolicyType.STANDARD,
        max_size_bytes=50 * 1024 * 1024, # 50 MB
        allowed_mime_types=["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
        blocked_keywords=[]
    ),
    DocumentPolicyType.HEALTHCARE: DocumentSecurityPolicy(
        policy_type=DocumentPolicyType.HEALTHCARE,
        max_size_bytes=100 * 1024 * 1024, # 100 MB
        allowed_mime_types=["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/csv"],
        blocked_keywords=["password", "ssn", "social security"]
    ),
    DocumentPolicyType.INDUSTRIAL: DocumentSecurityPolicy(
        policy_type=DocumentPolicyType.INDUSTRIAL,
        max_size_bytes=200 * 1024 * 1024, # 200 MB for large CAD / specs
        allowed_mime_types=["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "image/png", "image/jpeg"],
        blocked_keywords=[]
    ),
}

class DocumentClassifier:
    """
    Classifies documents based on content or metadata to apply the correct policy.
    In a real-world scenario, this might use NLP or metadata analysis.
    """
    def classify(self, filename: str, content: bytes) -> DocumentPolicyType:
        # Dummy classification logic based on filename for now
        lower_name = filename.lower()
        if "patient" in lower_name or "medical" in lower_name:
            return DocumentPolicyType.HEALTHCARE
        elif "financial" in lower_name or "tax" in lower_name:
            return DocumentPolicyType.FINANCIAL
        elif "manual" in lower_name or "specs" in lower_name or "industrial" in lower_name or "diagram" in lower_name:
            return DocumentPolicyType.INDUSTRIAL
        return DocumentPolicyType.STANDARD


class DocumentSecurityGateway:
    def __init__(self, default_policy: DocumentPolicyType = DocumentPolicyType.STANDARD):
        self.default_policy = default_policy
        self.classifier = DocumentClassifier()

    async def validate_upload(self, file: UploadFile) -> DocumentSecurityPolicy:
        """
        Validates an uploaded file against security policies (size, magic bytes, extension).
        Returns the applied policy. Raises HTTPException if validation fails.
        """
        # 1. Read first chunk for magic bytes analysis
        chunk_size = 2048
        header = await file.read(chunk_size)
        await file.seek(0)
        
        # 2. Determine file type from magic bytes
        kind = filetype.guess(header)
        actual_mime = kind.mime if kind else "text/plain" # fallback
        
        # 3. Classify document to determine policy
        policy_type = self.classifier.classify(file.filename, header)
        policy = POLICIES.get(policy_type, POLICIES[DocumentPolicyType.STANDARD])
        
        # 4. Validate Mime Type
        if actual_mime not in policy.allowed_mime_types:
            if actual_mime == "application/zip" and file.filename.endswith(".docx"):
                pass
            else:
                raise HTTPException(
                    status_code=415, 
                    detail=f"File type {actual_mime} not allowed under {policy.policy_type.value} policy. Allowed: {policy.allowed_mime_types}"
                )
        
        # 5. Validate File Size
        file.file.seek(0, 2)
        file_size = file.file.tell()
        await file.seek(0)
        
        if file_size > policy.max_size_bytes:
            raise HTTPException(
                status_code=413,
                detail=f"File size {file_size} exceeds maximum {policy.max_size_bytes} for {policy.policy_type.value} policy."
            )
            
        return policy
