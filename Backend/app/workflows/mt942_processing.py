"""Workflow coordinating MT942 interim statement operations."""

from __future__ import annotations

from typing import Literal

from fastapi import Depends

from app.api.schemas.mt942 import MT942SearchRequest
from app.core.mt942 import MT942SearchResult
from app.services.mt942_service import MT942Service, get_mt942_service


class MT942Workflow:
    def __init__(self, service: MT942Service) -> None:
        self._service = service

    def search_reference(self, payload: MT942SearchRequest) -> MT942SearchResult:
        return self.search_reference_from_content(
            statement=payload.statement,
            reference=payload.reference,
            case_insensitive=payload.case_insensitive,
            limit=payload.limit,
            search_in=payload.search_in,
        )

    def search_reference_from_content(
        self,
        *,
        statement: str,
        reference: str,
        case_insensitive: bool = True,
        limit: int | None = None,
        search_in: Literal["all", "bank_reference"] = "all",
    ) -> MT942SearchResult:
        return self._service.search_transaction_reference(
            statement=statement,
            reference=reference,
            case_insensitive=case_insensitive,
            limit=limit,
            search_in=search_in,
        )


def get_mt942_workflow(
    service: MT942Service = Depends(get_mt942_service),
) -> MT942Workflow:
    return MT942Workflow(service)
