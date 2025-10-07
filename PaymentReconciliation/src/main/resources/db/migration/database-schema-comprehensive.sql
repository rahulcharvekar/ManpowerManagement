-- =============================================================================
-- Payment Reconciliation Application - Database Schema Creation Script
-- Version: 1.0
-- Target: Azure MySQL Flexible Server (MySQL 8.0+)
-- =============================================================================

-- Create database (uncomment if you need to create the database)
-- CREATE DATABASE IF NOT EXISTS paymentreconciliation_dev 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- Use the database
USE paymentreconciliation_dev;

-- =============================================================================
-- MASTER TABLES
-- =============================================================================

-- =============================================================================
-- 1. BOARD MASTER TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    board_id VARCHAR(64) NOT NULL UNIQUE,
    board_name VARCHAR(200) NOT NULL,
    board_code VARCHAR(20) NOT NULL UNIQUE,
    state_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(100),
    address TEXT,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_board_id (board_id),
    INDEX idx_board_code (board_code),
    INDEX idx_status (status),
    INDEX idx_state_name (state_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. EMPLOYER MASTER TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS employer_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_id VARCHAR(64) NOT NULL UNIQUE,
    employer_name VARCHAR(200) NOT NULL,
    employer_code VARCHAR(20) NOT NULL UNIQUE,
    company_registration_number VARCHAR(50),
    pan_number VARCHAR(20),
    gst_number VARCHAR(20),
    address TEXT,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_employer_id (employer_id),
    INDEX idx_employer_code (employer_code),
    INDEX idx_status (status),
    INDEX idx_pan_number (pan_number),
    INDEX idx_gst_number (gst_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. WORKER MASTER TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS worker_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    worker_id VARCHAR(64) NOT NULL UNIQUE,
    worker_reference VARCHAR(64) NOT NULL UNIQUE,
    registration_id VARCHAR(64) NOT NULL UNIQUE,
    worker_name VARCHAR(120) NOT NULL,
    father_name VARCHAR(120),
    date_of_birth DATE,
    gender VARCHAR(10),
    aadhar VARCHAR(16) NOT NULL UNIQUE,
    pan VARCHAR(16),
    bank_account VARCHAR(34),
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    phone_number VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_worker_id (worker_id),
    INDEX idx_worker_reference (worker_reference),
    INDEX idx_registration_id (registration_id),
    INDEX idx_aadhar (aadhar),
    INDEX idx_pan (pan),
    INDEX idx_status (status),
    INDEX idx_phone_number (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. EMPLOYER TOLI RELATION TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS employer_toli_relation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employer_id VARCHAR(64) NOT NULL,
    toli_id VARCHAR(64) NOT NULL,
    toli_name VARCHAR(120) NOT NULL,
    toli_code VARCHAR(20),
    location VARCHAR(200),
    supervisor_name VARCHAR(100),
    supervisor_contact VARCHAR(15),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_employer_toli (employer_id, toli_id),
    INDEX idx_employer_id (employer_id),
    INDEX idx_toli_id (toli_id),
    INDEX idx_status (status),
    INDEX idx_toli_code (toli_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. UPLOADED FILES TABLE
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
-- 6. WORKER PAYMENTS TABLE
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
-- 7. WORKER UPLOADED DATA TABLE (Temporary validation table)
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
-- 8. WORKER PAYMENT RECEIPTS TABLE
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
-- 9. EMPLOYER PAYMENT RECEIPTS TABLE
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
-- 10. BOARD RECEIPTS TABLE
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

-- =============================================================================
-- FOREIGN KEY CONSTRAINTS (Optional - uncomment if you want referential integrity)
-- =============================================================================

-- Master table foreign key constraints
-- ALTER TABLE employer_toli_relation 
-- ADD CONSTRAINT fk_employer_toli_employer 
-- FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id);

-- ALTER TABLE worker_payments 
-- ADD CONSTRAINT fk_worker_payments_employer 
-- FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id);

-- ALTER TABLE worker_payments 
-- ADD CONSTRAINT fk_worker_payments_worker 
-- FOREIGN KEY (worker_reference) REFERENCES worker_master(worker_reference);

-- ALTER TABLE board_receipts 
-- ADD CONSTRAINT fk_board_receipts_board 
-- FOREIGN KEY (board_id) REFERENCES board_master(board_id);

-- ALTER TABLE board_receipts 
-- ADD CONSTRAINT fk_board_receipts_employer 
-- FOREIGN KEY (employer_id) REFERENCES employer_master(employer_id);

-- Transaction table foreign key constraints
-- ALTER TABLE worker_payments 
-- ADD CONSTRAINT fk_worker_payments_receipt 
-- FOREIGN KEY (receipt_number) REFERENCES worker_payment_receipts(receipt_number);

-- ALTER TABLE employer_payment_receipts 
-- ADD CONSTRAINT fk_employer_worker_receipt 
-- FOREIGN KEY (worker_receipt_number) REFERENCES worker_payment_receipts(receipt_number);

-- ALTER TABLE board_receipts 
-- ADD CONSTRAINT fk_board_employer_receipt 
-- FOREIGN KEY (employer_reference) REFERENCES employer_payment_receipts(employer_receipt_number);

-- =============================================================================
-- 11. USERS TABLE (Authentication & Authorization)
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'WORKER', 'BOARD', 'EMPLOYER', 'RECONCILIATION_OFFICER') NOT NULL DEFAULT 'WORKER',
    legacy_role VARCHAR(50), -- For backward compatibility during RBAC migration
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    is_account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    is_account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    is_credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 12. PERMISSIONS TABLE (RBAC System)
-- =============================================================================
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    module VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_permission_name (name),
    INDEX idx_permission_module (module)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 13. ROLES TABLE (RBAC System)
-- =============================================================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 14. ROLE_PERMISSIONS JUNCTION TABLE (RBAC System)
-- =============================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 15. USER_ROLES JUNCTION TABLE (RBAC System)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 16. PERMISSION_API_ENDPOINTS TABLE (API Permission Mapping)
-- =============================================================================
CREATE TABLE IF NOT EXISTS permission_api_endpoints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    permission_id BIGINT NOT NULL,
    api_endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL DEFAULT 'GET',
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_permission_id (permission_id),
    INDEX idx_api_endpoint (api_endpoint),
    INDEX idx_http_method (http_method),
    INDEX idx_active (is_active),
    
    -- Foreign key constraint
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint to prevent duplicate endpoint-method combinations per permission
    UNIQUE KEY unique_permission_endpoint_method (permission_id, api_endpoint, http_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- DEMO/DEFAULT DATA
-- =============================================================================

-- For demo data (users, roles, permissions, sample master data), run:
-- SOURCE demo-data-insertion.sql;
-- OR execute the demo-data-insertion.sql file separately

-- For permission-API endpoint mappings, run:
-- SOURCE sample-permission-api-endpoints.sql;

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

-- Drop RBAC tables first (due to foreign key constraints)
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permission_api_endpoints;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;

-- Drop main application tables
DROP TABLE IF EXISTS board_receipts;
DROP TABLE IF EXISTS employer_payment_receipts;
DROP TABLE IF EXISTS worker_payment_receipts;
DROP TABLE IF EXISTS worker_uploaded_data;
DROP TABLE IF EXISTS worker_payments;
DROP TABLE IF EXISTS uploaded_files;
DROP TABLE IF EXISTS employer_toli_relation;
DROP TABLE IF EXISTS worker_master;
DROP TABLE IF EXISTS employer_master;
DROP TABLE IF EXISTS board_master;
*/

-- =============================================================================
-- GRANT PERMISSIONS (Update with your actual username)
-- =============================================================================

-- Replace 'your_app_user' with your actual application database user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON paymentreconciliation_dev.* TO 'your_app_user'@'%';
-- FLUSH PRIVILEGES;

-- =============================================================================
-- SCRIPT COMPLETION
-- =============================================================================

SELECT 'Database schema creation completed successfully!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'paymentreconciliation_dev';
