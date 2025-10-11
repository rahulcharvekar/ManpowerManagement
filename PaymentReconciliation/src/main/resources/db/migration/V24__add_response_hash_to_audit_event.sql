-- Migration: Add response_hash column to audit_event table
ALTER TABLE audit_event ADD COLUMN response_hash VARCHAR(64);
