-- =============================================================================
-- Flyway Migration V6: Add Validation Constraints
-- Payment Reconciliation Application
-- =============================================================================

-- Add check constraints for data validation at database level

-- =============================================================================
-- 1. WORKER MASTER VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE worker_master
ADD CONSTRAINT chk_worker_master_status 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED'));

ALTER TABLE worker_master
ADD CONSTRAINT chk_worker_master_aadhaar 
CHECK (aadhaar_number REGEXP '^[0-9]{12}$');

ALTER TABLE worker_master
ADD CONSTRAINT chk_worker_master_pan 
CHECK (pan_number REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$');

ALTER TABLE worker_master
ADD CONSTRAINT chk_worker_master_phone 
CHECK (phone_number REGEXP '^[0-9]{10}$');

-- =============================================================================
-- 2. EMPLOYER MASTER VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE employer_master
ADD CONSTRAINT chk_employer_master_status 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

ALTER TABLE employer_master
ADD CONSTRAINT chk_employer_master_pan 
CHECK (pan_number REGEXP '^[A-Z]{5}[0-9]{4}[A-Z]{1}$');

ALTER TABLE employer_master
ADD CONSTRAINT chk_employer_master_gst 
CHECK (gst_number REGEXP '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

-- =============================================================================
-- 3. BOARD MASTER VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE board_master
ADD CONSTRAINT chk_board_master_status 
CHECK (status IN ('ACTIVE', 'INACTIVE'));

-- =============================================================================
-- 4. EMPLOYER TOLI RELATION VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE employer_toli_relation
ADD CONSTRAINT chk_employer_toli_status 
CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- =============================================================================
-- 5. WORKER PAYMENTS VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE worker_payments
ADD CONSTRAINT chk_worker_payments_status 
CHECK (status IN ('UPLOADED', 'VALIDATED', 'PROCESSED', 'PAID', 'REJECTED'));

ALTER TABLE worker_payments
ADD CONSTRAINT chk_worker_payments_amount_positive 
CHECK (payment_amount > 0);

-- =============================================================================
-- 6. UPLOADED FILES VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE uploaded_files
ADD CONSTRAINT chk_uploaded_files_status 
CHECK (status IN ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'));

ALTER TABLE uploaded_files
ADD CONSTRAINT chk_uploaded_files_counts_valid 
CHECK (total_records >= 0 AND success_count >= 0 AND failure_count >= 0);

-- =============================================================================
-- 7. RECEIPTS VALIDATION CONSTRAINTS
-- =============================================================================
ALTER TABLE worker_payment_receipts
ADD CONSTRAINT chk_worker_payment_receipts_status 
CHECK (status IN ('PENDING', 'VALIDATED', 'PROCESSED'));

ALTER TABLE employer_payment_receipts
ADD CONSTRAINT chk_employer_payment_receipts_status 
CHECK (status IN ('PENDING', 'VALIDATED', 'PROCESSED'));

ALTER TABLE board_receipts
ADD CONSTRAINT chk_board_receipts_status 
CHECK (status IN ('PENDING', 'VERIFIED', 'PAID'));
