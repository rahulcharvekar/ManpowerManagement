-- =============================================================================
-- Flyway Migration V3: Add Critical Foreign Key Constraints
-- Payment Reconciliation Application
-- =============================================================================

-- Add critical foreign key constraints for data integrity

-- =============================================================================
-- 1. EMPLOYER TOLI RELATION CONSTRAINTS
-- =============================================================================
ALTER TABLE employer_toli_relation 
ADD CONSTRAINT fk_employer_toli_employer 
FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- 2. WORKER PAYMENTS CONSTRAINTS  
-- =============================================================================
ALTER TABLE worker_payments 
ADD CONSTRAINT fk_worker_payments_employer 
FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE worker_payments 
ADD CONSTRAINT fk_worker_payments_worker 
FOREIGN KEY (worker_reference) REFERENCES worker_master(worker_reference)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- 3. BOARD RECEIPTS CONSTRAINTS
-- =============================================================================
ALTER TABLE board_receipts 
ADD CONSTRAINT fk_board_receipts_board 
FOREIGN KEY (board_id) REFERENCES board_master(board_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE board_receipts 
ADD CONSTRAINT fk_board_receipts_employer 
FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- 4. WORKER UPLOADED DATA CONSTRAINTS
-- =============================================================================
ALTER TABLE worker_uploaded_data 
ADD CONSTRAINT fk_worker_uploaded_data_employer 
FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- 5. WORKER PAYMENT RECEIPTS CONSTRAINTS
-- =============================================================================
ALTER TABLE worker_payment_receipts 
ADD CONSTRAINT fk_worker_payment_receipts_employer 
FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- 6. EMPLOYER PAYMENT RECEIPTS CONSTRAINTS
-- =============================================================================
ALTER TABLE employer_payment_receipts 
ADD CONSTRAINT fk_employer_payment_receipts_employer 
FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id)
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE employer_payment_receipts 
ADD CONSTRAINT fk_employer_worker_receipt 
FOREIGN KEY (worker_receipt_number) REFERENCES worker_payment_receipts(receipt_number)
ON DELETE RESTRICT ON UPDATE CASCADE;
