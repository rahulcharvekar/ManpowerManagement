# Microservices Database Schema Mapping

This document maps existing monolithic tables to the new microservices' database schemas. Each service will have its own schema and only own the tables relevant to its domain.

---

## 1. User Auth Service (user-auth-db)
- users
- user_roles
- roles
- capabilities
- policies
- policy_capabilities
- endpoint_policies
- endpoints
- page_actions
- ui_pages
- authorization_audit
- user_sessions
- audit_event
- audit_log
- system_config
- notification_templates

(Include *_backup tables if needed for audit/history)

---

## 2. Payment Flow Service (payment-flow-db)
- board_master
- employer_master
- employer_toli_relation
- worker_master
- worker_uploaded_data
- worker_payments
- worker_payment_receipts
- employer_payment_receipts
- board_receipts

---

## 3. Reconciliation Service (reconciliation-db)
- statement_file
- statement_transaction
- statement_balance
- raw_statement_line
- transaction_86_segment
- import_run
- import_error
- file_processing_queue
- uploaded_files

---

## 4. Shared Service/Library
- No direct DB tables; provides utilities for logging, file upload, directory reading, etc. (If you need centralized logs, you can add a shared log table or use an external logging system.)

---

## 5. Other Tables
- api_rate_limits: Place in user-auth-db or a separate infra DB if used for auth/rate limiting.
- policies_backup, roles_backup, etc.: Place with their main tables in the relevant service DB.

---

## Example Schema Ownership Table

| Table Name                  | Service/DB           |
|----------------------------|----------------------|
| users                      | user-auth-db         |
| user_roles                 | user-auth-db         |
| roles                      | user-auth-db         |
| board_master               | payment-flow-db      |
| employer_master            | payment-flow-db      |
| worker_master              | payment-flow-db      |
| statement_file             | reconciliation-db    |
| statement_transaction      | reconciliation-db    |
| ...                        | ...                  |

---

## Notes
- Each service should only access its own schema/tables.
- For cross-service data, use APIs (not direct DB joins).
- Adjust as needed for your business logic and future growth.

---

Feel free to expand or adjust this mapping as your microservices evolve.
