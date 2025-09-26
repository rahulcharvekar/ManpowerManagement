"""MT940 parsing utilities backed by the mt-940 package."""

from __future__ import annotations

import io
from dataclasses import dataclass
from decimal import Decimal
from typing import Iterator, Optional

import mt940


@dataclass(slots=True)
class MT940Transaction:
    statement_reference: Optional[str]
    value_date: Optional[str]
    entry_date: Optional[str]
    debit_credit_mark: Optional[str]
    amount: Decimal
    transaction_type: Optional[str]
    customer_reference: Optional[str]
    bank_reference: Optional[str]
    narrative: str
    raw_statement_line: str


@dataclass(slots=True)
class MT940SearchResult:
    matches: list[MT940Transaction]
    total_transactions: int
    total_matches: int


class MT940Parser:
    """Thin wrapper around the mt-940 library."""

    def parse(self, statement: str) -> list[MT940Transaction]:
        return list(self.iter_transactions(statement))

    def iter_transactions(self, statement: str) -> Iterator[MT940Transaction]:
        try:
            transactions = mt940.parse(statement)
        except (TypeError, AttributeError):
            transactions = mt940.parse(io.StringIO(statement))

        for transaction in transactions:
            yield self._to_transaction(transaction)

    @staticmethod
    def _to_transaction(transaction) -> MT940Transaction:
        amount = Decimal("0")
        debit_credit: Optional[str] = None

        data = getattr(transaction, "data", {}) or {}
        amount_info = data.get("amount")
        if amount_info is not None:
            raw_amount = getattr(amount_info, "amount", amount_info)
            amount = Decimal(str(raw_amount))

        status = data.get("status")
        if status:
            debit_credit = status.upper()
        elif amount != 0:
            debit_credit = "C" if amount > 0 else "D"

        if debit_credit == "D":
            amount = amount.copy_abs()
        elif debit_credit == "C":
            amount = amount.copy_abs()

        statement_reference = _first_value(
            data,
            "statement_reference",
            "transaction_reference",
        )
        transaction_type = (
            data.get("transaction_type")
            or data.get("transaction_type_identification_code")
            or data.get("id")
            or data.get("transaction_code")
        )
        customer_reference = _first_value(
            data,
            "customer_reference",
            "customer_reference_number",
        )
        bank_reference = _first_value(
            data,
            "bank_reference",
            "bank_reference_number",
        )
        narrative = " ".join(
            part
            for part in (
                data.get("narrative"),
                data.get("transaction_details"),
                data.get("supplementary_details"),
                data.get("information_to_account_owner"),
            )
            if part
        )
        if not narrative:
            narrative = getattr(transaction, "text", None) or getattr(
                transaction, "description", ""
            )

        raw = getattr(transaction, "raw", None)
        if isinstance(raw, (list, tuple)):
            raw_statement_line = " ".join(str(line) for line in raw if line)
        elif raw:
            raw_statement_line = str(raw)
        else:
            raw_statement_line = narrative

        value_date = None
        tx_date = data.get("date") or getattr(transaction, "date", None)
        if tx_date is not None:
            value_date = tx_date.isoformat() if hasattr(tx_date, "isoformat") else str(tx_date)

        entry_date = None
        tx_entry_date = (
            data.get("entry_date")
            or data.get("guessed_entry_date")
            or getattr(transaction, "entry_date", None)
        )
        if tx_entry_date is not None:
            entry_date = (
                tx_entry_date.isoformat()
                if hasattr(tx_entry_date, "isoformat")
                else str(tx_entry_date)
            )

        return MT940Transaction(
            statement_reference=statement_reference,
            value_date=value_date,
            entry_date=entry_date,
            debit_credit_mark=debit_credit,
            amount=amount,
            transaction_type=transaction_type,
            customer_reference=customer_reference,
            bank_reference=bank_reference,
            narrative=narrative or "",
            raw_statement_line=raw_statement_line or "",
        )


def search_transactions(
    *,
    statement: str,
    reference: str,
    case_insensitive: bool = True,
) -> MT940SearchResult:
    parser = MT940Parser()
    matches: list[MT940Transaction] = []
    total = 0
    query = reference.lower() if case_insensitive else reference

    for tx in parser.iter_transactions(statement):
        total += 1
        haystack = [
            tx.bank_reference,
            tx.customer_reference,
            tx.statement_reference,
            tx.narrative,
            tx.raw_statement_line,
        ]
        for field in haystack:
            if not field:
                continue
            target = field.lower() if case_insensitive else field
            if query in target:
                matches.append(tx)
                break

    return MT940SearchResult(
        matches=matches,
        total_transactions=total,
        total_matches=len(matches),
    )


def search_transactions_by_bank_reference(
    *,
    statement: str,
    reference: str,
    case_insensitive: bool = True,
) -> MT940SearchResult:
    parser = MT940Parser()
    matches: list[MT940Transaction] = []
    total = 0
    query = reference.lower() if case_insensitive else reference

    for tx in parser.iter_transactions(statement):
        total += 1
        bank_reference = tx.bank_reference
        if not bank_reference:
            continue
        target = bank_reference.lower() if case_insensitive else bank_reference
        if target == query:
            matches.append(tx)

    return MT940SearchResult(
        matches=matches,
        total_transactions=total,
        total_matches=len(matches),
    )


def _first_value(data: dict, *keys: str) -> Optional[str]:
    for key in keys:
        value = data.get(key)
        if value:
            return value
    return None
