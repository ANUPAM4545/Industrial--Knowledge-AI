"""
NEXO — Application Configuration
Pydantic v2 settings with environment variable loading.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ─── Application ─────────────────────────────────────────────
    APP_NAME: str = "NEXO"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_VERSION: str = "1.0.0"
    APP_SECRET_KEY: str = "change-me-in-production"
    ALLOW_ROLE_SELECTION: bool = True

    # ─── Backend ─────────────────────────────────────────────────
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # ─── Database ────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://forgemind:password@localhost:5432/forgemind_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "forgemind_db"
    POSTGRES_USER: str = "forgemind"
    POSTGRES_PASSWORD: str = "forgemind_secure_password"

    # ─── JWT ─────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "change-me-jwt-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── Redis ───────────────────────────────────────────────────
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── AI Service ──────────────────────────────────────────────
    AI_SERVICE_URL: str = "http://ai-service:8001"
    
    # ─── LLM Configuration ───────────────────────────────────────
    LLM_PROVIDER: str = "gemini"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    
    # ─── Retrieval Settings ──────────────────────────────────────
    MIN_CONFIDENCE_SCORE: float = 0.65
    HIGH_CONFIDENCE_SCORE: float = 0.80
    
    # ─── Embeddings & Vector Store ───────────────────────────────
    EMBEDDING_PROVIDER: str = "fastembed"
    VECTOR_STORE: str = "qdrant"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    QDRANT_URL: str = "http://qdrant:6333"
    QDRANT_COLLECTION: str = "documents"
    QDRANT_API_KEY: str = ""

    # ─── File Upload ─────────────────────────────────────────────
    UPLOAD_DIR: str = "/app/uploads"
    MAX_UPLOAD_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "docx", "txt", "png", "jpg", "jpeg", "tiff"]

    @field_validator("ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_extensions(cls, v):
        if isinstance(v, str):
            return [ext.strip() for ext in v.split(",")]
        return v

    # ─── Logging ─────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # ─── Celery ──────────────────────────────────────────────────
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    @property
    def is_development(self) -> bool:
        return self.APP_ENV == "development"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
