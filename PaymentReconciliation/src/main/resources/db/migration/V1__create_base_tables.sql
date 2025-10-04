-- =============================================================================
-- Flyway Migration V1: Create Base Tables
-- Payment Reconciliation Application
-- =============================================================================

-- Use the database
USE paymentreconciliation_dev;

-- =============================================================================
-- 1. UPLOADED FILES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    stored_path VARCHAR(500) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    upload_date DATETIME NOT NULL,
    uploaded_by VARCHAR(100),
    total_records INT NOT NULL DEFAULT 0,
    success_count INT NOT NULL DEFAULT 0,
    failure_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    file_ref_nmbr VARCHAR(100) UNIQUE,
    INDEX idx_file_type (file_type),
    INDEX idx_upload_date (upload_date),
    INDEX idx_status (status),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. WORKER PAYMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS worker_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_reference VARCHAR(64) NOT NULL,
    registration_id VARCHAR(64) NOT NULL,
    worker_name VARCHAR(120) NOT NULL,
    employer_id VARCHAR(64) NOT NULL,
    toli_id VARCHAR(64) NOT NULL,
    toli VARCHAR(64) NOT NULL,
    aadhar VARCHAR(16) NOT NULL,
    pan VARCHAR(16) NOT NULL,
    bank_account VARCHAR(34) NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL,
    file_id VARCHAR(20),
    request_reference_number VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'UPLOADED',
    receipt_number VARCHAR(40),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_file_ref VARCHAR(100),
    INDEX idx_worker_reference (worker_reference),
    INDEX idx_registration_id (registration_id),
    INDEX idx_employer_id (employer_id),
    INDEX idx_toli_id (toli_id),
    INDEX idx_status (status),
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_request_reference (request_reference_number),
    INDEX idx_file_id (file_id),
    INDEX idx_uploaded_file_ref (uploaded_file_ref),
    INDEX idx_created_at (created_at),
    INDEX idx_status_created_at (status, created_at),
    INDEX idx_receipt_created_at (receipt_number, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. WORKER UPLOADED DATA TABLE (Temporary validation table)
-- =============================================================================
CREATE TABLE IF NOT EXISTS worker_uploaded_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(100) NOT NULL,
    row_num INTEGER NOT NULL,
    worker_id VARCHAR(50),
    worker_name VARCHAR(100),
    employer_id VARCHAR(64) NOT NULL,
    toli_id VARCHAR(64) NOT NULL,
    company_name VARCHAR(100),
    department VARCHAR(50),
    position VARCHAR(50),
    work_date DATE,
    hours_worked DECIMAL(5,2),
    hourly_rate DECIMAL(10,2),
    payment_amount DECIMAL(15,2),
    bank_account VARCHAR(20),
    phone_number VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'UPLOADED',
    rejection_reason TEXT,
    uploaded_at DATETIME NOT NULL,
    validated_at DATETIME,
    processed_at DATETIME,
    receipt_number VARCHAR(40),
    INDEX idx_file_id (file_id),
    INDEX idx_file_id_status (file_id, status),
    INDEX idx_employer_id (employer_id),
    INDEX idx_toli_id (toli_id),
    INDEX idx_status (status),
    INDEX idx_row_number (file_id, row_num),
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. WORKER PAYMENT RECEIPTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS worker_payment_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(40) NOT NULL UNIQUE,
    employer_id VARCHAR(64) NOT NULL,
    toli_id VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL,
    total_records INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_employer_id (employer_id),
    INDEX idx_toli_id (toli_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. EMPLOYER PAYMENT RECEIPTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS employer_payment_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_receipt_number VARCHAR(40) NOT NULL UNIQUE,
    worker_receipt_number VARCHAR(40) NOT NULL,
    employer_id VARCHAR(64) NOT NULL,
    toli_id VARCHAR(64) NOT NULL,
    transaction_reference VARCHAR(50) NOT NULL,
    validated_by VARCHAR(64) NOT NULL,
    validated_at DATETIME NOT NULL,
    total_records INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    INDEX idx_employer_receipt_number (employer_receipt_number),
    INDEX idx_worker_receipt_number (worker_receipt_number),
    INDEX idx_employer_id (employer_id),
    INDEX idx_toli_id (toli_id),
    INDEX idx_transaction_reference (transaction_reference),
    INDEX idx_validated_by (validated_by),
    INDEX idx_validated_at (validated_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. BOARD RECEIPTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL,
    board_reference VARCHAR(64) NOT NULL,
    employer_reference VARCHAR(64) NOT NULL,
    employer_id VARCHAR(64) NOT NULL,
    toli_id VARCHAR(64) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    utr_number VARCHAR(48) NOT NULL,
    status VARCHAR(64) NOT NULL,
    maker VARCHAR(64) NOT NULL,
    checker VARCHAR(64),
    receipt_date DATE NOT NULL,
    INDEX idx_board_id (board_id),
    INDEX idx_board_reference (board_reference),
    INDEX idx_employer_reference (employer_reference),
    INDEX idx_employer_id (employer_id),
    INDEX idx_toli_id (toli_id),
    INDEX idx_utr_number (utr_number),
    INDEX idx_status (status),
    INDEX idx_receipt_date (receipt_date),
    INDEX idx_maker (maker),
    INDEX idx_checker (checker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
