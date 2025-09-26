export type StatementFormat = "mt940" | "mt942" | "camt52" | "camt53";
export type SearchScope = "all" | "bank_reference";

export interface StatementSearchRequest {
  statement: string;
  reference: string;
  case_insensitive?: boolean;
  limit?: number | null;
  search_in?: SearchScope;
}

export interface StatementTransaction {
  statement_reference?: string | null;
  value_date?: string | null;
  entry_date?: string | null;
  debit_credit_mark?: string | null;
  amount: string;
  currency?: string | null;
  transaction_type?: string | null;
  customer_reference?: string | null;
  bank_reference?: string | null;
  narrative: string;
  raw_statement_line: string;
}

export interface StatementSearchResponse {
  matches: StatementTransaction[];
  matched_count: number;
  total_matches: number;
  total_transactions: number;
  has_more: boolean;
}
