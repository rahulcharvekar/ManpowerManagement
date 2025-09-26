"""Workflow coordinating ISO 20022 CAMT statement operations."""

from __future__ import annotations

from typing import Literal

from fastapi import Depends

from app.api.schemas.iso20022 import ISO20022SearchRequest
from app.core.iso20022 import ISO20022SearchResult
from app.services.iso20022_service import (
    ISO20022Service,
    get_camt52_service,
    get_camt53_service,
)


class ISO20022Workflow:
    def __init__(self, service: ISO20022Service) -> None:
        self._service = service

    def search_reference(self, payload: ISO20022SearchRequest) -> ISO20022SearchResult:
        return self.search_reference_from_content(
            payload=payload.statement,
            reference=payload.reference,
            case_insensitive=payload.case_insensitive,
            limit=payload.limit,
            search_in=payload.search_in,
        )

    def search_reference_from_content(
        self,
        *,
        payload: str,
        reference: str,
        case_insensitive: bool = True,
        limit: int | None = None,
        search_in: Literal["all", "bank_reference"] = "all",
    ) -> ISO20022SearchResult:
        return self._service.search_transaction_reference(
            payload=payload,
            reference=reference,
            case_insensitive=case_insensitive,
            limit=limit,
            search_in=search_in,
        )


def get_camt52_workflow(
    service: ISO20022Service = Depends(get_camt52_service),
) -> ISO20022Workflow:
    return ISO20022Workflow(service)


def get_camt53_workflow(
    service: ISO20022Service = Depends(get_camt53_service),
) -> ISO20022Workflow:
    return ISO20022Workflow(service)
