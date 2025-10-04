-- =============================================================================
-- Flyway Migration V2: Create Master Tables
-- Payment Reconciliation Application
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
