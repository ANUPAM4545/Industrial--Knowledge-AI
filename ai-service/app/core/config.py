"""
NEXO — AI Service Configuration
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class AIServiceSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "NEXO"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True

    # ─── LLM ────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 2048

    # ─── Embeddings ─────────────────────────────────────────────
    EMBEDDING_MODEL: str = "BAAI/bge-large-en-v1.5"
    EMBEDDING_DIMENSION: int = 1024
    EMBEDDING_BATCH_SIZE: int = 32
    EMBEDDING_DEVICE: str = "cpu"  # "cuda" for GPU

    # ─── Qdrant ─────────────────────────────────────────────────
    QDRANT_HOST: str = "qdrant"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "forgemind_knowledge"

    # ─── RAG ────────────────────────────────────────────────────
    RAG_CHUNK_SIZE: int = 512
    RAG_CHUNK_OVERLAP: int = 64
    RAG_TOP_K: int = 5
    RAG_SCORE_THRESHOLD: float = 0.7

    # ─── OCR ────────────────────────────────────────────────────
    OCR_ENABLED: bool = True
    TESSERACT_CMD: str = "/usr/bin/tesseract"
    OCR_LANGUAGE: str = "eng"

    # ─── Redis ──────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── Upload ─────────────────────────────────────────────────
    UPLOAD_DIR: str = "/app/uploads"

    # ─── Logging ────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"


settings = AIServiceSettings()
