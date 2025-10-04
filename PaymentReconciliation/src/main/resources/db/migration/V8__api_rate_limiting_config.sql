-- =============================================================================
-- Flyway Migration V8: API Rate Limiting and System Configuration
-- Payment Reconciliation Application
-- =============================================================================

-- Add tables for API rate limiting and system configuration

-- =============================================================================
-- 1. API RATE LIMITING TABLE
-- =============================================================================
CREATE TABLE api_rate_limits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_type ENUM('WORKER', 'EMPLOYER', 'BOARD', 'ADMIN') NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    request_count INT DEFAULT 0,
    window_start DATETIME NOT NULL,
    window_end DATETIME NOT NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_rate_limit_user_endpoint (user_id, user_type, endpoint, window_start),
    INDEX idx_rate_limits_user (user_id, user_type),
    INDEX idx_rate_limits_window (window_start, window_end),
    INDEX idx_rate_limits_blocked (is_blocked, blocked_until)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. SYSTEM CONFIGURATION TABLE
-- =============================================================================
CREATE TABLE system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type ENUM('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_system_config_key (config_key),
    INDEX idx_system_config_active (is_active)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. INSERT DEFAULT SYSTEM CONFIGURATIONS
-- =============================================================================
INSERT INTO system_config (config_key, config_value, config_type, description, created_by) VALUES
('MAX_FILE_UPLOAD_SIZE_MB', '50', 'INTEGER', 'Maximum file upload size in MB', 'SYSTEM'),
('MAX_RECORDS_PER_FILE', '5000', 'INTEGER', 'Maximum records allowed per uploaded file', 'SYSTEM'),
('API_RATE_LIMIT_PER_MINUTE', '100', 'INTEGER', 'Maximum API requests per minute per user', 'SYSTEM'),
('SESSION_TIMEOUT_HOURS', '8', 'INTEGER', 'User session timeout in hours', 'SYSTEM'),
('PASSWORD_MIN_LENGTH', '8', 'INTEGER', 'Minimum password length', 'SYSTEM'),
('MAX_LOGIN_ATTEMPTS', '5', 'INTEGER', 'Maximum failed login attempts before account lock', 'SYSTEM'),
('ACCOUNT_LOCK_DURATION_MINUTES', '30', 'INTEGER', 'Account lock duration in minutes after max failed attempts', 'SYSTEM'),
('ENABLE_EMAIL_NOTIFICATIONS', 'true', 'BOOLEAN', 'Enable email notifications for important events', 'SYSTEM'),
('ENABLE_SMS_NOTIFICATIONS', 'false', 'BOOLEAN', 'Enable SMS notifications for important events', 'SYSTEM'),
('MAINTENANCE_MODE', 'false', 'BOOLEAN', 'Enable maintenance mode to block user access', 'SYSTEM');

-- =============================================================================
-- 4. FILE PROCESSING QUEUE TABLE
-- =============================================================================
CREATE TABLE file_processing_queue (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_id VARCHAR(100) NOT NULL,
    uploaded_file_id BIGINT,
    processing_status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
    priority INT DEFAULT 5, -- 1 = highest, 10 = lowest
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    error_message TEXT,
    processing_started_at DATETIME,
    processing_completed_at DATETIME,
    processed_by VARCHAR(64),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_file_queue_status (processing_status),
    INDEX idx_file_queue_priority (priority, created_at),
    INDEX idx_file_queue_file (file_id),
    FOREIGN KEY (uploaded_file_id) REFERENCES uploaded_files(id)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. NOTIFICATION TEMPLATES TABLE
-- =============================================================================
CREATE TABLE notification_templates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    template_name VARCHAR(200) NOT NULL,
    template_type ENUM('EMAIL', 'SMS', 'SYSTEM') NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(64),
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_notification_templates_key (template_key),
    INDEX idx_notification_templates_type (template_type),
    INDEX idx_notification_templates_active (is_active)
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. INSERT DEFAULT NOTIFICATION TEMPLATES
-- =============================================================================
INSERT INTO notification_templates (template_key, template_name, template_type, subject_template, body_template, created_by) VALUES
('WORKER_PAYMENT_PROCESSED', 'Worker Payment Processed', 'EMAIL', 
 'Payment Processed - {{workerName}}',
 'Dear {{workerName}},\n\nYour payment of ₹{{amount}} has been processed successfully.\n\nTransaction Reference: {{transactionRef}}\nDate: {{processedDate}}\n\nThank you.',
 'SYSTEM'),
('EMPLOYER_RECEIPT_VALIDATED', 'Employer Receipt Validated', 'EMAIL',
 'Receipt Validated - {{receiptNumber}}',
 'Dear {{employerName}},\n\nYour receipt {{receiptNumber}} has been validated successfully.\n\nAmount: ₹{{amount}}\nValidated Date: {{validatedDate}}\n\nThank you.',
 'SYSTEM'),
('FILE_PROCESSING_COMPLETED', 'File Processing Completed', 'SYSTEM',
 'File Processing Status',
 'File {{fileName}} processing completed.\nTotal Records: {{totalRecords}}\nSuccess: {{successCount}}\nFailures: {{failureCount}}',
 'SYSTEM'),
('ACCOUNT_LOCKED', 'Account Locked', 'EMAIL',
 'Account Security Alert',
 'Dear User,\n\nYour account has been locked due to multiple failed login attempts.\nIt will be unlocked after {{lockDuration}} minutes.\n\nIf this was not you, please contact support.',
 'SYSTEM');
