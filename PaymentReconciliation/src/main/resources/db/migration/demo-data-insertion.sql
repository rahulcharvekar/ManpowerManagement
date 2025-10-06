-- =============================================================================
-- Payment Reconciliation Application - Demo Data Insertion Script
-- Version: 1.0
-- Description: Inserts sample/demo data for testing and development
-- Note: This includes RBAC permissions, roles, and sample master data
-- =============================================================================

-- Use the database
USE paymentreconciliation_dev;

-- =============================================================================
-- RBAC SYSTEM DEFAULT DATA
-- =============================================================================

-- Insert default permissions (25 granular permissions across 5 modules)
INSERT IGNORE INTO permissions (name, description, module) VALUES
-- Worker module permissions
('READ_WORKER_DATA', 'View worker uploaded data', 'WORKER'),
('UPLOAD_WORKER_DATA', 'Upload worker data files', 'WORKER'),
('VALIDATE_WORKER_DATA', 'Validate worker data entries', 'WORKER'),
('GENERATE_WORKER_PAYMENTS', 'Generate payment requests for workers', 'WORKER'),
('DELETE_WORKER_DATA', 'Delete worker data entries', 'WORKER'),

-- Payment module permissions
('READ_PAYMENTS', 'View payment information', 'PAYMENT'),
('PROCESS_PAYMENTS', 'Process payment requests', 'PAYMENT'),
('APPROVE_PAYMENTS', 'Approve payment requests', 'PAYMENT'),
('REJECT_PAYMENTS', 'Reject payment requests', 'PAYMENT'),
('GENERATE_PAYMENT_REPORTS', 'Generate payment reports', 'PAYMENT'),

-- Employer module permissions
('READ_EMPLOYER_RECEIPTS', 'View employer payment receipts', 'EMPLOYER'),
('VALIDATE_EMPLOYER_RECEIPTS', 'Validate employer payment receipts', 'EMPLOYER'),
('SEND_TO_BOARD', 'Send receipts to board for approval', 'EMPLOYER'),

-- Board module permissions
('READ_BOARD_RECEIPTS', 'View board receipts', 'BOARD'),
('APPROVE_BOARD_RECEIPTS', 'Approve board receipts', 'BOARD'),
('REJECT_BOARD_RECEIPTS', 'Reject board receipts', 'BOARD'),
('GENERATE_BOARD_REPORTS', 'Generate board reports', 'BOARD'),

-- Reconciliation module permissions
('READ_RECONCILIATIONS', 'View reconciliation data', 'RECONCILIATION'),
('PERFORM_RECONCILIATION', 'Perform payment reconciliation', 'RECONCILIATION'),
('GENERATE_RECONCILIATION_REPORTS', 'Generate reconciliation reports', 'RECONCILIATION'),

-- System/Admin permissions
('MANAGE_USERS', 'Manage user accounts', 'SYSTEM'),
('MANAGE_ROLES', 'Manage roles and permissions', 'SYSTEM'),
('VIEW_SYSTEM_LOGS', 'View system audit logs', 'SYSTEM'),
('SYSTEM_MAINTENANCE', 'Perform system maintenance tasks', 'SYSTEM'),
('DATABASE_CLEANUP', 'Perform database cleanup operations', 'SYSTEM');

-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('RECONCILIATION_OFFICER', 'Payment Reconciliation Officer'),
('WORKER', 'Worker with access to worker-related functions'),
('EMPLOYER', 'Employer with access to employer-related functions'),
('BOARD', 'Board Member with access to board-related functions');

-- Assign all permissions to ADMIN role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

-- Assign permissions to RECONCILIATION_OFFICER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'RECONCILIATION_OFFICER'
AND p.name IN (
    'READ_WORKER_DATA', 'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS',
    'READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS', 'GENERATE_PAYMENT_REPORTS',
    'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD',
    'READ_RECONCILIATIONS', 'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS'
);

-- Assign permissions to WORKER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'WORKER'
AND p.name IN (
    'READ_WORKER_DATA', 'UPLOAD_WORKER_DATA', 'READ_PAYMENTS'
);

-- Assign permissions to EMPLOYER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYER'
AND p.name IN (
    'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD',
    'READ_PAYMENTS'
);

-- Assign permissions to BOARD role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'BOARD'
AND p.name IN (
    'READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS'
);

-- Create demo users with encrypted passwords (password: 'password')
INSERT IGNORE INTO users (username, email, password, full_name, role, is_enabled) VALUES
('admin', 'admin@paymentreconciliation.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'System Administrator', 'ADMIN', true),
('reconciliation1', 'reconciliation@paymentreconciliation.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Reconciliation Officer', 'RECONCILIATION_OFFICER', true),
('worker1', 'worker@paymentreconciliation.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Worker', 'WORKER', true),
('employer1', 'employer@paymentreconciliation.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Employer', 'EMPLOYER', true),
('board1', 'board@paymentreconciliation.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Board Member', 'BOARD', true);

-- Assign roles to users (RBAC system)
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE (u.username = 'admin' AND r.name = 'ADMIN')
   OR (u.username = 'reconciliation1' AND r.name = 'RECONCILIATION_OFFICER')
   OR (u.username = 'worker1' AND r.name = 'WORKER')
   OR (u.username = 'employer1' AND r.name = 'EMPLOYER')
   OR (u.username = 'board1' AND r.name = 'BOARD');

-- =============================================================================
-- MASTER DATA SAMPLES
-- =============================================================================

-- =============================================================================
-- DEFAULT PERMISSIONS DATA
-- =============================================================================

-- Insert default permissions
INSERT IGNORE INTO permissions (name, description, module) VALUES
-- Worker module permissions
('READ_WORKER_DATA', 'View worker uploaded data', 'WORKER'),
('UPLOAD_WORKER_DATA', 'Upload worker data files', 'WORKER'),
('VALIDATE_WORKER_DATA', 'Validate worker data entries', 'WORKER'),
('GENERATE_WORKER_PAYMENTS', 'Generate payment requests for workers', 'WORKER'),
('DELETE_WORKER_DATA', 'Delete worker data entries', 'WORKER'),

-- Payment module permissions
('READ_PAYMENTS', 'View payment information', 'PAYMENT'),
('PROCESS_PAYMENTS', 'Process payment requests', 'PAYMENT'),
('APPROVE_PAYMENTS', 'Approve payment requests', 'PAYMENT'),
('REJECT_PAYMENTS', 'Reject payment requests', 'PAYMENT'),
('GENERATE_PAYMENT_REPORTS', 'Generate payment reports', 'PAYMENT'),

-- Employer module permissions
('READ_EMPLOYER_RECEIPTS', 'View employer payment receipts', 'EMPLOYER'),
('VALIDATE_EMPLOYER_RECEIPTS', 'Validate employer payment receipts', 'EMPLOYER'),
('SEND_TO_BOARD', 'Send receipts to board for approval', 'EMPLOYER'),

-- Board module permissions
('READ_BOARD_RECEIPTS', 'View board receipts', 'BOARD'),
('APPROVE_BOARD_RECEIPTS', 'Approve board receipts', 'BOARD'),
('REJECT_BOARD_RECEIPTS', 'Reject board receipts', 'BOARD'),
('GENERATE_BOARD_REPORTS', 'Generate board reports', 'BOARD'),

-- Reconciliation module permissions
('READ_RECONCILIATIONS', 'View reconciliation data', 'RECONCILIATION'),
('PERFORM_RECONCILIATION', 'Perform payment reconciliation', 'RECONCILIATION'),
('GENERATE_RECONCILIATION_REPORTS', 'Generate reconciliation reports', 'RECONCILIATION'),

-- System/Admin permissions
('MANAGE_USERS', 'Manage user accounts', 'SYSTEM'),
('MANAGE_ROLES', 'Manage roles and permissions', 'SYSTEM'),
('VIEW_SYSTEM_LOGS', 'View system audit logs', 'SYSTEM'),
('SYSTEM_MAINTENANCE', 'Perform system maintenance tasks', 'SYSTEM'),
('DATABASE_CLEANUP', 'Perform database cleanup operations', 'SYSTEM');

-- =============================================================================
-- DEFAULT ROLES DATA
-- =============================================================================

-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('RECONCILIATION_OFFICER', 'Payment Reconciliation Officer'),
('WORKER', 'Worker with access to worker-related functions'),
('EMPLOYER', 'Employer with access to employer-related functions'),
('BOARD', 'Board Member with access to board-related functions');

-- =============================================================================
-- ROLE-PERMISSION MAPPINGS
-- =============================================================================

-- Assign permissions to ADMIN role (all permissions)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

-- Assign permissions to RECONCILIATION_OFFICER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'RECONCILIATION_OFFICER'
AND p.name IN (
    'READ_WORKER_DATA', 'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS',
    'READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS', 'GENERATE_PAYMENT_REPORTS',
    'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD',
    'READ_RECONCILIATIONS', 'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS'
);

-- Assign permissions to WORKER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'WORKER'
AND p.name IN (
    'READ_WORKER_DATA', 'UPLOAD_WORKER_DATA', 'READ_PAYMENTS'
);

-- Assign permissions to EMPLOYER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYER'
AND p.name IN (
    'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD',
    'READ_PAYMENTS'
);

-- Assign permissions to BOARD role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'BOARD'
AND p.name IN (
    'READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS'
);

-- =============================================================================
-- DEFAULT USERS DATA
-- =============================================================================

-- Create admin user (password: admin123)
INSERT IGNORE INTO users (username, email, password, full_name, role, legacy_role) VALUES 
('admin', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'System Administrator', 'ADMIN', 'ADMIN');

-- Create demo reconciliation officer (password: demo123)
INSERT IGNORE INTO users (username, email, password, full_name, role, legacy_role) VALUES 
('demo_officer', 'officer@example.com', '$2a$10$DowJonesIndex.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Reconciliation Officer', 'RECONCILIATION_OFFICER', 'RECONCILIATION_OFFICER');

-- Create demo worker (password: worker123)
INSERT IGNORE INTO users (username, email, password, full_name, role, legacy_role) VALUES 
('demo_worker', 'worker@example.com', '$2a$10$WorkerPassword.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Worker', 'WORKER', 'WORKER');

-- Create demo employer (password: employer123)
INSERT IGNORE INTO users (username, email, password, full_name, role, legacy_role) VALUES 
('demo_employer', 'employer@example.com', '$2a$10$EmployerPassword.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Employer', 'EMPLOYER', 'EMPLOYER');

-- Create demo board member (password: board123)
INSERT IGNORE INTO users (username, email, password, full_name, role, legacy_role) VALUES 
('demo_board', 'board@example.com', '$2a$10$BoardPassword.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'Demo Board Member', 'BOARD', 'BOARD');

-- =============================================================================
-- USER-ROLE MAPPINGS
-- =============================================================================

-- Migrate existing users to new role system using CONVERT for collation compatibility
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE CONVERT(u.role USING utf8mb4) COLLATE utf8mb4_unicode_ci = r.name
AND u.role IS NOT NULL;

-- Assign admin role to admin user (if not already assigned)
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN';

-- =============================================================================
-- SAMPLE MASTER DATA (Optional)
-- =============================================================================

-- Sample Board Master Data
INSERT IGNORE INTO board_master (board_id, board_name, board_code, state_name, district_name, address, contact_person, contact_email, contact_phone, status) VALUES
('BOARD001', 'Karnataka Labour Board', 'KLB001', 'Karnataka', 'Bangalore', '123 Government Complex, Bangalore', 'John Doe', 'john.doe@klb.gov.in', '+91-80-12345678', 'ACTIVE'),
('BOARD002', 'Tamil Nadu Labour Board', 'TNB001', 'Tamil Nadu', 'Chennai', '456 Secretariat, Chennai', 'Jane Smith', 'jane.smith@tnb.gov.in', '+91-44-87654321', 'ACTIVE');

-- Sample Employer Master Data
INSERT IGNORE INTO employer_master (employer_id, employer_name, employer_code, company_registration_number, pan_number, gst_number, address, contact_person, contact_email, contact_phone, status) VALUES
('EMP001', 'Tech Solutions Pvt Ltd', 'TS001', 'U72900KA2020PTC123456', 'ABCDE1234F', '29ABCDE1234F1Z5', '789 IT Park, Bangalore', 'Alice Johnson', 'alice@techsolutions.com', '+91-80-98765432', 'ACTIVE'),
('EMP002', 'Manufacturing Corp Ltd', 'MC001', 'U25200TN2019PLC234567', 'FGHIJ5678K', '33FGHIJ5678K2Y4', '321 Industrial Area, Chennai', 'Bob Wilson', 'bob@manufcorp.com', '+91-44-56789012', 'ACTIVE');

-- Sample Worker Master Data
INSERT IGNORE INTO worker_master (worker_id, worker_reference, registration_id, worker_name, father_name, date_of_birth, gender, aadhar, pan, bank_account, bank_name, ifsc_code, phone_number, email, address, emergency_contact_name, emergency_contact_phone, status) VALUES
('WKR001', 'WRF001', 'REG001', 'Rajesh Kumar', 'Suresh Kumar', '1990-05-15', 'Male', '1234567890123456', 'ABCDE1234A', '12345678901234567890', 'State Bank of India', 'SBIN0001234', '+91-98765-43210', 'rajesh@example.com', '123 Worker Street, Bangalore', 'Priya Kumar', '+91-98765-43211', 'ACTIVE'),
('WKR002', 'WRF002', 'REG002', 'Priya Sharma', 'Ram Sharma', '1988-08-22', 'Female', '2345678901234567', 'FGHIJ5678B', '23456789012345678901', 'HDFC Bank', 'HDFC0002345', '+91-87654-32109', 'priya@example.com', '456 Worker Colony, Chennai', 'Raj Sharma', '+91-87654-32108', 'ACTIVE');

-- Sample Employer-Toli Relations
INSERT IGNORE INTO employer_toli_relation (employer_id, toli_id, toli_name, toli_code, location, supervisor_name, supervisor_contact, status) VALUES
('EMP001', 'TOLI001', 'IT Development Team', 'ITD001', 'Bangalore Office Floor 3', 'Supervisor A', '+91-80-11111111', 'ACTIVE'),
('EMP001', 'TOLI002', 'QA Testing Team', 'QAT001', 'Bangalore Office Floor 4', 'Supervisor B', '+91-80-22222222', 'ACTIVE'),
('EMP002', 'TOLI003', 'Production Line 1', 'PL001', 'Chennai Factory Unit 1', 'Supervisor C', '+91-44-33333333', 'ACTIVE');

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check inserted data counts
SELECT 'RBAC Data Summary:' as info;
SELECT COUNT(*) as permission_count FROM permissions;
SELECT COUNT(*) as role_count FROM roles;
SELECT COUNT(*) as role_permission_mappings FROM role_permissions;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as user_role_mappings FROM user_roles;

SELECT 'Master Data Summary:' as info;
SELECT COUNT(*) as board_count FROM board_master;
SELECT COUNT(*) as employer_count FROM employer_master;
SELECT COUNT(*) as worker_count FROM worker_master;
SELECT COUNT(*) as toli_relation_count FROM employer_toli_relation;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

SELECT 'Demo/Default data insertion completed successfully!' as status;
