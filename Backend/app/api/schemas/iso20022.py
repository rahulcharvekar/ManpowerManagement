"""Schemas for ISO 20022 CAMT search endpoints."""

from __future__ import annotations

from decimal import Decimal
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class ISO20022SearchRequest(BaseModel):
    statement: str = Field(..., description="ISO 20022 CAMT XML payload.")
    reference: str = Field(..., description="Transaction reference to search for.")
    case_insensitive: bool = Field(True, description="Enable case-insensitive matching.")
    limit: Optional[int] = Field(None, ge=1, description="Maximum number of matches to return.")
    search_in: Literal["all", "bank_reference"] = Field(
        "all",
        description="Where to search for the reference (all fields vs bank reference only).",
    )


class ISO20022TransactionModel(BaseModel):
    statement_reference: Optional[str]
    value_date: Optional[str]
    entry_date: Optional[str]
    debit_credit_mark: Optional[str]
    amount: Decimal
    currency: Optional[str]
    transaction_type: Optional[str]
    customer_reference: Optional[str]
    bank_reference: Optional[str]
    narrative: str
    raw_statement_line: str


class ISO20022SearchResponse(BaseModel):
    matches: List[ISO20022TransactionModel]
    matched_count: int
    total_matches: int
    total_transactions: int
    has_more: bool
