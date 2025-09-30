-- =============================================================================
-- Payment Reconciliation Application - Database Schema Creation Script
-- Version: 1.0
-- Target: Azure MySQL Flexible Server (MySQL 8.0+)
-- =============================================================================

-- Create database (uncomment if you need to create the database)
-- CREATE DATABASE IF NOT EXISTS paymentreconciliation_prod 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- Use the database
USE paymentreconciliation_prod;

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
    request_reference_number VARCHAR(100) UNIQUE,
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
    toli VARCHAR(64) NOT NULL,
    aadhar VARCHAR(16) NOT NULL,
    pan VARCHAR(16) NOT NULL,
    bank_account VARCHAR(34) NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL,
    file_id VARCHAR(20),
    request_reference_number VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'UPLOADED',
    receipt_number VARCHAR(40),
    INDEX idx_worker_reference (worker_reference),
    INDEX idx_registration_id (registration_id),
    INDEX idx_status (status),
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_request_reference (request_reference_number),
    INDEX idx_file_id (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. WORKER PAYMENT RECEIPTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS worker_payment_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(40) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL,
    total_records INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    INDEX idx_receipt_number (receipt_number),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. EMPLOYER PAYMENT RECEIPTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS employer_payment_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_receipt_number VARCHAR(40) NOT NULL UNIQUE,
    worker_receipt_number VARCHAR(40) NOT NULL,
    transaction_reference VARCHAR(50) NOT NULL,
    validated_by VARCHAR(64) NOT NULL,
    validated_at DATETIME NOT NULL,
    total_records INT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    INDEX idx_employer_receipt_number (employer_receipt_number),
    INDEX idx_worker_receipt_number (worker_receipt_number),
    INDEX idx_transaction_reference (transaction_reference),
    INDEX idx_validated_by (validated_by),
    INDEX idx_validated_at (validated_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. BOARD RECEIPTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_reference VARCHAR(64) NOT NULL,
    employer_reference VARCHAR(64) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    utr_number VARCHAR(48) NOT NULL,
    status ENUM('PENDING','VERIFIED','REJECTED','PROCESSED') NOT NULL DEFAULT 'PENDING',
    maker VARCHAR(64) NOT NULL,
    checker VARCHAR(64),
    receipt_date DATE NOT NULL,
    INDEX idx_board_reference (board_reference),
    INDEX idx_employer_reference (employer_reference),
    INDEX idx_utr_number (utr_number),
    INDEX idx_status (status),
    INDEX idx_receipt_date (receipt_date),
    INDEX idx_maker (maker),
    INDEX idx_checker (checker)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- FOREIGN KEY CONSTRAINTS (Optional - uncomment if you want referential integrity)
-- =============================================================================

-- Add foreign key from worker_payments to worker_payment_receipts
-- ALTER TABLE worker_payments 
-- ADD CONSTRAINT fk_worker_payments_receipt 
-- FOREIGN KEY (receipt_number) REFERENCES worker_payment_receipts(receipt_number);

-- Add foreign key from employer_payment_receipts to worker_payment_receipts
-- ALTER TABLE employer_payment_receipts 
-- ADD CONSTRAINT fk_employer_worker_receipt 
-- FOREIGN KEY (worker_receipt_number) REFERENCES worker_payment_receipts(receipt_number);

-- Add foreign key from board_receipts to employer_payment_receipts
-- ALTER TABLE board_receipts 
-- ADD CONSTRAINT fk_board_employer_receipt 
-- FOREIGN KEY (employer_reference) REFERENCES employer_payment_receipts(employer_receipt_number);

-- =============================================================================
-- INITIAL DATA / SAMPLE DATA (Optional)
-- =============================================================================

-- You can add any initial configuration data here if needed
-- INSERT INTO uploaded_files (filename, stored_path, file_hash, file_type, upload_date, status) 
-- VALUES ('sample.csv', '/tmp/uploads/sample.csv', 'hash123', 'CSV', NOW(), 'PROCESSED');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify all tables are created
SHOW TABLES;

-- Check table structures
-- DESCRIBE uploaded_files;
-- DESCRIBE worker_payments;
-- DESCRIBE worker_payment_receipts;
-- DESCRIBE employer_payment_receipts;
-- DESCRIBE board_receipts;

-- =============================================================================
-- CLEANUP SCRIPT (DO NOT RUN IN PRODUCTION)
-- =============================================================================

/*
-- WARNING: This will drop all tables and data!
-- Only use this for development/testing environments

DROP TABLE IF EXISTS board_receipts;
DROP TABLE IF EXISTS employer_payment_receipts;
DROP TABLE IF EXISTS worker_payment_receipts;
DROP TABLE IF EXISTS worker_payments;
DROP TABLE IF EXISTS uploaded_files;
*/

-- =============================================================================
-- GRANT PERMISSIONS (Update with your actual username)
-- =============================================================================

-- Replace 'your_app_user' with your actual application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON paymentreconciliation_prod.* TO 'your_app_user'@'%';
-- FLUSH PRIVILEGES;

-- =============================================================================
-- SCRIPT COMPLETION
-- =============================================================================

SELECT 'Database schema creation completed successfully!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'paymentreconciliation_prod';
