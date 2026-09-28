import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "TribalScholar AI"
    API_V1_STR: str = "/api/v1"

    # Database configuration
    DATABASE_URL: str = "postgresql+asyncpg://tribalscholar:tribalscholar@localhost:5432/tribalscholar_db"
    DATABASE_URL_SYNC: Optional[str] = None

    # Security
    SECRET_KEY: str = "tribalscholar-insecure-secret-key-for-dev-only"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Storage
    FILE_STORAGE_PATH: str = "./uploads"

    # Document AI
    DOCUMENT_AI_LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_sync_database_url(self) -> str:
        """Return synchronous database connection string for Alembic or sync engines."""
        if self.DATABASE_URL_SYNC:
            return self.DATABASE_URL_SYNC
        url = self.DATABASE_URL
        if "+asyncpg" in url:
            return url.replace("+asyncpg", "")
        if "+aiosqlite" in url:
            return url.replace("+aiosqlite", "")
        return url


settings = Settings()
