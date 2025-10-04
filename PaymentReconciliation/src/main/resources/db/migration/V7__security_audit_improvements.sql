-- =============================================================================
-- Flyway Migration V7: Security and Audit Improvements
-- Payment Reconciliation Application
-- =============================================================================

-- Add security and audit columns for better traceability

-- =============================================================================
-- 1. ADD AUDIT COLUMNS TO MASTER TABLES
-- =============================================================================
ALTER TABLE worker_master
    ADD COLUMN created_by VARCHAR(64) DEFAULT 'SYSTEM',
    ADD COLUMN updated_by VARCHAR(64) DEFAULT 'SYSTEM',
    ADD COLUMN last_login_at DATETIME,
    ADD COLUMN failed_login_attempts INT DEFAULT 0,
    ADD COLUMN account_locked_until DATETIME;

ALTER TABLE employer_master
    ADD COLUMN created_by VARCHAR(64) DEFAULT 'SYSTEM',
    ADD COLUMN updated_by VARCHAR(64) DEFAULT 'SYSTEM',
    ADD COLUMN last_login_at DATETIME,
    ADD COLUMN failed_login_attempts INT DEFAULT 0,
    ADD COLUMN account_locked_until DATETIME;

ALTER TABLE board_master
    ADD COLUMN created_by VARCHAR(64) DEFAULT 'SYSTEM',
    ADD COLUMN updated_by VARCHAR(64) DEFAULT 'SYSTEM';

-- =============================================================================
-- 2. ADD AUDIT COLUMNS TO TRANSACTION TABLES
-- =============================================================================
ALTER TABLE worker_payments
    ADD COLUMN updated_by VARCHAR(64),
    ADD COLUMN updated_at DATETIME,
    ADD COLUMN processed_by VARCHAR(64),
    ADD COLUMN processed_at DATETIME;

ALTER TABLE worker_uploaded_data
    ADD COLUMN updated_by VARCHAR(64),
    ADD COLUMN updated_at DATETIME;

-- =============================================================================
-- 3. ADD VERSION CONTROL FOR OPTIMISTIC LOCKING
-- =============================================================================
ALTER TABLE worker_master
    ADD COLUMN version INT DEFAULT 0;

ALTER TABLE employer_master
    ADD COLUMN version INT DEFAULT 0;

ALTER TABLE worker_payments
    ADD COLUMN version INT DEFAULT 0;

-- =============================================================================
-- 4. ADD SOFT DELETE COLUMNS
-- =============================================================================
ALTER TABLE worker_master
    ADD COLUMN deleted_at DATETIME,
    ADD COLUMN deleted_by VARCHAR(64);

ALTER TABLE employer_master
    ADD COLUMN deleted_at DATETIME,
    ADD COLUMN deleted_by VARCHAR(64);

-- =============================================================================
-- 5. CREATE AUDIT LOG TABLE
-- =============================================================================
CREATE TABLE audit_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(64) NOT NULL,
    record_id BIGINT NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by VARCHAR(64) NOT NULL,
    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    INDEX idx_audit_log_table_record (table_name, record_id),
    INDEX idx_audit_log_changed_by (changed_by),
    INDEX idx_audit_log_changed_at (changed_at)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. CREATE SESSION MANAGEMENT TABLE
-- =============================================================================
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(128) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    user_type ENUM('WORKER', 'EMPLOYER', 'BOARD', 'ADMIN') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_user_sessions_user (user_id, user_type),
    INDEX idx_user_sessions_session (session_id),
    INDEX idx_user_sessions_expires (expires_at)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
