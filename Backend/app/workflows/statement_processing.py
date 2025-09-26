"""Workflow that coordinates MT940 statement operations."""

from __future__ import annotations

from typing import Literal

from fastapi import Depends

from app.api.schemas.mt940 import MT940SearchRequest
from app.core.mt940 import MT940SearchResult
from app.services.mt940_service import MT940Service, get_mt940_service


class StatementProcessingWorkflow:
    def __init__(self, service: MT940Service) -> None:
        self._service = service

    def search_reference(self, payload: MT940SearchRequest) -> MT940SearchResult:
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
    ) -> MT940SearchResult:
        return self._service.search_transaction_reference(
            statement=statement,
            reference=reference,
            case_insensitive=case_insensitive,
            limit=limit,
            search_in=search_in,
        )


def get_statement_processing_workflow(
    service: MT940Service = Depends(get_mt940_service),
) -> StatementProcessingWorkflow:
    return StatementProcessingWorkflow(service)
