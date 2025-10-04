-- =============================================================================
-- Flyway Migration V5: Standardize Field Names
-- Payment Reconciliation Application
-- =============================================================================

-- Rename file_ref_nmbr to file_reference_number across all tables for consistency

-- =============================================================================
-- 1. UPLOADED FILES TABLE
-- =============================================================================
ALTER TABLE uploaded_files 
CHANGE COLUMN file_ref_nmbr file_reference_number VARCHAR(50) NOT NULL;

-- =============================================================================
-- 2. WORKER UPLOADED DATA TABLE
-- =============================================================================
ALTER TABLE worker_uploaded_data 
CHANGE COLUMN file_ref_nmbr file_reference_number VARCHAR(50) NOT NULL;

-- =============================================================================
-- 3. WORKER PAYMENT RECEIPTS TABLE
-- =============================================================================
ALTER TABLE worker_payment_receipts 
CHANGE COLUMN file_ref_nmbr file_reference_number VARCHAR(50);

-- =============================================================================
-- 4. EMPLOYER PAYMENT RECEIPTS TABLE
-- =============================================================================
ALTER TABLE employer_payment_receipts 
CHANGE COLUMN file_ref_nmbr file_reference_number VARCHAR(50);

-- =============================================================================
-- 5. WORKER PAYMENTS TABLE
-- =============================================================================
ALTER TABLE worker_payments 
CHANGE COLUMN file_ref_nmbr file_reference_number VARCHAR(50);

-- =============================================================================
-- 6. BOARD RECEIPTS TABLE
-- =============================================================================
ALTER TABLE board_receipts 
CHANGE COLUMN file_ref_nmbr file_reference_number VARCHAR(50);

-- =============================================================================
-- 7. UPDATE INDEXES AFTER COLUMN RENAME
-- =============================================================================
-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_uploaded_files_file_ref ON uploaded_files;
DROP INDEX IF EXISTS idx_worker_uploaded_data_file_ref ON worker_uploaded_data;

-- Create new indexes with updated column names
CREATE INDEX idx_uploaded_files_file_reference ON uploaded_files(file_reference_number);
CREATE INDEX idx_worker_uploaded_data_file_reference ON worker_uploaded_data(file_reference_number);
