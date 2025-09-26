"""System-level endpoints such as health checks."""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/", summary="Root landing endpoint", tags=["system"])
def read_root() -> dict[str, str]:
    return {
        "status": "ok",
        "service": settings.project_name,
        "version": settings.version,
    }


@router.get("/health", summary="Health check", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "healthy"}


__all__ = ["router"]
