"""Application configuration using Pydantic settings."""

from functools import lru_cache

from pydantic import Field
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
        ]
    )


@lru_cache
def get_settings() -> "Settings":
    return Settings()


settings = get_settings()
