"""Core application primitives and domain logic."""

from .config import settings
from .mt940 import (
    MT940Parser,
    MT940SearchResult,
    search_transactions,
    search_transactions_by_bank_reference,
)

__all__ = [
    "settings",
    "MT940Parser",
    "MT940SearchResult",
    "search_transactions",
    "search_transactions_by_bank_reference",
]
