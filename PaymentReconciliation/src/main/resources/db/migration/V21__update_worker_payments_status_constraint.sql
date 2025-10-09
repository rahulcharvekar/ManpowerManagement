-- =============================================================================
-- V15: Update worker_payments status constraint to include missing statuses
-- =============================================================================
-- This migration updates the check constraint on worker_payments.status to include
-- all the statuses that are actually being used by the application.
--
-- Original constraint only allowed: UPLOADED, VALIDATED, PROCESSED, PAID, REJECTED
-- Application also uses: PENDING, APPROVED, PAYMENT_REQUESTED, PAYMENT_INITIATED
-- =============================================================================

-- Drop the old constraint (MySQL syntax)
ALTER TABLE worker_payments
DROP CHECK chk_worker_payments_status;

-- Add the updated constraint with all valid statuses
ALTER TABLE worker_payments
ADD CONSTRAINT chk_worker_payments_status 
CHECK (status IN (
    'UPLOADED',           -- Initial status when record is uploaded
    'VALIDATED',          -- Record has passed validation
    'PROCESSED',          -- Record has been processed
    'PAID',               -- Payment has been completed
    'REJECTED',           -- Record was rejected
    'PENDING',            -- Payment is pending
    'APPROVED',           -- Payment has been approved
    'PAYMENT_REQUESTED',  -- Payment request has been created
    'PAYMENT_INITIATED'   -- Payment has been initiated
));
