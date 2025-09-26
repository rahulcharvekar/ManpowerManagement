"""MT942 parsing and search helpers."""

from __future__ import annotations

import re
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Iterator, Optional


_TAG_PATTERN = re.compile(r"^:(\d{2}[A-Z]?):(.*)$")


@dataclass(slots=True)
class MT942Transaction:
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
class MT942SearchResult:
    matches: list[MT942Transaction]
    total_transactions: int
    total_matches: int


class MT942Parser:
    """Parser for MT942 interim statements.

    The parser includes a fallback implementation that understands the
    subset of the MT942 spec needed by the existing workflow. If the optional
    `swift-parser` package is installed, it will be used automatically.
    """

    def __init__(self) -> None:
        try:
            from swift_parser.message import MTMessage  # type: ignore
        except ImportError:  # pragma: no cover - optional dependency
            self._swift_parser_cls = None
        else:  # pragma: no cover - optional dependency
            self._swift_parser_cls = MTMessage

    def parse(self, statement: str) -> list[MT942Transaction]:
        return list(self.iter_transactions(statement))

    def iter_transactions(self, statement: str) -> Iterator[MT942Transaction]:
        if self._swift_parser_cls is not None:
            try:
                yield from self._parse_with_swift_parser(statement)
                return
            except Exception:
                # If the optional dependency cannot handle the payload,
                # fallback to the built-in parser.
                pass
        yield from self._parse_fallback(statement)

    def _parse_with_swift_parser(self, statement: str) -> Iterator[MT942Transaction]:
        """Parse using the optional swift-parser package."""

        MTMessage = self._swift_parser_cls
        assert MTMessage is not None
        message = MTMessage(statement)  # type: ignore[call-arg]
        statement_reference = message.block4.get("20") if hasattr(message, "block4") else None

        for field_61 in message.field("61"):
            raw_line = field_61.value
            details = message.corresponding_field(field_61, "86") if hasattr(message, "corresponding_field") else None
            narrative = ""
            if details is not None:
                narrative = details.value.replace("\n", " ").strip()

            yield self._build_transaction_from_components(
                raw_line=raw_line,
                narrative=narrative,
                statement_reference=statement_reference,
            )

    def _parse_fallback(self, statement: str) -> Iterator[MT942Transaction]:
        statement_reference: Optional[str] = None
        pending_narrative: list[str] = []
        current_field_61: Optional[str] = None
        raw_segments: list[str] = []
        current_tag: Optional[str] = None

        for raw_line in statement.splitlines():
            line = raw_line.rstrip("\r\n")
            if not line:
                continue

            tag_match = _TAG_PATTERN.match(line)
            if tag_match:
                tag, value = tag_match.groups()
                current_tag = tag
                if tag == "20":
                    statement_reference = value.strip() or None
                elif tag == "61":
                    if current_field_61 is not None:
                        narrative = " ".join(part for part in pending_narrative if part)
                        yield self._build_transaction_from_components(
                            raw_line="\n".join(raw_segments),
                            narrative=narrative,
                            statement_reference=statement_reference,
                        )
                        pending_narrative.clear()
                        raw_segments.clear()

                    current_field_61 = value.strip()
                    raw_segments = [line]
                elif tag == "86" and current_field_61 is not None:
                    pending_narrative.append(value.strip())
                    raw_segments.append(line)
                else:
                    if current_field_61 is not None:
                        raw_segments.append(line)
                continue

            # Continuation of the previous tag (e.g. additional :86: lines)
            if current_tag == "86" and current_field_61 is not None:
                pending_narrative.append(line.strip())
                raw_segments.append(line)
            elif current_field_61 is not None:
                raw_segments.append(line)

        if current_field_61 is not None:
            narrative = " ".join(part for part in pending_narrative if part)
            yield self._build_transaction_from_components(
                raw_line="\n".join(raw_segments),
                narrative=narrative,
                statement_reference=statement_reference,
            )

    def _build_transaction_from_components(
        self,
        *,
        raw_line: str,
        narrative: str,
        statement_reference: Optional[str],
    ) -> MT942Transaction:
        value_date: Optional[str] = None
        entry_date: Optional[str] = None
        debit_credit: Optional[str] = None
        amount = Decimal("0")
        transaction_type: Optional[str] = None
        customer_reference: Optional[str] = None
        bank_reference: Optional[str] = None

        value = raw_line
        if raw_line.startswith(":61:"):
            value = raw_line.split(":61:", 1)[1]

        cursor = 0
        if len(value) >= 6 and value[:6].isdigit():
            value_date = _format_swift_date(value[:6])
            cursor += 6

        if len(value) >= cursor + 4 and value[cursor : cursor + 4].isdigit():
            entry_date = _format_swift_entry_date(value[cursor : cursor + 4], value_date)
            cursor += 4

        if len(value) > cursor:
            debit_credit = value[cursor].upper()
            cursor += 1

        # Optional funds code (single letter)
        if len(value) > cursor and value[cursor].isalpha() and value[cursor].isupper():
            cursor += 1

        amount_chars: list[str] = []
        while len(value) > cursor and (value[cursor].isdigit() or value[cursor] in ",."):
            amount_chars.append(value[cursor])
            cursor += 1
        if amount_chars:
            amount_text = "".join(amount_chars).replace(",", ".")
            try:
                amount = Decimal(amount_text)
            except InvalidOperation:
                amount = Decimal("0")

        if debit_credit == "D":
            amount = amount.copy_abs()
        elif debit_credit == "C":
            amount = amount.copy_abs()

        if len(value) > cursor and value[cursor] == "N":
            cursor += 1
            type_chars: list[str] = []
            while len(value) > cursor and value[cursor].isalpha():
                type_chars.append(value[cursor])
                cursor += 1
            if type_chars:
                transaction_type = "".join(type_chars)

        remainder = value[cursor:].strip()
        if remainder:
            if "//" in remainder:
                customer_reference, bank_reference = [part or None for part in remainder.split("//", 1)]
            else:
                customer_reference = remainder or None

        return MT942Transaction(
            statement_reference=statement_reference,
            value_date=value_date,
            entry_date=entry_date,
            debit_credit_mark=debit_credit,
            amount=amount,
            transaction_type=transaction_type,
            customer_reference=customer_reference,
            bank_reference=bank_reference,
            narrative=narrative,
            raw_statement_line=raw_line,
        )


def search_transactions(
    *,
    statement: str,
    reference: str,
    case_insensitive: bool = True,
) -> MT942SearchResult:
    parser = MT942Parser()
    matches: list[MT942Transaction] = []
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

    return MT942SearchResult(matches=matches, total_transactions=total, total_matches=len(matches))


def search_transactions_by_bank_reference(
    *,
    statement: str,
    reference: str,
    case_insensitive: bool = True,
) -> MT942SearchResult:
    parser = MT942Parser()
    matches: list[MT942Transaction] = []
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

    return MT942SearchResult(matches=matches, total_transactions=total, total_matches=len(matches))


def _format_swift_date(value: str) -> str:
    return f"20{value[:2]}-{value[2:4]}-{value[4:]}"


def _format_swift_entry_date(entry: str, value_date: Optional[str]) -> str:
    if len(entry) != 4:
        return entry
    year = value_date[:4] if value_date else ""
    return f"{year}-{entry[:2]}-{entry[2:]}" if year else entry
