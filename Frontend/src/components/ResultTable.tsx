import { StatementTransaction } from "../types/mt940";

interface ResultTableProps {
  matches: StatementTransaction[];
}

function formatValue(value?: string | null): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
}

export function ResultTable({ matches }: ResultTableProps) {
  if (!matches.length) {
    return <p>No transactions matched the search criteria.</p>;
  }

  const showCurrency = matches.some((transaction) => transaction.currency);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="results-table">
        <thead>
          <tr>
            <th>Statement Reference</th>
            <th>Value Date</th>
            <th>Entry Date</th>
            <th>Debit / Credit</th>
            {showCurrency && <th>Currency</th>}
            <th>Amount</th>
            <th>Transaction Type</th>
            <th>Customer Reference</th>
            <th>Bank Reference</th>
            <th>Narrative</th>
            <th>Raw Statement Line</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((transaction, index) => (
            <tr key={`${transaction.raw_statement_line}-${index}`}>
              <td>{formatValue(transaction.statement_reference)}</td>
              <td>{formatValue(transaction.value_date)}</td>
              <td>{formatValue(transaction.entry_date)}</td>
              <td>{formatValue(transaction.debit_credit_mark)}</td>
              {showCurrency && <td>{formatValue(transaction.currency)}</td>}
              <td>{transaction.amount}</td>
              <td>{formatValue(transaction.transaction_type)}</td>
              <td>{formatValue(transaction.customer_reference)}</td>
              <td>{formatValue(transaction.bank_reference)}</td>
              <td>{transaction.narrative}</td>
              <td>{transaction.raw_statement_line}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
