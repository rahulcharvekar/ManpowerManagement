-- =============================================================================
-- Flyway Migration V4: Add Performance Indexes
-- Payment Reconciliation Application
-- =============================================================================

-- Add missing indexes for better query performance

-- =============================================================================
-- 1. WORKER MASTER PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX idx_worker_master_bank_account ON worker_master(bank_account);
CREATE INDEX idx_worker_master_name_status ON worker_master(worker_name, status);
CREATE INDEX idx_worker_master_phone_email ON worker_master(phone_number, email);

-- =============================================================================
-- 2. EMPLOYER MASTER PERFORMANCE INDEXES  
-- =============================================================================
CREATE INDEX idx_employer_master_pan_gst ON employer_master(pan_number, gst_number);
CREATE INDEX idx_employer_master_name_status ON employer_master(employer_name, status);
CREATE INDEX idx_employer_master_contact ON employer_master(contact_email, contact_phone);

-- =============================================================================
-- 3. BOARD MASTER PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX idx_board_master_state_district ON board_master(state_name, district_name);
CREATE INDEX idx_board_master_name_status ON board_master(board_name, status);

-- =============================================================================
-- 4. EMPLOYER TOLI RELATION PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX idx_employer_toli_location ON employer_toli_relation(location);
CREATE INDEX idx_employer_toli_supervisor ON employer_toli_relation(supervisor_name, supervisor_contact);
CREATE INDEX idx_employer_toli_name_status ON employer_toli_relation(toli_name, status);

-- =============================================================================
-- 5. WORKER PAYMENTS PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX idx_worker_payments_amount_date ON worker_payments(payment_amount, created_at);
CREATE INDEX idx_worker_payments_employer_toli ON worker_payments(employer_id, toli_id);
CREATE INDEX idx_worker_payments_bank_account ON worker_payments(bank_account);
CREATE INDEX idx_worker_payments_worker_status ON worker_payments(worker_reference, status);

-- =============================================================================
-- 6. WORKER UPLOADED DATA PERFORMANCE INDEXES
-- =============================================================================
CREATE INDEX idx_worker_uploaded_data_employer_toli ON worker_uploaded_data(employer_id, toli_id);
CREATE INDEX idx_worker_uploaded_data_amount_date ON worker_uploaded_data(payment_amount, uploaded_at);
CREATE INDEX idx_worker_uploaded_data_work_date ON worker_uploaded_data(work_date);

-- =============================================================================
-- 7. COMPOSITE INDEXES FOR COMMON QUERIES
-- =============================================================================
CREATE INDEX idx_worker_payments_search ON worker_payments(employer_id, toli_id, status, created_at);
CREATE INDEX idx_receipts_employer_date ON worker_payment_receipts(employer_id, created_at, status);
CREATE INDEX idx_board_receipts_search ON board_receipts(board_id, employer_id, status, receipt_date);
