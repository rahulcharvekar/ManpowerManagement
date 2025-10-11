-- Add referer, client_source, and requested_with columns to audit_event table
ALTER TABLE audit_event
ADD COLUMN referer VARCHAR(256) NULL,
ADD COLUMN client_source VARCHAR(64) NULL,
ADD COLUMN requested_with VARCHAR(64) NULL;
