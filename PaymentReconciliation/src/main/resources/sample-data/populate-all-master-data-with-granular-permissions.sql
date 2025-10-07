-- =============================================================================
-- Comprehensive Master Data Population Script with Granular Permissions
-- Payment Reconciliation Application
-- 
-- This script populates all master tables including the new granular
-- permission system with one-to-one API endpoint mapping
-- =============================================================================

-- Set session variables for better performance
SET autocommit = 0;
SET unique_checks = 0;
SET foreign_key_checks = 0;

-- Use the database
USE paymentreconciliation_dev;

-- =============================================================================
-- EXECUTION ORDER (IMPORTANT: Follow this order due to dependencies)
-- =============================================================================

-- 1. Board Master (No dependencies)
SOURCE src/main/resources/sample-data/sample-data-board-master.sql;

-- 2. Employer Master (No dependencies)  
SOURCE src/main/resources/sample-data/sample-data-employer-master.sql;

-- 3. Worker Master (No dependencies)
SOURCE src/main/resources/sample-data/sample-data-worker-master.sql;

-- 4. Employer Toli Relation (Depends on Employer Master)
SOURCE src/main/resources/sample-data/sample-data-employer-toli-relation.sql;

-- 5. Apply granular permission system
SOURCE src/main/resources/db/migration/V13__granular_permission_api_mapping.sql;

-- =============================================================================
-- SAMPLE USER DATA WITH GRANULAR ROLE ASSIGNMENTS
-- =============================================================================

-- Create sample users with different roles for testing
INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, role, is_active, created_at) VALUES
-- Super Admin
('superadmin', 'superadmin@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super', 'Administrator', 'ADMIN', true, NOW()),

-- Specialized Role Users
('usermanager', 'usermanager@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'User', 'Manager', 'USER_MANAGER', true, NOW()),
('workeroperator', 'workeroperator@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Worker Data', 'Operator', 'WORKER_DATA_OPERATOR', true, NOW()),
('paymentprocessor', 'paymentprocessor@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Payment', 'Processor', 'PAYMENT_PROCESSOR', true, NOW()),
('employercoord', 'employercoord@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Employer', 'Coordinator', 'EMPLOYER_COORDINATOR', true, NOW()),
('boardapprover', 'boardapprover@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Board', 'Approver', 'BOARD_APPROVER', true, NOW()),
('reconspecialist', 'reconspecialist@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Reconciliation', 'Specialist', 'RECONCILIATION_SPECIALIST', true, NOW()),
('sysadmin', 'sysadmin@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', 'Administrator', 'SYSTEM_ADMIN', true, NOW()),
('auditor', 'auditor@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', 'Auditor', 'AUDITOR', true, NOW()),
('readonly', 'readonly@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Read Only', 'User', 'READONLY_USER', true, NOW()),

-- Department-specific users
('mumbai.worker', 'mumbai.worker@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Mumbai', 'Worker Officer', 'WORKER', true, NOW()),
('delhi.worker', 'delhi.worker@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Delhi', 'Worker Officer', 'WORKER', true, NOW()),
('bangalore.employer', 'bangalore.employer@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Bangalore', 'Employer Officer', 'EMPLOYER', true, NOW()),
('chennai.board', 'chennai.board@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Chennai', 'Board Member', 'BOARD', true, NOW()),
('pune.reconciliation', 'pune.reconciliation@company.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Pune', 'Reconciliation Officer', 'RECONCILIATION_OFFICER', true, NOW());

-- Assign users to new granular roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE (u.username = 'superadmin' AND r.name = 'SUPER_ADMIN')
   OR (u.username = 'usermanager' AND r.name = 'USER_MANAGER')
   OR (u.username = 'workeroperator' AND r.name = 'WORKER_DATA_OPERATOR')
   OR (u.username = 'paymentprocessor' AND r.name = 'PAYMENT_PROCESSOR')
   OR (u.username = 'employercoord' AND r.name = 'EMPLOYER_COORDINATOR')
   OR (u.username = 'boardapprover' AND r.name = 'BOARD_APPROVER')
   OR (u.username = 'reconspecialist' AND r.name = 'RECONCILIATION_SPECIALIST')
   OR (u.username = 'sysadmin' AND r.name = 'SYSTEM_ADMINISTRATOR')
   OR (u.username = 'auditor' AND r.name = 'AUDITOR')
   OR (u.username = 'readonly' AND r.name = 'READONLY_USER')
   -- Legacy role mappings for backward compatibility
   OR (u.role = 'WORKER' AND r.name = 'WORKER_DATA_OPERATOR')
   OR (u.role = 'EMPLOYER' AND r.name = 'EMPLOYER_COORDINATOR')
   OR (u.role = 'BOARD' AND r.name = 'BOARD_APPROVER')
   OR (u.role = 'RECONCILIATION_OFFICER' AND r.name = 'RECONCILIATION_SPECIALIST')
   OR (u.role = 'ADMIN' AND r.name = 'SUPER_ADMIN');

-- =============================================================================
-- SAMPLE TRANSACTION DATA FOR TESTING
-- =============================================================================

-- Sample Worker Payment Data
INSERT IGNORE INTO worker_payments (
    employer_id, worker_id, toli_id, month_year, amount, status, 
    payment_date, created_by, created_at
) VALUES
-- Mumbai region payments
(101, 1001, 'TOLI_MH_001', '2024-09', 15000.00, 'PENDING', NULL, 1, '2024-09-15 10:00:00'),
(101, 1002, 'TOLI_MH_001', '2024-09', 16500.00, 'APPROVED', '2024-09-20 14:30:00', 1, '2024-09-15 10:05:00'),
(102, 1003, 'TOLI_MH_002', '2024-09', 14000.00, 'PROCESSED', '2024-09-22 11:15:00', 1, '2024-09-16 09:30:00'),

-- Delhi region payments
(103, 1004, 'TOLI_DL_001', '2024-09', 17000.00, 'PENDING', NULL, 2, '2024-09-17 11:20:00'),
(103, 1005, 'TOLI_DL_001', '2024-09', 15500.00, 'REJECTED', NULL, 2, '2024-09-17 11:25:00'),

-- Karnataka region payments
(104, 1006, 'TOLI_KA_001', '2024-09', 18000.00, 'APPROVED', '2024-09-25 16:45:00', 3, '2024-09-18 14:10:00'),
(105, 1007, 'TOLI_KA_002', '2024-09', 16000.00, 'PROCESSED', '2024-09-26 10:30:00', 3, '2024-09-19 08:45:00');

-- Sample Employer Receipts
INSERT IGNORE INTO employer_receipts (
    employer_id, receipt_number, amount, receipt_date, status, 
    validation_status, created_by, created_at
) VALUES
(101, 'EMP_REC_2024_001', 450000.00, '2024-09-28', 'SUBMITTED', 'VALIDATED', 1, '2024-09-28 15:20:00'),
(102, 'EMP_REC_2024_002', 320000.00, '2024-09-29', 'UNDER_REVIEW', 'PENDING', 1, '2024-09-29 09:15:00'),
(103, 'EMP_REC_2024_003', 280000.00, '2024-09-30', 'SENT_TO_BOARD', 'VALIDATED', 2, '2024-09-30 11:30:00'),
(104, 'EMP_REC_2024_004', 520000.00, '2024-10-01', 'APPROVED', 'VALIDATED', 3, '2024-10-01 14:45:00'),
(105, 'EMP_REC_2024_005', 380000.00, '2024-10-02', 'SUBMITTED', 'VALIDATING', 3, '2024-10-02 10:10:00');

-- Sample Board Receipts
INSERT IGNORE INTO board_receipts (
    employer_receipt_id, board_id, receipt_number, amount, submission_date, 
    status, approved_by, approved_date, created_at
) VALUES
(3, 1, 'BRD_REC_2024_001', 280000.00, '2024-09-30', 'UNDER_REVIEW', NULL, NULL, '2024-09-30 12:00:00'),
(4, 2, 'BRD_REC_2024_002', 520000.00, '2024-10-01', 'APPROVED', 5, '2024-10-03 16:30:00', '2024-10-01 15:00:00');

-- Sample Reconciliation Records
INSERT IGNORE INTO reconciliations (
    reconciliation_date, total_payments, total_receipts, difference_amount, 
    status, reconciled_by, created_at
) VALUES
('2024-09-30', 987500.00, 950000.00, 37500.00, 'COMPLETED', 4, '2024-10-01 09:00:00'),
('2024-10-01', 1250000.00, 1200000.00, 50000.00, 'IN_PROGRESS', 4, '2024-10-02 08:30:00'),
('2024-10-02', 856000.00, 856000.00, 0.00, 'COMPLETED', 4, '2024-10-03 10:15:00');

-- =============================================================================
-- SAMPLE PERMISSION-BASED ACCESS CONTROL DATA
-- =============================================================================

-- Sample Component Permissions (if using component-based UI)
INSERT IGNORE INTO component_permissions (component_name, permission_required, description) VALUES
-- Dashboard Components
('AdminDashboard', 'VIEW_ADMIN_DASHBOARD', 'Admin dashboard access'),
('UserDashboard', 'VIEW_USER_DASHBOARD', 'User dashboard access'),
('PaymentAnalytics', 'VIEW_PAYMENT_ANALYTICS', 'Payment analytics component'),
('ReconciliationAnalytics', 'VIEW_RECONCILIATION_ANALYTICS', 'Reconciliation analytics component'),

-- Worker Management Components
('WorkerPaymentsList', 'LIST_WORKER_PAYMENTS', 'Worker payments list component'),
('WorkerPaymentDetails', 'GET_WORKER_PAYMENT_DETAILS', 'Worker payment details component'),
('WorkerFileUpload', 'UPLOAD_WORKER_FILE', 'Worker file upload component'),
('WorkerPaymentApproval', 'APPROVE_WORKER_PAYMENT', 'Worker payment approval component'),

-- Payment Processing Components
('PaymentQueue', 'LIST_PAYMENT_QUEUE', 'Payment processing queue component'),
('PaymentProcessor', 'PROCESS_PAYMENT', 'Payment processing component'),
('BulkPaymentActions', 'BULK_APPROVE_PAYMENTS', 'Bulk payment actions component'),

-- User Management Components
('UserList', 'LIST_ALL_USERS', 'User management list component'),
('UserDetails', 'GET_USER_DETAILS', 'User details component'),
('UserCreation', 'CREATE_NEW_USER', 'User creation component'),
('RoleManagement', 'LIST_ALL_ROLES', 'Role management component'),

-- System Administration Components
('SystemLogs', 'VIEW_SYSTEM_LOGS', 'System logs component'),
('SystemConfig', 'GET_SYSTEM_CONFIG', 'System configuration component'),
('DatabaseMaintenance', 'PERFORM_DATABASE_CLEANUP', 'Database maintenance component'),

-- Audit Components
('AuditTrail', 'VIEW_AUDIT_TRAIL', 'Audit trail component'),
('ComplianceReports', 'GENERATE_COMPLIANCE_REPORT', 'Compliance reports component');

-- =============================================================================
-- FINAL VERIFICATION AND COMPREHENSIVE SUMMARY
-- =============================================================================

-- Re-enable checks
SET foreign_key_checks = 1;
SET unique_checks = 1;
SET autocommit = 1;

-- =============================================================================
-- COMPREHENSIVE MASTER DATA SUMMARY
-- =============================================================================
SELECT '==================== MASTER DATA POPULATION SUMMARY ====================' as summary;

SELECT 'Core Master Data Records' as section, '' as subsection, '' as details
UNION ALL
SELECT '', 'Board Master Records', CAST(COUNT(*) as CHAR) FROM board_master
UNION ALL
SELECT '', 'Employer Master Records', CAST(COUNT(*) as CHAR) FROM employer_master  
UNION ALL
SELECT '', 'Worker Master Records', CAST(COUNT(*) as CHAR) FROM worker_master
UNION ALL
SELECT '', 'Employer Toli Relations', CAST(COUNT(*) as CHAR) FROM employer_toli_relation
UNION ALL
SELECT '', '', ''
UNION ALL
SELECT 'Permission System Data', '', ''
UNION ALL
SELECT '', 'Total Permissions', CAST(COUNT(*) as CHAR) FROM permissions
UNION ALL
SELECT '', 'Total Roles', CAST(COUNT(*) as CHAR) FROM roles
UNION ALL
SELECT '', 'Total Users', CAST(COUNT(*) as CHAR) FROM users
UNION ALL
SELECT '', 'Permission-API Mappings', CAST(COUNT(*) as CHAR) FROM permission_api_endpoints
UNION ALL
SELECT '', 'Role-Permission Assignments', CAST(COUNT(*) as CHAR) FROM role_permissions
UNION ALL
SELECT '', 'User-Role Assignments', CAST(COUNT(*) as CHAR) FROM user_roles
UNION ALL
SELECT '', '', ''
UNION ALL
SELECT 'Sample Transaction Data', '', ''
UNION ALL
SELECT '', 'Worker Payments', CAST(COUNT(*) as CHAR) FROM worker_payments
UNION ALL
SELECT '', 'Employer Receipts', CAST(COUNT(*) as CHAR) FROM employer_receipts
UNION ALL
SELECT '', 'Board Receipts', CAST(COUNT(*) as CHAR) FROM board_receipts
UNION ALL
SELECT '', 'Reconciliation Records', CAST(COUNT(*) as CHAR) FROM reconciliations;

-- =============================================================================
-- PERMISSION SYSTEM DETAILED ANALYSIS
-- =============================================================================
SELECT '================== PERMISSION SYSTEM ANALYSIS =================' as analysis;

-- Permissions by Module
SELECT 'Permissions by Module:' as info, '' as module_name, '' as permission_count
UNION ALL
SELECT '', module, CAST(COUNT(*) as CHAR)
FROM permissions 
GROUP BY module 
ORDER BY COUNT(*) DESC;

SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT 'Role Permission Distribution:', '', ''
UNION ALL
SELECT '', r.name, CAST(COUNT(rp.permission_id) as CHAR)
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY COUNT(rp.permission_id) DESC;

-- =============================================================================
-- USER ACCESS VERIFICATION
-- =============================================================================
SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT 'User Role Assignments:', '', ''
UNION ALL
SELECT '', CONCAT(u.username, ' (', u.first_name, ' ', u.last_name, ')'), r.name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.username;

-- =============================================================================
-- SAMPLE DATA VERIFICATION QUERIES
-- =============================================================================
SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT 'Sample Data Distribution:', '', '';

-- Worker payments by status
SELECT 'Worker Payments by Status:' as info, '' as status, '' as count
UNION ALL
SELECT '', status, CAST(COUNT(*) as CHAR)
FROM worker_payments 
GROUP BY status;

SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT 'Employer Receipts by Status:', '', ''
UNION ALL
SELECT '', status, CAST(COUNT(*) as CHAR)
FROM employer_receipts 
GROUP BY status;

SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT 'Board Receipts by Status:', '', ''
UNION ALL
SELECT '', status, CAST(COUNT(*) as CHAR)
FROM board_receipts 
GROUP BY status;

-- =============================================================================
-- API ENDPOINT VERIFICATION
-- =============================================================================
SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT 'API Endpoint Mapping Verification:', '', '';

-- Check for one-to-one mapping
SELECT 'Permissions without API endpoints:' as check_type, '' as details, CAST(COUNT(*) as CHAR) as count
FROM permissions p
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE pae.id IS NULL

UNION ALL

SELECT 'API endpoints without permissions:', '', CAST(COUNT(*) as CHAR)
FROM permission_api_endpoints pae
LEFT JOIN permissions p ON pae.permission_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 'Duplicate API endpoint mappings:' , '', CAST(COUNT(*) as CHAR)
FROM (
    SELECT api_endpoint, http_method, COUNT(*) as dup_count
    FROM permission_api_endpoints
    GROUP BY api_endpoint, http_method
    HAVING COUNT(*) > 1
) duplicates;

-- =============================================================================
-- TESTING RECOMMENDATIONS
-- =============================================================================
SELECT '' as spacer, '' as col2, '' as col3
UNION ALL
SELECT '============== TESTING RECOMMENDATIONS =============' as recommendations, '', ''
UNION ALL
SELECT '1. Login with different users to test role-based access:', '', ''
UNION ALL
SELECT '   - superadmin@company.com (SUPER_ADMIN)', '', ''
UNION ALL
SELECT '   - workeroperator@company.com (WORKER_DATA_OPERATOR)', '', ''
UNION ALL
SELECT '   - paymentprocessor@company.com (PAYMENT_PROCESSOR)', '', ''
UNION ALL
SELECT '   - readonly@company.com (READONLY_USER)', '', ''
UNION ALL
SELECT '', '', ''
UNION ALL
SELECT '2. Test API endpoints with proper permissions:', '', ''
UNION ALL
SELECT '   - Each API should require specific permission', '', ''
UNION ALL
SELECT '   - Verify 403 Forbidden for unauthorized access', '', ''
UNION ALL
SELECT '', '', ''
UNION ALL
SELECT '3. Sample data available for testing:', '', ''
UNION ALL
SELECT '   - Worker payments in various statuses', '', ''
UNION ALL
SELECT '   - Employer receipts for validation workflow', '', ''
UNION ALL
SELECT '   - Board receipts for approval workflow', '', ''
UNION ALL
SELECT '   - Reconciliation records for testing', '', ''
UNION ALL
SELECT '', '', ''
UNION ALL
SELECT 'Default password for all test users: password123', '', '';

-- Show sample of permission-API mappings for verification
SELECT '=============== SAMPLE PERMISSION-API MAPPINGS ===============' as sample_mappings;

SELECT 
    p.module as 'Module',
    p.name as 'Permission Name',
    CONCAT(pae.http_method, ' ', pae.api_endpoint) as 'API Endpoint',
    pae.description as 'Description'
FROM permissions p
JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE p.module IN ('AUTH', 'USER_MANAGEMENT', 'WORKER', 'PAYMENT', 'SYSTEM')
ORDER BY p.module, p.name
LIMIT 25;
