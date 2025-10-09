-- =============================================================================
-- V16: Temporarily drop worker_payments foreign key to worker_master
-- =============================================================================
-- This migration temporarily removes the foreign key constraint between
-- worker_payments and worker_master to allow payment processing before
-- worker master records are fully populated.
--
-- TODO: Re-enable this constraint once worker master data is properly synced
-- =============================================================================

-- Drop the foreign key constraint
ALTER TABLE worker_payments
DROP FOREIGN KEY fk_worker_payments_worker;

-- Note: The column worker_reference still exists, it just won't be validated
-- against worker_master table until the constraint is re-added.
