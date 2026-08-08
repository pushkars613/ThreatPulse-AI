from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ThreatPulse AI"
    api_version: str = "0.1.0"
    environment: str = "development"
    openrouter_api_key: Optional[str] = None
    openrouter_model: str = "openrouter/auto"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    kimi_api_key: Optional[str] = None
    kimi_model: str = "kimi-k2.5"
    kimi_base_url: str = "https://api.moonshot.ai/v1"
    database_path: Path = Path("data/threatpulse.db")
    upload_dir: Path = Path("uploads")
    max_upload_mb: int = Field(default=100, ge=1, le=1024)
    max_ai_events: int = Field(default=800, ge=50, le=5000)
    max_ai_chars: int = Field(default=120000, ge=10000, le=1000000)
    allowed_origins: str = Field(
        default=(
            "http://localhost:5173,http://127.0.0.1:5173,"
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:8080,http://127.0.0.1:8080"
        ),
        validation_alias=AliasChoices("ALLOWED_ORIGINS", "CORS_ORIGINS"),
    )
    auth_email: str = "analyst@threatpulse.local"
    auth_password: str = "threatpulse"
    auth_secret: str = "local-only-change-this-secret"
    auth_token_hours: int = Field(default=12, ge=1, le=168)

    @model_validator(mode="after")
    def reject_local_credentials_in_production(self) -> "Settings":
        if self.environment.lower() == "production":
            unsafe = (
                self.auth_email == "analyst@threatpulse.local"
                or self.auth_password == "threatpulse"
                or self.auth_secret == "local-only-change-this-secret"
            )
            if unsafe:
                raise ValueError(
                    "Production requires custom AUTH_EMAIL, AUTH_PASSWORD, and AUTH_SECRET values"
                )
        return self

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [value.strip() for value in self.allowed_origins.split(",") if value.strip()]

    @property
    def project_root(self) -> Path:
        return Path(__file__).resolve().parents[2]

    @property
    def resolved_database_path(self) -> Path:
        return self.database_path if self.database_path.is_absolute() else self.project_root / self.database_path

    @property
    def resolved_upload_dir(self) -> Path:
        return self.upload_dir if self.upload_dir.is_absolute() else self.project_root / self.upload_dir

    @property
    def ai_api_key(self) -> Optional[str]:
        return self.openrouter_api_key or self.kimi_api_key

    @property
    def ai_model(self) -> str:
        return self.openrouter_model if self.openrouter_api_key else self.kimi_model

    @property
    def ai_base_url(self) -> str:
        return self.openrouter_base_url if self.openrouter_api_key else self.kimi_base_url

    def ensure_directories(self) -> None:
        self.resolved_database_path.parent.mkdir(parents=True, exist_ok=True)
        self.resolved_upload_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_directories()
    return settings
