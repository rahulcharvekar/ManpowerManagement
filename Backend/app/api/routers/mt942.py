"""Endpoints for MT942 interim statement processing."""

from typing import Literal, cast

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.schemas import (
    MT942SearchRequest,
    MT942SearchResponse,
    MT942TransactionModel,
)
from app.core.mt942 import MT942SearchResult
from app.workflows.mt942_processing import MT942Workflow, get_mt942_workflow

router = APIRouter()

_ALLOWED_SEARCH_FIELDS = {"all", "bank_reference"}


def _build_response(result: MT942SearchResult) -> MT942SearchResponse:
    matches = [
        MT942TransactionModel(
            statement_reference=tx.statement_reference,
            value_date=tx.value_date,
            entry_date=tx.entry_date,
            debit_credit_mark=tx.debit_credit_mark,
            amount=tx.amount,
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
    return MT942SearchResponse(
        matches=matches,
        matched_count=matched_count,
        total_matches=total_matches,
        total_transactions=result.total_transactions,
        has_more=total_matches > matched_count,
    )


@router.post(
    "/mt942/search",
    response_model=MT942SearchResponse,
    summary="Search transaction references within an MT942 statement",
)
def search_mt942_transaction_reference(
    payload: MT942SearchRequest,
    workflow: MT942Workflow = Depends(get_mt942_workflow),
) -> MT942SearchResponse:
    result = workflow.search_reference(payload)
    return _build_response(result)


@router.post(
    "/mt942/search/upload",
    response_model=MT942SearchResponse,
    summary="Search transaction references within an uploaded MT942 statement",
)
async def search_mt942_transaction_reference_from_upload(
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
        ..., description="MT942 statement file to search within."
    ),
    workflow: MT942Workflow = Depends(get_mt942_workflow),
) -> MT942SearchResponse:
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
        statement=statement_text,
        reference=reference,
        case_insensitive=case_insensitive,
        limit=limit,
        search_in=literal_scope,
    )
    return _build_response(result)
