-- =============================================================================
-- V17: Update receipt status constraints to include missing statuses
-- =============================================================================
-- This migration updates the check constraints on receipt tables to include
-- all the statuses that are actually being used by the application.
--
-- Original constraints were too restrictive and didn't account for all workflow states
-- =============================================================================

-- Update worker_payment_receipts constraint
ALTER TABLE worker_payment_receipts
DROP CHECK chk_worker_payment_receipts_status;

ALTER TABLE worker_payment_receipts
ADD CONSTRAINT chk_worker_payment_receipts_status 
CHECK (status IN (
    'PENDING',           -- Receipt is pending
    'VALIDATED',         -- Receipt has been validated
    'PROCESSED',         -- Receipt has been processed/generated
    'PAYMENT_INITIATED', -- Payment has been initiated
    'GENERATED'          -- Receipt was generated (legacy status)
));

-- Update employer_payment_receipts constraint  
ALTER TABLE employer_payment_receipts
DROP CHECK chk_employer_payment_receipts_status;

ALTER TABLE employer_payment_receipts
ADD CONSTRAINT chk_employer_payment_receipts_status 
CHECK (status IN (
    'PENDING',           -- Awaiting validation
    'VALIDATED',         -- Has been validated
    'PROCESSED',         -- Has been processed
    'SEND TO BOARD'      -- Sent to board for processing
));

-- Note: board_receipts constraint remains unchanged as it's already correct
