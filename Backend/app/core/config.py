"""Application configuration using Pydantic settings."""

from functools import lru_cache
import json

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    project_name: str = Field(default="Manpower Management API")
    version: str = Field(default="0.1.0")
    debug: bool = Field(default=True)
    backend_cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
            "https://rahulcharvekar.github.io",
        ],
        description="Allowed origins for CORS requests.",
    )

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: list[str] | str) -> list[str]:
        """Allow env string formats such as comma-separated or JSON arrays."""
        if isinstance(value, list):  # already parsed
            return value
        if isinstance(value, str):
            cleaned = value.strip()
            if not cleaned:
                return []
            if cleaned.startswith("["):
                try:
                    parsed = json.loads(cleaned)
                except json.JSONDecodeError as exc:  # pragma: no cover - invalid env
                    raise ValueError("Invalid JSON for BACKEND_CORS_ORIGINS") from exc
                if not isinstance(parsed, list):
                    raise ValueError("BACKEND_CORS_ORIGINS JSON must be a list")
                return [str(item).strip() for item in parsed if str(item).strip()]
            return [origin.strip() for origin in cleaned.split(",") if origin.strip()]
        raise TypeError("BACKEND_CORS_ORIGINS must be a list or string")


@lru_cache
def get_settings() -> "Settings":
    return Settings()


settings = get_settings()
