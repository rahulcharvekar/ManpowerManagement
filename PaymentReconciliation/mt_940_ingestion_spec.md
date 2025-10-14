# MT940 → MySQL Ingestion: Design Spec

> Scope: End‑of‑day MT940 files are discovered from a fixed filesystem location, parsed, validated, and stored in MySQL with full auditability and idempotency. No application code shown.

---

## 1) File Reader from a Particular Location

**Directory layout**
- `INBOX`: `/data/mt940/inbox` (read‑only for the app user)
- `PROCESSING`: `/data/mt940/processing`
- `ARCHIVE`: `/data/mt940/archive/YYYY/MM/DD`
- `QUARANTINE`: `/data/mt940/quarantine`

**Discovery**
- Method: Polling watcher every 60s or OS file watch. Process only files that have been **stable** for ≥ 10s (size unchanged).
- Supported types: `.mt940`, `.sta`, or zipped `.zip` containing only MT940 files.
- Naming: `<bank>_<account>_<yyyymmdd>_<seq>.mt940` (example; not trusted for data, used for operator convenience only).

**Intake flow**
1. Move file from `INBOX` → `PROCESSING` with a GUID suffix to avoid collisions.
2. Compute `sha256` and size. If `file_hash` already seen → mark **DUPLICATE** and move to `ARCHIVE`.
3. If decompression needed, extract to a temp subfolder under `PROCESSING`.
4. For each MT940 document in the file, run Parse → Validate → Persist within **one DB transaction per file**.
5. On success: move original to `ARCHIVE/YYYY/MM/DD`.
6. On failure: move to `QUARANTINE` and persist error details.

**Scheduling**
- EOD expectation: files arrive by `22:00` local. Poller runs continuously; optional cron escalation report at `22:30` for any missing accounts.

**Permissions & hardening**
- App runs as `svc_mt940` with read on `INBOX`, rw on others.
- Refuse files > 50MB by policy unless pre‑agreed.
- Refuse multi‑bank bundles unless explicitly configured.

---

## 2) Parse + Validate Rules

**Tags**: `:20:, :25:, :28C:, :60F/M:, :61:, :86:, :62F/M:, :64:, :65:`

**Rules**
- Normalize folded lines; each `:61:` may be followed by one `:86:` (narrative).
- Currency must match across `:60*`, `:61:`, `:62*`.
- Opening + Σ(signed transactions) = Closing (allow bank‑documented rounding deltas only).
- Idempotency key per transaction = hash(account, :20:, :28C:, value_date, amount, DC, entry_ref, bank_ref, cust_ref).
- Strict binding of `:86:` to the immediately preceding `:61:`.

**Interim statements**
- If `:60M/:62M` present, flag statement as **interim** and still import with `is_interim = true`.

---

## 3) Persistence Model (MySQL)

> Engine: InnoDB, `utf8mb4`. Monetary fields use `DECIMAL(19,2)` unless a bank requires 3 decimals.

```sql
-- Bank accounts
CREATE TABLE bank_account (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  account_no VARCHAR(64) NOT NULL,
  iban VARCHAR(34) NULL,
  currency CHAR(3) NOT NULL,
  bank_bic VARCHAR(11) NULL,
  holder_name VARCHAR(128) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_account (account_no, currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Import runs (one per uploaded or discovered file)
CREATE TABLE import_run (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  file_hash CHAR(64) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  received_at DATETIME NOT NULL,
  status ENUM('NEW','PARSED','PARTIAL','FAILED','IMPORTED','DUPLICATE') NOT NULL,
  error_message TEXT NULL,
  UNIQUE KEY uq_filehash (file_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Statement envelope
CREATE TABLE statement_file (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  import_run_id BIGINT NOT NULL,
  bank_account_id BIGINT NOT NULL,
  stmt_ref_20 VARCHAR(35) NOT NULL,
  seq_28c VARCHAR(35) NULL,
  statement_date DATE NOT NULL,
  opening_dc ENUM('D','C') NOT NULL,
  opening_amount DECIMAL(19,2) NOT NULL,
  closing_dc ENUM('D','C') NOT NULL,
  closing_amount DECIMAL(19,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  is_interim BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_sf_run FOREIGN KEY (import_run_id) REFERENCES import_run(id),
  CONSTRAINT fk_sf_acct FOREIGN KEY (bank_account_id) REFERENCES bank_account(id),
  UNIQUE KEY uq_stmt (bank_account_id, stmt_ref_20, seq_28c)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Balances (:60*, :62*, :64, :65)
CREATE TABLE statement_balance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  statement_file_id BIGINT NOT NULL,
  bal_type ENUM('OPENING','CLOSING','AVAILABLE','FORWARD') NOT NULL,
  dc ENUM('D','C') NOT NULL,
  bal_date DATE NOT NULL,
  currency CHAR(3) NOT NULL,
  amount DECIMAL(19,2) NOT NULL,
  CONSTRAINT fk_sb_sf FOREIGN KEY (statement_file_id) REFERENCES statement_file(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Transactions from :61: (+ paired :86:)
CREATE TABLE statement_transaction (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  statement_file_id BIGINT NOT NULL,
  line_no INT NOT NULL,
  value_date DATE NOT NULL,
  entry_date DATE NULL,
  dc ENUM('D','C') NOT NULL,
  amount DECIMAL(19,2) NOT NULL,
  signed_amount DECIMAL(19,2) NOT NULL,
  currency CHAR(3) NOT NULL,
  txn_type_code VARCHAR(4) NULL,
  bank_reference VARCHAR(35) NULL,
  customer_reference VARCHAR(35) NULL,
  entry_reference VARCHAR(16) NULL,
  narrative TEXT NULL,
  narrative_tokens JSON NULL,
  ext_idempotency_hash CHAR(64) NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_st_sf FOREIGN KEY (statement_file_id) REFERENCES statement_file(id),
  UNIQUE KEY uq_txn_hash (ext_idempotency_hash),
  KEY ix_st_dates (value_date),
  KEY ix_st_amount (signed_amount),
  KEY ix_st_refs (bank_reference, customer_reference),
  FULLTEXT KEY ft_narr (narrative)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Structured :86: segments (optional)
CREATE TABLE transaction_86_segment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  statement_transaction_id BIGINT NOT NULL,
  seg_key VARCHAR(32) NOT NULL,
  seg_value VARCHAR(512) NULL,
  seg_seq INT NOT NULL,
  CONSTRAINT fk_t86_txn FOREIGN KEY (statement_transaction_id) REFERENCES statement_transaction(id),
  KEY ix_segkey (seg_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Raw lines for audit
CREATE TABLE raw_statement_line (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  statement_file_id BIGINT NOT NULL,
  line_no INT NOT NULL,
  tag VARCHAR(8) NULL,
  raw_text TEXT NOT NULL,
  CONSTRAINT fk_raw_sf FOREIGN KEY (statement_file_id) REFERENCES statement_file(id),
  KEY ix_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Parse/import errors
CREATE TABLE import_error (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  import_run_id BIGINT NOT NULL,
  statement_file_id BIGINT NULL,
  line_no INT NULL,
  code VARCHAR(64) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_ie_run FOREIGN KEY (import_run_id) REFERENCES import_run(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4) Idempotency and Concurrency

- Unique `import_run.file_hash` avoids re‑processing identical files.
- Unique `statement_file (account, :20:, :28C:)` avoids statement duplication.
- Unique `statement_transaction.ext_idempotency_hash` avoids duplicate lines across retries.
- DB isolation: **READ COMMITTED**. One file per transaction. Use JDBC batch (≈500 rows/batch).

---

## 5) Operator Checks and Reports

- Per file: counts, sum(signed_amount), opening vs closing check, error list.
- Daily missing‑file report at `22:30` for expected accounts.
- Quarantine dashboard with error codes and first 3 offending raw lines.

---

## 6) Configuration (no code)

- Base path: `/data/mt940`
- Poll interval: `60s`
- File stability window: `10s`
- Max file size: `50MB`
- Timezone: `Asia/Kolkata` (dates remain banking DATEs; timestamps logged with TZ)
- Archive retention: 7 years or per policy

---

## 7) Test Scenarios

- Multi‑statement file with `:28C:` sequences.
- Very long `:86:` narratives and folded lines.
- Interim statements (`:60M/:62M`).
- Duplicate file import. Partial parse errors.
- Currency mismatch and opening/closing imbalance.

---

## 8) Next Steps

- Map error codes and their remediation playbook.
- Define allowed `txn_type_code` set for analytics.
- Add reconciliation tables to link to internal invoices or payouts.

