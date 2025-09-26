"""Services for ISO 20022 CAMT statement handling."""

from __future__ import annotations

from typing import Literal

from app.core.iso20022 import (
    ISO20022Parser,
    ISO20022SearchResult,
    ISO20022Transaction,
    search_transactions,
    search_transactions_by_bank_reference,
)


MessageType = Literal["camt.052", "camt.053"]


class ISO20022Service:
    def __init__(self, message_type: MessageType) -> None:
        self._message_type = message_type

    def search_transaction_reference(
        self,
        *,
        payload: str,
        reference: str,
        case_insensitive: bool = True,
        limit: int | None = None,
        search_in: Literal["all", "bank_reference"] = "all",
    ) -> ISO20022SearchResult:
        if search_in == "bank_reference":
            result = search_transactions_by_bank_reference(
                message_type=self._message_type,
                payload=payload,
                reference=reference,
                case_insensitive=case_insensitive,
            )
        else:
            result = search_transactions(
                message_type=self._message_type,
                payload=payload,
                reference=reference,
                case_insensitive=case_insensitive,
            )

        if limit is None or limit <= 0 or len(result.matches) <= limit:
            return result

        return ISO20022SearchResult(
            matches=result.matches[:limit],
            total_transactions=result.total_transactions,
            total_matches=result.total_matches,
        )

    def parse_statement(self, payload: str) -> list[ISO20022Transaction]:
        parser = ISO20022Parser(self._message_type)
        return parser.parse(payload)


def get_iso20022_service(message_type: MessageType) -> ISO20022Service:
    return ISO20022Service(message_type)


def get_camt52_service() -> ISO20022Service:
    return ISO20022Service("camt.052")


def get_camt53_service() -> ISO20022Service:
    return ISO20022Service("camt.053")
