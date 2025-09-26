"""Utilities for parsing ISO 20022 CAMT statements."""

from __future__ import annotations

import importlib
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Iterator, Optional

try:  # pragma: no cover - optional dependency
    from dataclasses import is_dataclass, asdict
except ImportError:  # pragma: no cover
    is_dataclass = None  # type: ignore
    asdict = None  # type: ignore


_CAMT_MODULE_CANDIDATES = {
    "camt.052": (
        "pyiso20022.camt.camt05200108",
        "pyiso20022.camt_052_001_08",
    ),
    "camt.053": (
        "pyiso20022.camt.camt05300108",
        "pyiso20022.camt_053_001_08",
    ),
}


@dataclass(slots=True)
class ISO20022Transaction:
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


@dataclass(slots=True)
class ISO20022SearchResult:
    matches: list[ISO20022Transaction]
    total_transactions: int
    total_matches: int


class ISO20022Parser:
    """Parser for CAMT.052 and CAMT.053 XML messages."""

    def __init__(self, message_type: str) -> None:
        if message_type not in {"camt.052", "camt.053"}:
            raise ValueError(f"Unsupported CAMT message type: {message_type}")
        self._message_type = message_type
        self._document_loader = self._build_document_loader(message_type)

    def parse(self, payload: str) -> list[ISO20022Transaction]:
        return list(self.iter_transactions(payload))

    def iter_transactions(self, payload: str) -> Iterator[ISO20022Transaction]:
        if self._document_loader is not None:
            try:  # pragma: no cover - optional dependency
                document = self._document_loader(payload)
            except Exception:
                document = None
            else:
                if document is not None:
                    yield from self._parse_from_document(document)
                    return
        yield from self._parse_from_xml(payload)

    @staticmethod
    def _build_document_loader(message_type: str):
        loaders = []
        for module_path in _CAMT_MODULE_CANDIDATES.get(message_type, ()):  # pragma: no cover
            try:
                module = importlib.import_module(module_path)
            except ModuleNotFoundError:
                continue
            document_cls = getattr(module, "Document", None)
            if document_cls is None:
                continue
            if hasattr(document_cls, "from_xml"):
                loaders.append(document_cls.from_xml)
        if loaders:
            return loaders[0]
        return None

    def _parse_from_document(self, document) -> Iterator[ISO20022Transaction]:
        if is_dataclass and is_dataclass(document):  # pragma: no cover - optional dependency
            try:
                as_dict = asdict(document)
            except Exception:
                pass
            else:
                yield from self._parse_from_dict(as_dict)
                return
        # Fallback to XML parsing if conversion failed.
        xml_value = getattr(document, "to_xml", None)
        if callable(xml_value):  # pragma: no cover
            yield from self._parse_from_xml(xml_value())

    def _parse_from_dict(self, document_dict: dict) -> Iterator[ISO20022Transaction]:
        container_keys = (
            ("BkToCstmrStmt", "Stmt"),
            ("BkToCstmrAcctRpt", "Rpt"),
        )
        for container_key, statement_key in container_keys:
            container = document_dict.get(container_key)
            if not container:
                continue
            statements = container.get(statement_key, [])
            if isinstance(statements, dict):
                statements = [statements]
            for statement in statements:
                statement_reference = statement.get("Id")
                entries = statement.get("Ntry", [])
                if isinstance(entries, dict):
                    entries = [entries]
                for entry in entries:
                    yield from self._build_transactions_from_entry_dict(
                        entry,
                        statement_reference,
                    )

    def _parse_from_xml(self, payload: str) -> Iterator[ISO20022Transaction]:
        root = ET.fromstring(payload)
        ns = _extract_namespace(root)
        container_paths = (
            (f".//{{{ns}}}BkToCstmrStmt", f"./{{{ns}}}Stmt"),
            (f".//{{{ns}}}BkToCstmrAcctRpt", f"./{{{ns}}}Rpt"),
        )
        for container_path, statement_path in container_paths:
            for container in root.findall(container_path):
                for statement in container.findall(statement_path):
                    statement_reference = _text(statement.find(f"./{{{ns}}}Id"))
                    for entry in statement.findall(f"./{{{ns}}}Ntry"):
                        yield from self._build_transactions_from_entry_xml(
                            entry,
                            statement_reference,
                            ns,
                        )

    def _build_transactions_from_entry_dict(
        self,
        entry: dict,
        statement_reference: Optional[str],
    ) -> Iterator[ISO20022Transaction]:
        amount_value, currency = _coerce_amount(entry.get("Amt"))
        debit_credit = _coerce_indicator(entry.get("CdtDbtInd"))
        value_date = _coerce_date(entry.get("ValDt"))
        entry_date = _coerce_date(entry.get("BookgDt"))
        base_narrative = entry.get("AddtlNtryInf") or ""
        entry_refs = entry.get("Refs", {}) or {}
        transaction_type = _resolve_transaction_code(entry.get("BkTxCd"))

        details = entry.get("NtryDtls") or {}
        transactions = details.get("TxDtls", [])
        if isinstance(transactions, dict):
            transactions = [transactions]

        if not transactions:
            yield ISO20022Transaction(
                statement_reference=statement_reference,
                value_date=value_date,
                entry_date=entry_date,
                debit_credit_mark=debit_credit,
                amount=amount_value,
                currency=currency,
                transaction_type=transaction_type,
                customer_reference=_first_non_empty(
                    entry_refs.get("EndToEndId"),
                    entry_refs.get("InstrId"),
                    entry_refs.get("TxId"),
                ),
                bank_reference=_first_non_empty(
                    entry_refs.get("AcctSvcrRef"),
                    entry_refs.get("PrcgRef"),
                ),
                narrative=base_narrative.strip(),
                raw_statement_line=str(entry),
            )
            return

        for tx_detail in transactions:
            tx_amount, tx_currency = _coerce_amount(tx_detail.get("Amt"))
            tx_refs = tx_detail.get("Refs", {}) or {}
            tx_narrative = _compose_narrative(
                base_narrative,
                tx_detail.get("AddtlTxInf"),
                tx_detail.get("RmtInf"),
            )
            yield ISO20022Transaction(
                statement_reference=statement_reference,
                value_date=value_date,
                entry_date=entry_date,
                debit_credit_mark=debit_credit,
                amount=tx_amount or amount_value,
                currency=tx_currency or currency,
                transaction_type=_first_non_empty(
                    _resolve_transaction_code(tx_detail.get("BkTxCd")),
                    transaction_type,
                ),
                customer_reference=_first_non_empty(
                    tx_refs.get("EndToEndId"),
                    tx_refs.get("InstrId"),
                    tx_refs.get("TxId"),
                ),
                bank_reference=_first_non_empty(
                    tx_refs.get("AcctSvcrRef"),
                    tx_refs.get("PrcgRef"),
                    entry_refs.get("AcctSvcrRef"),
                    entry_refs.get("PrcgRef"),
                ),
                narrative=tx_narrative,
                raw_statement_line=str(tx_detail),
            )

    def _build_transactions_from_entry_xml(
        self,
        entry: ET.Element,
        statement_reference: Optional[str],
        namespace: str,
    ) -> Iterator[ISO20022Transaction]:
        amount_el = entry.find(f"./{{{namespace}}}Amt")
        amount, currency = _coerce_amount_xml(amount_el)
        debit_credit = _coerce_indicator(_text(entry.find(f"./{{{namespace}}}CdtDbtInd")))
        value_date = _coerce_date_xml(entry.find(f"./{{{namespace}}}ValDt"), namespace)
        entry_date = _coerce_date_xml(entry.find(f"./{{{namespace}}}BookgDt"), namespace)
        entry_refs_el = entry.find(f"./{{{namespace}}}Refs")
        entry_refs = _collect_refs_xml(entry_refs_el, namespace)
        base_narrative_parts = [
            _text(node)
            for node in entry.findall(f"./{{{namespace}}}AddtlNtryInf")
            if _text(node)
        ]
        transaction_type = _resolve_transaction_code_xml(
            entry.find(f"./{{{namespace}}}BkTxCd"),
            namespace,
        )

        tx_details = entry.findall(
            f"./{{{namespace}}}NtryDtls/{{{namespace}}}TxDtls"
        )

        if not tx_details:
            yield ISO20022Transaction(
                statement_reference=statement_reference,
                value_date=value_date,
                entry_date=entry_date,
                debit_credit_mark=debit_credit,
                amount=amount,
                currency=currency,
                transaction_type=transaction_type,
                customer_reference=_first_non_empty(
                    entry_refs.get("EndToEndId"),
                    entry_refs.get("InstrId"),
                    entry_refs.get("TxId"),
                ),
                bank_reference=_first_non_empty(
                    entry_refs.get("AcctSvcrRef"),
                    entry_refs.get("PrcgRef"),
                ),
                narrative=" ".join(base_narrative_parts).strip(),
                raw_statement_line=ET.tostring(entry, encoding="unicode"),
            )
            return

        for tx_detail in tx_details:
            tx_amount_el = tx_detail.find(f"./{{{namespace}}}Amt")
            tx_amount, tx_currency = _coerce_amount_xml(tx_amount_el)
            tx_refs = _collect_refs_xml(
                tx_detail.find(f"./{{{namespace}}}Refs"),
                namespace,
            )
            tx_narrative = _compose_narrative(
                " ".join(base_narrative_parts),
                _text(tx_detail.find(f"./{{{namespace}}}AddtlTxInf")),
                tx_detail.find(f"./{{{namespace}}}RmtInf"),
                namespace=namespace,
            )
            yield ISO20022Transaction(
                statement_reference=statement_reference,
                value_date=value_date,
                entry_date=entry_date,
                debit_credit_mark=debit_credit,
                amount=tx_amount or amount,
                currency=tx_currency or currency,
                transaction_type=_first_non_empty(
                    _resolve_transaction_code_xml(
                        tx_detail.find(f"./{{{namespace}}}BkTxCd"),
                        namespace,
                    ),
                    transaction_type,
                ),
                customer_reference=_first_non_empty(
                    tx_refs.get("EndToEndId"),
                    tx_refs.get("InstrId"),
                    tx_refs.get("TxId"),
                ),
                bank_reference=_first_non_empty(
                    tx_refs.get("AcctSvcrRef"),
                    tx_refs.get("PrcgRef"),
                    entry_refs.get("AcctSvcrRef"),
                    entry_refs.get("PrcgRef"),
                ),
                narrative=tx_narrative,
                raw_statement_line=ET.tostring(tx_detail, encoding="unicode"),
            )


def search_transactions(
    *,
    message_type: str,
    payload: str,
    reference: str,
    case_insensitive: bool = True,
) -> ISO20022SearchResult:
    parser = ISO20022Parser(message_type)
    matches: list[ISO20022Transaction] = []
    total = 0
    query = reference.lower() if case_insensitive else reference

    for tx in parser.iter_transactions(payload):
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

    return ISO20022SearchResult(
        matches=matches,
        total_transactions=total,
        total_matches=len(matches),
    )


def search_transactions_by_bank_reference(
    *,
    message_type: str,
    payload: str,
    reference: str,
    case_insensitive: bool = True,
) -> ISO20022SearchResult:
    parser = ISO20022Parser(message_type)
    matches: list[ISO20022Transaction] = []
    total = 0
    query = reference.lower() if case_insensitive else reference

    for tx in parser.iter_transactions(payload):
        total += 1
        bank_reference = tx.bank_reference
        if not bank_reference:
            continue
        target = bank_reference.lower() if case_insensitive else bank_reference
        if target == query:
            matches.append(tx)

    return ISO20022SearchResult(
        matches=matches,
        total_transactions=total,
        total_matches=len(matches),
    )


def _coerce_amount(value) -> tuple[Decimal, Optional[str]]:
    if isinstance(value, dict):
        amount = value.get("value") or value.get("Amt") or value.get("content") or value.get("#text")
        currency = value.get("Ccy") or value.get("ccy")
    else:
        amount = value
        currency = None
    return _to_decimal(amount), currency


def _coerce_amount_xml(element: Optional[ET.Element]) -> tuple[Decimal, Optional[str]]:
    if element is None:
        return Decimal("0"), None
    return _to_decimal(element.text), element.get("Ccy")


def _coerce_indicator(value) -> Optional[str]:
    if not value:
        return None
    indicator = str(value).upper()
    if indicator.startswith("CRD") or indicator.startswith("CRDT") or indicator.startswith("C"):
        return "C"
    if indicator.startswith("DBT") or indicator.startswith("DBIT") or indicator.startswith("D"):
        return "D"
    return indicator[:1]


def _coerce_date(value) -> Optional[str]:
    if isinstance(value, dict):
        date_value = value.get("Dt") or value.get("date") or value.get("value")
    else:
        date_value = value
    if isinstance(date_value, dict):
        date_value = date_value.get("Dt")
    if not date_value:
        return None
    return str(date_value)


def _coerce_date_xml(element: Optional[ET.Element], namespace: str) -> Optional[str]:
    if element is None:
        return None
    date_node = element.find(f"./{{{namespace}}}Dt") or element
    return _text(date_node)


def _resolve_transaction_code(value) -> Optional[str]:
    if not isinstance(value, dict):
        return value
    prtry = value.get("Prtry")
    if isinstance(prtry, dict):
        return _first_non_empty(prtry.get("Id"), prtry.get("Cd"))
    domn = value.get("Domn") or {}
    fmly = domn.get("Fmly") if isinstance(domn, dict) else {}
    return _first_non_empty(
        domn.get("Cd") if isinstance(domn, dict) else None,
        fmly.get("SubFmlyCd") if isinstance(fmly, dict) else None,
    )


def _resolve_transaction_code_xml(element: Optional[ET.Element], namespace: str) -> Optional[str]:
    if element is None:
        return None
    prtry = element.find(f"./{{{namespace}}}Prtry")
    if prtry is not None:
        return _first_non_empty(_text(prtry.find(f"./{{{namespace}}}Id")), _text(prtry.find(f"./{{{namespace}}}Cd")))
    domn = element.find(f"./{{{namespace}}}Domn")
    if domn is not None:
        fmly = domn.find(f"./{{{namespace}}}Fmly")
        return _first_non_empty(_text(domn.find(f"./{{{namespace}}}Cd")), _text(fmly.find(f"./{{{namespace}}}SubFmlyCd")) if fmly is not None else None)
    return None


def _collect_refs_xml(element: Optional[ET.Element], namespace: str) -> dict[str, Optional[str]]:
    if element is None:
        return {}
    keys = (
        "EndToEndId",
        "InstrId",
        "TxId",
        "AcctSvcrRef",
        "PrcgRef",
    )
    refs: dict[str, Optional[str]] = {}
    for key in keys:
        refs[key] = _text(element.find(f"./{{{namespace}}}{key}"))
    return refs


def _compose_narrative(
    base: Optional[str],
    detail: Optional[str],
    remittance,
    *,
    namespace: Optional[str] = None,
) -> str:
    parts = [part for part in (base, detail) if part]
    if remittance is None:
        return " ".join(parts).strip()
    if isinstance(remittance, dict):
        ustrd = remittance.get("Ustrd")
        if isinstance(ustrd, list):
            parts.extend(filter(None, (str(item).strip() for item in ustrd)))
        elif ustrd:
            parts.append(str(ustrd).strip())
    elif isinstance(remittance, ET.Element) and namespace:
        for item in remittance.findall(f"./{{{namespace}}}Ustrd"):
            text = _text(item)
            if text:
                parts.append(text)
    return " ".join(parts).strip()


def _first_non_empty(*values: Optional[str]) -> Optional[str]:
    for value in values:
        if value:
            return value
    return None


def _text(element: Optional[ET.Element]) -> Optional[str]:
    if element is None:
        return None
    text = element.text or ""
    stripped = text.strip()
    return stripped or None


def _to_decimal(value) -> Decimal:
    if value is None:
        return Decimal("0")
    try:
        return Decimal(str(value).replace(",", "."))
    except InvalidOperation:
        return Decimal("0")


def _extract_namespace(root: ET.Element) -> str:
    if root.tag.startswith("{"):
        return root.tag.split("}", 1)[0][1:]
    return "urn:iso:std:iso:20022:tech:xsd:{0}".format(root.tag)
