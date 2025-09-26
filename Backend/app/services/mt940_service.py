"""Service logic for MT940 statement handling."""

from __future__ import annotations

from typing import Literal

from app.core.mt940 import (
    MT940Parser,
    MT940SearchResult,
    MT940Transaction,
    search_transactions,
    search_transactions_by_bank_reference,
)


class MT940Service:
    def __init__(self, parser: MT940Parser | None = None) -> None:
        self._parser = parser or MT940Parser()

    def search_transaction_reference(
        self,
        *,
        statement: str,
        reference: str,
        case_insensitive: bool = True,
        limit: int | None = None,
        search_in: Literal["all", "bank_reference"] = "all",
    ) -> MT940SearchResult:
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

        return MT940SearchResult(
            matches=result.matches[:limit],
            total_transactions=result.total_transactions,
            total_matches=result.total_matches,
        )

    def parse_statement(self, statement: str) -> list[MT940Transaction]:
        return self._parser.parse(statement)


def get_mt940_service() -> MT940Service:
    return MT940Service()
