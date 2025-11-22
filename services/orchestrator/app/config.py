"""Application settings management for the orchestrator service."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field, HttpUrl, PositiveInt
from pydantic_settings import BaseSettings


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env", override=False)


class ServiceURLs(BaseModel):
    """Collection of downstream service endpoints."""

    ocr: HttpUrl = Field(alias="OCR_SERVICE_URL")
    facematch: HttpUrl = Field(alias="FACEMATCH_SERVICE_URL")
    risk: HttpUrl = Field(alias="RISK_SERVICE_URL")
    storage: HttpUrl = Field(alias="STORAGE_SERVICE_URL")
    audit: HttpUrl = Field(alias="AUDIT_SERVICE_URL")

    class Config:
        populate_by_name = True


class Settings(BaseSettings):
    """Runtime configuration loaded from environment variables."""

    database_url: str = Field(alias="DATABASE_URL")
    redis_url: str = Field(alias="REDIS_URL")
    secret_key: str = Field(alias="SECRET_KEY")
    access_token_expire_minutes: PositiveInt = Field(
        default=1440, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    algorithm: str = "HS256"
    orchestrator_host: str = Field("0.0.0.0", alias="ORCHESTRATOR_HOST")
    orchestrator_port: PositiveInt = Field(8000, alias="ORCHESTRATOR_PORT")
    risk_approve_threshold: int = Field(50, alias="RISK_APPROVE_THRESHOLD")
    process_timeout: int = Field(60, alias="PROCESS_TIMEOUT")
    use_stubs: bool = Field(False, alias="USE_STUBS")
    service_urls: ServiceURLs
    allowed_origins: list[str] = Field(default_factory=lambda: ["*"])
    demo_mode: bool = Field(False, alias="DEMO_MODE")

    class Config:
        env_file = ROOT_DIR / ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @property
    def celery_broker_url(self) -> str:
        """Return broker URL for Celery."""

        return self.redis_url

    @property
    def celery_backend_url(self) -> str:
        """Return result backend URL for Celery."""

        return self.redis_url


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance."""

    return Settings()


settings = get_settings()

