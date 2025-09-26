"""Aggregate all API routers here."""

from fastapi import APIRouter

from app.api.routers import iso20022, mt942, statements, system

api_router = APIRouter()
api_router.include_router(system.router, tags=["system"])
api_router.include_router(
    statements.router,
    prefix="/statements",
    tags=["statements"],
)
api_router.include_router(
    mt942.router,
    prefix="/statements",
    tags=["mt942"],
)
api_router.include_router(
    iso20022.router,
    prefix="/statements",
    tags=["iso20022"],
)

__all__ = ["api_router"]
