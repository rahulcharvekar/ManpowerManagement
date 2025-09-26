"""Service logic for MT942 interim statements."""

from __future__ import annotations

from typing import Literal

from app.core.mt942 import (
    MT942Parser,
    MT942SearchResult,
    MT942Transaction,
    search_transactions,
    search_transactions_by_bank_reference,
)


class MT942Service:
    def __init__(self, parser: MT942Parser | None = None) -> None:
        self._parser = parser or MT942Parser()

    def search_transaction_reference(
        self,
        *,
        statement: str,
        reference: str,
        case_insensitive: bool = True,
        limit: int | None = None,
        search_in: Literal["all", "bank_reference"] = "all",
    ) -> MT942SearchResult:
        if search_in == "bank_reference":
            result = search_transactions_by_bank_reference(
                statement=statement,
                reference=reference,
                case_insensitive=case_insensitive,
            )
        else:
            result = search_transactions(
                statement=statement,
                reference=reference,
                case_insensitive=case_insensitive,
            )

        if limit is None or limit <= 0 or len(result.matches) <= limit:
            return result

        return MT942SearchResult(
            matches=result.matches[:limit],
            total_transactions=result.total_transactions,
            total_matches=result.total_matches,
        )

    def parse_statement(self, statement: str) -> list[MT942Transaction]:
        return self._parser.parse(statement)


def get_mt942_service() -> MT942Service:
    return MT942Service()
