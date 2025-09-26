"""Endpoints for ISO 20022 CAMT statement processing."""

from typing import Literal, cast

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.schemas import (
    ISO20022SearchRequest,
    ISO20022SearchResponse,
    ISO20022TransactionModel,
)
from app.core.iso20022 import ISO20022SearchResult
from app.workflows.iso20022_processing import (
    ISO20022Workflow,
    get_camt52_workflow,
    get_camt53_workflow,
)

router = APIRouter()

_ALLOWED_SEARCH_FIELDS = {"all", "bank_reference"}


def _build_response(result: ISO20022SearchResult) -> ISO20022SearchResponse:
    matches = [
        ISO20022TransactionModel(
            statement_reference=tx.statement_reference,
            value_date=tx.value_date,
            entry_date=tx.entry_date,
            debit_credit_mark=tx.debit_credit_mark,
            amount=tx.amount,
            currency=tx.currency,
            transaction_type=tx.transaction_type,
            customer_reference=tx.customer_reference,
            bank_reference=tx.bank_reference,
            narrative=tx.narrative,
            raw_statement_line=tx.raw_statement_line,
        )
        for tx in result.matches
    ]
    matched_count = len(matches)
    total_matches = result.total_matches
    return ISO20022SearchResponse(
        matches=matches,
        matched_count=matched_count,
        total_matches=total_matches,
        total_transactions=result.total_transactions,
        has_more=total_matches > matched_count,
    )


@router.post(
    "/iso20022/camt52/search",
    response_model=ISO20022SearchResponse,
    summary="Search transaction references within a CAMT.052 report",
)
def search_camt52_transaction_reference(
    payload: ISO20022SearchRequest,
    workflow: ISO20022Workflow = Depends(get_camt52_workflow),
) -> ISO20022SearchResponse:
    result = workflow.search_reference(payload)
    return _build_response(result)


@router.post(
    "/iso20022/camt52/search/upload",
    response_model=ISO20022SearchResponse,
    summary="Search transaction references within an uploaded CAMT.052 report",
)
async def search_camt52_transaction_reference_from_upload(
    reference: str = Form(..., description="Transaction reference to search for."),
    limit: int | None = Form(
        None,
        ge=1,
        description="Maximum number of matches to return.",
    ),
    case_insensitive: bool = Form(
        True,
        description="Enable case-insensitive matching.",
    ),
    search_in: str = Form(
        "all",
        description="Where to search for the reference (all fields vs bank reference only).",
    ),
    statement_file: UploadFile = File(
        ..., description="CAMT.052 XML file to search within."
    ),
    workflow: ISO20022Workflow = Depends(get_camt52_workflow),
) -> ISO20022SearchResponse:
    normalized_scope = search_in.lower()
    if normalized_scope not in _ALLOWED_SEARCH_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid search_in value '{search_in}'. Allowed: {_ALLOWED_SEARCH_FIELDS}",
        )

    contents = await statement_file.read()
    statement_text = contents.decode("utf-8", errors="ignore")
    literal_scope = cast(Literal["all", "bank_reference"], normalized_scope)
    result = workflow.search_reference_from_content(
        payload=statement_text,
        reference=reference,
        case_insensitive=case_insensitive,
        limit=limit,
        search_in=literal_scope,
    )
    return _build_response(result)


@router.post(
    "/iso20022/camt53/search",
    response_model=ISO20022SearchResponse,
    summary="Search transaction references within a CAMT.053 statement",
)
def search_camt53_transaction_reference(
    payload: ISO20022SearchRequest,
    workflow: ISO20022Workflow = Depends(get_camt53_workflow),
) -> ISO20022SearchResponse:
    result = workflow.search_reference(payload)
    return _build_response(result)


@router.post(
    "/iso20022/camt53/search/upload",
    response_model=ISO20022SearchResponse,
    summary="Search transaction references within an uploaded CAMT.053 statement",
)
async def search_camt53_transaction_reference_from_upload(
    reference: str = Form(..., description="Transaction reference to search for."),
    limit: int | None = Form(
        None,
        ge=1,
        description="Maximum number of matches to return.",
    ),
    case_insensitive: bool = Form(
        True,
        description="Enable case-insensitive matching.",
    ),
    search_in: str = Form(
        "all",
        description="Where to search for the reference (all fields vs bank reference only).",
    ),
    statement_file: UploadFile = File(
        ..., description="CAMT.053 XML file to search within."
    ),
    workflow: ISO20022Workflow = Depends(get_camt53_workflow),
) -> ISO20022SearchResponse:
    normalized_scope = search_in.lower()
    if normalized_scope not in _ALLOWED_SEARCH_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid search_in value '{search_in}'. Allowed: {_ALLOWED_SEARCH_FIELDS}",
        )

    contents = await statement_file.read()
    statement_text = contents.decode("utf-8", errors="ignore")
    literal_scope = cast(Literal["all", "bank_reference"], normalized_scope)
    result = workflow.search_reference_from_content(
        payload=statement_text,
        reference=reference,
        case_insensitive=case_insensitive,
        limit=limit,
        search_in=literal_scope,
    )
    return _build_response(result)
