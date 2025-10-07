-- =============================================================================
-- V13: Granular Permission-API Mapping with One-to-One Relationship
-- This migration creates fine-grained permissions with exact API endpoint mapping
-- Each permission corresponds to exactly one API endpoint + HTTP method combination
-- =============================================================================

-- Clean up old broad permissions and create granular ones
DELETE FROM role_permissions WHERE permission_id IN (
    SELECT id FROM permissions WHERE name IN (
        'MANAGE_USERS', 'MANAGE_ROLES', 'READ_WORKER_DATA', 'UPLOAD_WORKER_DATA',
        'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS', 'DELETE_WORKER_DATA',
        'READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS',
        'GENERATE_PAYMENT_REPORTS', 'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS',
        'SEND_TO_BOARD', 'READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 
        'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS', 'READ_RECONCILIATIONS',
        'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS', 'VIEW_SYSTEM_LOGS',
        'SYSTEM_MAINTENANCE', 'DATABASE_CLEANUP'
    )
);

DELETE FROM permissions WHERE name IN (
    'MANAGE_USERS', 'MANAGE_ROLES', 'READ_WORKER_DATA', 'UPLOAD_WORKER_DATA',
    'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS', 'DELETE_WORKER_DATA',
    'READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS',
    'GENERATE_PAYMENT_REPORTS', 'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS',
    'SEND_TO_BOARD', 'READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 
    'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS', 'READ_RECONCILIATIONS',
    'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS', 'VIEW_SYSTEM_LOGS',
    'SYSTEM_MAINTENANCE', 'DATABASE_CLEANUP'
);

-- Insert granular permissions with one-to-one API mapping
INSERT INTO permissions (name, description, module) VALUES
-- =============================================================================
-- AUTHENTICATION & USER MANAGEMENT MODULE
-- =============================================================================
('LOGIN_USER', 'Allow user to login to the system', 'AUTH'),
('LOGOUT_USER', 'Allow user to logout from the system', 'AUTH'),
('REFRESH_TOKEN', 'Allow user to refresh authentication token', 'AUTH'),
('GET_PROFILE', 'Allow user to view their own profile', 'AUTH'),
('UPDATE_PROFILE', 'Allow user to update their own profile', 'AUTH'),
('CHANGE_PASSWORD', 'Allow user to change their own password', 'AUTH'),

-- User Management (Admin functions)
('LIST_ALL_USERS', 'View list of all system users', 'USER_MANAGEMENT'),
('GET_USER_DETAILS', 'View specific user details', 'USER_MANAGEMENT'),
('CREATE_NEW_USER', 'Create new user account', 'USER_MANAGEMENT'),
('UPDATE_USER_INFO', 'Update user information', 'USER_MANAGEMENT'),
('DELETE_USER_ACCOUNT', 'Delete user account', 'USER_MANAGEMENT'),
('ACTIVATE_USER', 'Activate user account', 'USER_MANAGEMENT'),
('DEACTIVATE_USER', 'Deactivate user account', 'USER_MANAGEMENT'),
('RESET_USER_PASSWORD', 'Reset user password', 'USER_MANAGEMENT'),

-- Role Management
('LIST_ALL_ROLES', 'View list of all roles', 'ROLE_MANAGEMENT'),
('GET_ROLE_DETAILS', 'View specific role details', 'ROLE_MANAGEMENT'),
('CREATE_NEW_ROLE', 'Create new role', 'ROLE_MANAGEMENT'),
('UPDATE_ROLE_INFO', 'Update role information', 'ROLE_MANAGEMENT'),
('DELETE_ROLE', 'Delete role', 'ROLE_MANAGEMENT'),
('ASSIGN_ROLE_TO_USER', 'Assign role to user', 'ROLE_MANAGEMENT'),
('REMOVE_ROLE_FROM_USER', 'Remove role from user', 'ROLE_MANAGEMENT'),

-- Permission Management
('LIST_ALL_PERMISSIONS', 'View list of all permissions', 'PERMISSION_MANAGEMENT'),
('GET_PERMISSION_DETAILS', 'View specific permission details', 'PERMISSION_MANAGEMENT'),
('CREATE_NEW_PERMISSION', 'Create new permission', 'PERMISSION_MANAGEMENT'),
('UPDATE_PERMISSION_INFO', 'Update permission information', 'PERMISSION_MANAGEMENT'),
('DELETE_PERMISSION', 'Delete permission', 'PERMISSION_MANAGEMENT'),
('ASSIGN_PERMISSION_TO_ROLE', 'Assign permission to role', 'PERMISSION_MANAGEMENT'),
('REMOVE_PERMISSION_FROM_ROLE', 'Remove permission from role', 'PERMISSION_MANAGEMENT'),

-- =============================================================================
-- WORKER DATA MODULE
-- =============================================================================
('LIST_WORKER_PAYMENTS', 'View list of worker payments', 'WORKER'),
('GET_WORKER_PAYMENT_DETAILS', 'View specific worker payment details', 'WORKER'),
('CREATE_WORKER_PAYMENT', 'Create new worker payment record', 'WORKER'),
('UPDATE_WORKER_PAYMENT', 'Update worker payment information', 'WORKER'),
('DELETE_WORKER_PAYMENT', 'Delete worker payment record', 'WORKER'),

-- Worker Data File Management
('LIST_UPLOADED_FILES', 'View list of uploaded worker data files', 'WORKER'),
('GET_FILE_SUMMARY', 'View uploaded file summary', 'WORKER'),
('UPLOAD_WORKER_FILE', 'Upload worker data file', 'WORKER'),
('VALIDATE_WORKER_FILE', 'Validate uploaded worker file', 'WORKER'),
('DELETE_UPLOADED_FILE', 'Delete uploaded worker data file', 'WORKER'),
('DOWNLOAD_WORKER_FILE', 'Download worker data file', 'WORKER'),

-- Worker Payment Processing
('GENERATE_WORKER_PAYMENT_BATCH', 'Generate batch of worker payments', 'WORKER'),
('APPROVE_WORKER_PAYMENT', 'Approve specific worker payment', 'WORKER'),
('REJECT_WORKER_PAYMENT', 'Reject specific worker payment', 'WORKER'),
('BULK_APPROVE_WORKER_PAYMENTS', 'Bulk approve worker payments', 'WORKER'),
('BULK_REJECT_WORKER_PAYMENTS', 'Bulk reject worker payments', 'WORKER'),

-- Worker Reports
('GENERATE_WORKER_PAYMENT_REPORT', 'Generate worker payment reports', 'WORKER'),
('EXPORT_WORKER_PAYMENT_DATA', 'Export worker payment data', 'WORKER'),

-- =============================================================================
-- PAYMENT PROCESSING MODULE
-- =============================================================================
('LIST_PAYMENT_QUEUE', 'View payment processing queue', 'PAYMENT'),
('GET_PAYMENT_STATUS', 'View specific payment status', 'PAYMENT'),
('PROCESS_PAYMENT', 'Process individual payment', 'PAYMENT'),
('BATCH_PROCESS_PAYMENTS', 'Process multiple payments in batch', 'PAYMENT'),
('RETRY_FAILED_PAYMENT', 'Retry failed payment processing', 'PAYMENT'),
('CANCEL_PAYMENT', 'Cancel payment processing', 'PAYMENT'),

-- Payment Approval Workflow
('APPROVE_PAYMENT_REQUEST', 'Approve payment request', 'PAYMENT'),
('REJECT_PAYMENT_REQUEST', 'Reject payment request', 'PAYMENT'),
('BULK_APPROVE_PAYMENTS', 'Bulk approve payment requests', 'PAYMENT'),
('BULK_REJECT_PAYMENTS', 'Bulk reject payment requests', 'PAYMENT'),

-- Payment Reports and Analytics
('GENERATE_PAYMENT_SUMMARY_REPORT', 'Generate payment summary report', 'PAYMENT'),
('GENERATE_PAYMENT_DETAIL_REPORT', 'Generate detailed payment report', 'PAYMENT'),
('EXPORT_PAYMENT_DATA', 'Export payment processing data', 'PAYMENT'),
('VIEW_PAYMENT_ANALYTICS', 'View payment processing analytics', 'PAYMENT'),

-- =============================================================================
-- EMPLOYER RECEIPT MODULE
-- =============================================================================
('LIST_EMPLOYER_RECEIPTS', 'View list of employer receipts', 'EMPLOYER'),
('GET_EMPLOYER_RECEIPT_DETAILS', 'View specific employer receipt details', 'EMPLOYER'),
('CREATE_EMPLOYER_RECEIPT', 'Create new employer receipt record', 'EMPLOYER'),
('UPDATE_EMPLOYER_RECEIPT', 'Update employer receipt information', 'EMPLOYER'),
('DELETE_EMPLOYER_RECEIPT', 'Delete employer receipt record', 'EMPLOYER'),

-- Employer Receipt Processing
('VALIDATE_EMPLOYER_RECEIPT', 'Validate employer receipt data', 'EMPLOYER'),
('APPROVE_EMPLOYER_RECEIPT', 'Approve employer receipt', 'EMPLOYER'),
('REJECT_EMPLOYER_RECEIPT', 'Reject employer receipt', 'EMPLOYER'),
('SEND_RECEIPT_TO_BOARD', 'Send employer receipt to board for approval', 'EMPLOYER'),

-- Employer Receipt Reports
('GENERATE_EMPLOYER_RECEIPT_REPORT', 'Generate employer receipt reports', 'EMPLOYER'),
('EXPORT_EMPLOYER_RECEIPT_DATA', 'Export employer receipt data', 'EMPLOYER'),

-- =============================================================================
-- BOARD RECEIPT MODULE
-- =============================================================================
('LIST_BOARD_RECEIPTS', 'View list of board receipts', 'BOARD'),
('GET_BOARD_RECEIPT_DETAILS', 'View specific board receipt details', 'BOARD'),
('CREATE_BOARD_RECEIPT', 'Create new board receipt record', 'BOARD'),
('UPDATE_BOARD_RECEIPT', 'Update board receipt information', 'BOARD'),
('DELETE_BOARD_RECEIPT', 'Delete board receipt record', 'BOARD'),

-- Board Receipt Processing
('APPROVE_BOARD_RECEIPT', 'Approve board receipt', 'BOARD'),
('REJECT_BOARD_RECEIPT', 'Reject board receipt', 'BOARD'),
('BULK_APPROVE_BOARD_RECEIPTS', 'Bulk approve board receipts', 'BOARD'),
('BULK_REJECT_BOARD_RECEIPTS', 'Bulk reject board receipts', 'BOARD'),
('RETURN_RECEIPT_TO_EMPLOYER', 'Return receipt to employer for correction', 'BOARD'),

-- Board Receipt Reports
('GENERATE_BOARD_RECEIPT_REPORT', 'Generate board receipt reports', 'BOARD'),
('EXPORT_BOARD_RECEIPT_DATA', 'Export board receipt data', 'BOARD'),
('VIEW_BOARD_ANALYTICS', 'View board receipt analytics', 'BOARD'),

-- =============================================================================
-- RECONCILIATION MODULE
-- =============================================================================
('LIST_RECONCILIATIONS', 'View list of reconciliation records', 'RECONCILIATION'),
('GET_RECONCILIATION_DETAILS', 'View specific reconciliation details', 'RECONCILIATION'),
('CREATE_RECONCILIATION', 'Create new reconciliation record', 'RECONCILIATION'),
('UPDATE_RECONCILIATION', 'Update reconciliation information', 'RECONCILIATION'),
('DELETE_RECONCILIATION', 'Delete reconciliation record', 'RECONCILIATION'),

-- Reconciliation Processing
('PERFORM_AUTO_RECONCILIATION', 'Perform automatic reconciliation', 'RECONCILIATION'),
('PERFORM_MANUAL_RECONCILIATION', 'Perform manual reconciliation', 'RECONCILIATION'),
('VALIDATE_RECONCILIATION', 'Validate reconciliation results', 'RECONCILIATION'),
('APPROVE_RECONCILIATION', 'Approve reconciliation results', 'RECONCILIATION'),
('REJECT_RECONCILIATION', 'Reject reconciliation results', 'RECONCILIATION'),

-- Reconciliation Reports
('GENERATE_RECONCILIATION_SUMMARY', 'Generate reconciliation summary report', 'RECONCILIATION'),
('GENERATE_RECONCILIATION_DETAIL', 'Generate detailed reconciliation report', 'RECONCILIATION'),
('EXPORT_RECONCILIATION_DATA', 'Export reconciliation data', 'RECONCILIATION'),
('VIEW_RECONCILIATION_ANALYTICS', 'View reconciliation analytics', 'RECONCILIATION'),

-- Bank Statement Processing
('UPLOAD_BANK_STATEMENT', 'Upload bank statement file', 'RECONCILIATION'),
('PARSE_BANK_STATEMENT', 'Parse uploaded bank statement', 'RECONCILIATION'),
('VALIDATE_BANK_STATEMENT', 'Validate bank statement data', 'RECONCILIATION'),

-- =============================================================================
-- SYSTEM ADMINISTRATION MODULE
-- =============================================================================
('VIEW_SYSTEM_INFO', 'View system information and health', 'SYSTEM'),
('VIEW_SYSTEM_LOGS', 'View system logs and audit trails', 'SYSTEM'),
('VIEW_ERROR_LOGS', 'View system error logs', 'SYSTEM'),
('DOWNLOAD_SYSTEM_LOGS', 'Download system log files', 'SYSTEM'),

-- System Configuration
('GET_SYSTEM_CONFIG', 'View system configuration', 'SYSTEM'),
('UPDATE_SYSTEM_CONFIG', 'Update system configuration', 'SYSTEM'),
('RESET_SYSTEM_CONFIG', 'Reset system configuration to defaults', 'SYSTEM'),

-- Database Management
('PERFORM_DATABASE_BACKUP', 'Perform database backup', 'SYSTEM'),
('PERFORM_DATABASE_CLEANUP', 'Perform database cleanup operations', 'SYSTEM'),
('VIEW_DATABASE_STATS', 'View database statistics', 'SYSTEM'),
('OPTIMIZE_DATABASE', 'Optimize database performance', 'SYSTEM'),

-- System Maintenance
('CLEAR_CACHE', 'Clear system cache', 'SYSTEM'),
('RESTART_SERVICES', 'Restart system services', 'SYSTEM'),
('VIEW_SYSTEM_METRICS', 'View system performance metrics', 'SYSTEM'),
('EXPORT_SYSTEM_REPORT', 'Export comprehensive system report', 'SYSTEM'),

-- File Management
('LIST_UPLOADED_FILES_ADMIN', 'View all uploaded files (admin)', 'SYSTEM'),
('DELETE_ANY_FILE', 'Delete any uploaded file (admin)', 'SYSTEM'),
('DOWNLOAD_ANY_FILE', 'Download any uploaded file (admin)', 'SYSTEM'),

-- =============================================================================
-- NOTIFICATION MODULE
-- =============================================================================
('SEND_USER_NOTIFICATION', 'Send notification to specific user', 'NOTIFICATION'),
('SEND_BULK_NOTIFICATION', 'Send bulk notifications', 'NOTIFICATION'),
('VIEW_NOTIFICATION_HISTORY', 'View notification history', 'NOTIFICATION'),
('CONFIGURE_NOTIFICATION_SETTINGS', 'Configure notification settings', 'NOTIFICATION'),

-- =============================================================================
-- DASHBOARD AND ANALYTICS MODULE
-- =============================================================================
('VIEW_ADMIN_DASHBOARD', 'View administrative dashboard', 'DASHBOARD'),
('VIEW_USER_DASHBOARD', 'View user-specific dashboard', 'DASHBOARD'),
('VIEW_PAYMENT_ANALYTICS', 'View payment processing analytics', 'DASHBOARD'),
('VIEW_RECONCILIATION_ANALYTICS', 'View reconciliation analytics', 'DASHBOARD'),
('EXPORT_DASHBOARD_DATA', 'Export dashboard data', 'DASHBOARD'),

-- =============================================================================
-- AUDIT AND COMPLIANCE MODULE
-- =============================================================================
('VIEW_AUDIT_TRAIL', 'View system audit trail', 'AUDIT'),
('EXPORT_AUDIT_DATA', 'Export audit data for compliance', 'AUDIT'),
('GENERATE_COMPLIANCE_REPORT', 'Generate compliance reports', 'AUDIT'),
('VIEW_USER_ACTIVITY', 'View user activity logs', 'AUDIT');

-- Now insert the API endpoint mappings with one-to-one relationship
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) 
SELECT p.id, mapping.api_endpoint, mapping.http_method, mapping.description
FROM permissions p
JOIN (
    -- =============================================================================
    -- AUTHENTICATION & USER MANAGEMENT API MAPPINGS
    -- =============================================================================
    SELECT 'LOGIN_USER' as permission_name, '/api/auth/login' as api_endpoint, 'POST' as http_method, 'User login endpoint' as description
    UNION ALL SELECT 'LOGOUT_USER', '/api/auth/logout', 'POST', 'User logout endpoint'
    UNION ALL SELECT 'REFRESH_TOKEN', '/api/auth/refresh', 'POST', 'Refresh authentication token'
    UNION ALL SELECT 'GET_PROFILE', '/api/auth/profile', 'GET', 'Get user profile'
    UNION ALL SELECT 'UPDATE_PROFILE', '/api/auth/profile', 'PUT', 'Update user profile'
    UNION ALL SELECT 'CHANGE_PASSWORD', '/api/auth/change-password', 'POST', 'Change user password'
    
    -- User Management APIs
    UNION ALL SELECT 'LIST_ALL_USERS', '/api/admin/users', 'GET', 'Get all users list'
    UNION ALL SELECT 'GET_USER_DETAILS', '/api/admin/users/{id}', 'GET', 'Get specific user details'
    UNION ALL SELECT 'CREATE_NEW_USER', '/api/admin/users', 'POST', 'Create new user'
    UNION ALL SELECT 'UPDATE_USER_INFO', '/api/admin/users/{id}', 'PUT', 'Update user information'
    UNION ALL SELECT 'DELETE_USER_ACCOUNT', '/api/admin/users/{id}', 'DELETE', 'Delete user account'
    UNION ALL SELECT 'ACTIVATE_USER', '/api/admin/users/{id}/activate', 'POST', 'Activate user account'
    UNION ALL SELECT 'DEACTIVATE_USER', '/api/admin/users/{id}/deactivate', 'POST', 'Deactivate user account'
    UNION ALL SELECT 'RESET_USER_PASSWORD', '/api/admin/users/{id}/reset-password', 'POST', 'Reset user password'
    
    -- Role Management APIs
    UNION ALL SELECT 'LIST_ALL_ROLES', '/api/admin/roles', 'GET', 'Get all roles list'
    UNION ALL SELECT 'GET_ROLE_DETAILS', '/api/admin/roles/{id}', 'GET', 'Get specific role details'
    UNION ALL SELECT 'CREATE_NEW_ROLE', '/api/admin/roles', 'POST', 'Create new role'
    UNION ALL SELECT 'UPDATE_ROLE_INFO', '/api/admin/roles/{id}', 'PUT', 'Update role information'
    UNION ALL SELECT 'DELETE_ROLE', '/api/admin/roles/{id}', 'DELETE', 'Delete role'
    UNION ALL SELECT 'ASSIGN_ROLE_TO_USER', '/api/admin/users/{userId}/roles/{roleId}', 'POST', 'Assign role to user'
    UNION ALL SELECT 'REMOVE_ROLE_FROM_USER', '/api/admin/users/{userId}/roles/{roleId}', 'DELETE', 'Remove role from user'
    
    -- Permission Management APIs
    UNION ALL SELECT 'LIST_ALL_PERMISSIONS', '/api/admin/permissions', 'GET', 'Get all permissions list'
    UNION ALL SELECT 'GET_PERMISSION_DETAILS', '/api/admin/permissions/{id}', 'GET', 'Get specific permission details'
    UNION ALL SELECT 'CREATE_NEW_PERMISSION', '/api/admin/permissions', 'POST', 'Create new permission'
    UNION ALL SELECT 'UPDATE_PERMISSION_INFO', '/api/admin/permissions/{id}', 'PUT', 'Update permission information'
    UNION ALL SELECT 'DELETE_PERMISSION', '/api/admin/permissions/{id}', 'DELETE', 'Delete permission'
    UNION ALL SELECT 'ASSIGN_PERMISSION_TO_ROLE', '/api/admin/roles/{roleId}/permissions/{permissionId}', 'POST', 'Assign permission to role'
    UNION ALL SELECT 'REMOVE_PERMISSION_FROM_ROLE', '/api/admin/roles/{roleId}/permissions/{permissionId}', 'DELETE', 'Remove permission from role'
    
    -- =============================================================================
    -- WORKER DATA MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'LIST_WORKER_PAYMENTS', '/api/v1/worker-payments', 'GET', 'Get worker payments list'
    UNION ALL SELECT 'GET_WORKER_PAYMENT_DETAILS', '/api/v1/worker-payments/{id}', 'GET', 'Get specific worker payment'
    UNION ALL SELECT 'CREATE_WORKER_PAYMENT', '/api/v1/worker-payments', 'POST', 'Create worker payment record'
    UNION ALL SELECT 'UPDATE_WORKER_PAYMENT', '/api/v1/worker-payments/{id}', 'PUT', 'Update worker payment'
    UNION ALL SELECT 'DELETE_WORKER_PAYMENT', '/api/v1/worker-payments/{id}', 'DELETE', 'Delete worker payment'
    
    -- Worker File Management APIs
    UNION ALL SELECT 'LIST_UPLOADED_FILES', '/api/worker/uploaded-data/files', 'GET', 'Get uploaded files list'
    UNION ALL SELECT 'GET_FILE_SUMMARY', '/api/worker/uploaded-data/files/{id}/summary', 'GET', 'Get file summary'
    UNION ALL SELECT 'UPLOAD_WORKER_FILE', '/api/worker/uploaded-data/upload', 'POST', 'Upload worker data file'
    UNION ALL SELECT 'VALIDATE_WORKER_FILE', '/api/worker/uploaded-data/files/{id}/validate', 'POST', 'Validate worker file'
    UNION ALL SELECT 'DELETE_UPLOADED_FILE', '/api/worker/uploaded-data/files/{id}', 'DELETE', 'Delete uploaded file'
    UNION ALL SELECT 'DOWNLOAD_WORKER_FILE', '/api/worker/uploaded-data/files/{id}/download', 'GET', 'Download worker file'
    
    -- Worker Payment Processing APIs
    UNION ALL SELECT 'GENERATE_WORKER_PAYMENT_BATCH', '/api/v1/worker-payments/generate-batch', 'POST', 'Generate payment batch'
    UNION ALL SELECT 'APPROVE_WORKER_PAYMENT', '/api/v1/worker-payments/{id}/approve', 'POST', 'Approve worker payment'
    UNION ALL SELECT 'REJECT_WORKER_PAYMENT', '/api/v1/worker-payments/{id}/reject', 'POST', 'Reject worker payment'
    UNION ALL SELECT 'BULK_APPROVE_WORKER_PAYMENTS', '/api/v1/worker-payments/bulk-approve', 'POST', 'Bulk approve worker payments'
    UNION ALL SELECT 'BULK_REJECT_WORKER_PAYMENTS', '/api/v1/worker-payments/bulk-reject', 'POST', 'Bulk reject worker payments'
    
    -- Worker Reports APIs
    UNION ALL SELECT 'GENERATE_WORKER_PAYMENT_REPORT', '/api/v1/worker-payments/reports', 'GET', 'Generate worker payment report'
    UNION ALL SELECT 'EXPORT_WORKER_PAYMENT_DATA', '/api/v1/worker-payments/export', 'GET', 'Export worker payment data'
    
    -- =============================================================================
    -- PAYMENT PROCESSING MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'LIST_PAYMENT_QUEUE', '/api/payment-processing/queue', 'GET', 'Get payment processing queue'
    UNION ALL SELECT 'GET_PAYMENT_STATUS', '/api/payment-processing/{id}/status', 'GET', 'Get payment status'
    UNION ALL SELECT 'PROCESS_PAYMENT', '/api/payment-processing/{id}/process', 'POST', 'Process individual payment'
    UNION ALL SELECT 'BATCH_PROCESS_PAYMENTS', '/api/payment-processing/batch-process', 'POST', 'Batch process payments'
    UNION ALL SELECT 'RETRY_FAILED_PAYMENT', '/api/payment-processing/{id}/retry', 'POST', 'Retry failed payment'
    UNION ALL SELECT 'CANCEL_PAYMENT', '/api/payment-processing/{id}/cancel', 'POST', 'Cancel payment processing'
    
    -- Payment Approval APIs
    UNION ALL SELECT 'APPROVE_PAYMENT_REQUEST', '/api/payment-processing/{id}/approve', 'POST', 'Approve payment request'
    UNION ALL SELECT 'REJECT_PAYMENT_REQUEST', '/api/payment-processing/{id}/reject', 'POST', 'Reject payment request'
    UNION ALL SELECT 'BULK_APPROVE_PAYMENTS', '/api/payment-processing/bulk-approve', 'POST', 'Bulk approve payments'
    UNION ALL SELECT 'BULK_REJECT_PAYMENTS', '/api/payment-processing/bulk-reject', 'POST', 'Bulk reject payments'
    
    -- Payment Reports APIs
    UNION ALL SELECT 'GENERATE_PAYMENT_SUMMARY_REPORT', '/api/payment-processing/reports/summary', 'GET', 'Generate payment summary report'
    UNION ALL SELECT 'GENERATE_PAYMENT_DETAIL_REPORT', '/api/payment-processing/reports/detailed', 'GET', 'Generate detailed payment report'
    UNION ALL SELECT 'EXPORT_PAYMENT_DATA', '/api/payment-processing/export', 'GET', 'Export payment data'
    UNION ALL SELECT 'VIEW_PAYMENT_ANALYTICS', '/api/payment-processing/analytics', 'GET', 'View payment analytics'
    
    -- =============================================================================
    -- EMPLOYER RECEIPT MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'LIST_EMPLOYER_RECEIPTS', '/api/employer/receipts', 'GET', 'Get employer receipts list'
    UNION ALL SELECT 'GET_EMPLOYER_RECEIPT_DETAILS', '/api/employer/receipts/{id}', 'GET', 'Get employer receipt details'
    UNION ALL SELECT 'CREATE_EMPLOYER_RECEIPT', '/api/employer/receipts', 'POST', 'Create employer receipt'
    UNION ALL SELECT 'UPDATE_EMPLOYER_RECEIPT', '/api/employer/receipts/{id}', 'PUT', 'Update employer receipt'
    UNION ALL SELECT 'DELETE_EMPLOYER_RECEIPT', '/api/employer/receipts/{id}', 'DELETE', 'Delete employer receipt'
    
    -- Employer Receipt Processing APIs
    UNION ALL SELECT 'VALIDATE_EMPLOYER_RECEIPT', '/api/employer/receipts/{id}/validate', 'POST', 'Validate employer receipt'
    UNION ALL SELECT 'APPROVE_EMPLOYER_RECEIPT', '/api/employer/receipts/{id}/approve', 'POST', 'Approve employer receipt'
    UNION ALL SELECT 'REJECT_EMPLOYER_RECEIPT', '/api/employer/receipts/{id}/reject', 'POST', 'Reject employer receipt'
    UNION ALL SELECT 'SEND_RECEIPT_TO_BOARD', '/api/employer/receipts/{id}/send-to-board', 'POST', 'Send receipt to board'
    
    -- Employer Receipt Reports APIs
    UNION ALL SELECT 'GENERATE_EMPLOYER_RECEIPT_REPORT', '/api/employer/receipts/reports', 'GET', 'Generate employer receipt report'
    UNION ALL SELECT 'EXPORT_EMPLOYER_RECEIPT_DATA', '/api/employer/receipts/export', 'GET', 'Export employer receipt data'
    
    -- =============================================================================
    -- BOARD RECEIPT MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'LIST_BOARD_RECEIPTS', '/api/v1/board-receipts', 'GET', 'Get board receipts list'
    UNION ALL SELECT 'GET_BOARD_RECEIPT_DETAILS', '/api/v1/board-receipts/{id}', 'GET', 'Get board receipt details'
    UNION ALL SELECT 'CREATE_BOARD_RECEIPT', '/api/v1/board-receipts', 'POST', 'Create board receipt'
    UNION ALL SELECT 'UPDATE_BOARD_RECEIPT', '/api/v1/board-receipts/{id}', 'PUT', 'Update board receipt'
    UNION ALL SELECT 'DELETE_BOARD_RECEIPT', '/api/v1/board-receipts/{id}', 'DELETE', 'Delete board receipt'
    
    -- Board Receipt Processing APIs
    UNION ALL SELECT 'APPROVE_BOARD_RECEIPT', '/api/v1/board-receipts/{id}/approve', 'POST', 'Approve board receipt'
    UNION ALL SELECT 'REJECT_BOARD_RECEIPT', '/api/v1/board-receipts/{id}/reject', 'POST', 'Reject board receipt'
    UNION ALL SELECT 'BULK_APPROVE_BOARD_RECEIPTS', '/api/v1/board-receipts/bulk-approve', 'POST', 'Bulk approve board receipts'
    UNION ALL SELECT 'BULK_REJECT_BOARD_RECEIPTS', '/api/v1/board-receipts/bulk-reject', 'POST', 'Bulk reject board receipts'
    UNION ALL SELECT 'RETURN_RECEIPT_TO_EMPLOYER', '/api/v1/board-receipts/{id}/return-to-employer', 'POST', 'Return receipt to employer'
    
    -- Board Receipt Reports APIs
    UNION ALL SELECT 'GENERATE_BOARD_RECEIPT_REPORT', '/api/v1/board-receipts/reports', 'GET', 'Generate board receipt report'
    UNION ALL SELECT 'EXPORT_BOARD_RECEIPT_DATA', '/api/v1/board-receipts/export', 'GET', 'Export board receipt data'
    UNION ALL SELECT 'VIEW_BOARD_ANALYTICS', '/api/v1/board-receipts/analytics', 'GET', 'View board analytics'
    
    -- =============================================================================
    -- RECONCILIATION MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'LIST_RECONCILIATIONS', '/api/v1/reconciliations', 'GET', 'Get reconciliations list'
    UNION ALL SELECT 'GET_RECONCILIATION_DETAILS', '/api/v1/reconciliations/{id}', 'GET', 'Get reconciliation details'
    UNION ALL SELECT 'CREATE_RECONCILIATION', '/api/v1/reconciliations', 'POST', 'Create reconciliation'
    UNION ALL SELECT 'UPDATE_RECONCILIATION', '/api/v1/reconciliations/{id}', 'PUT', 'Update reconciliation'
    UNION ALL SELECT 'DELETE_RECONCILIATION', '/api/v1/reconciliations/{id}', 'DELETE', 'Delete reconciliation'
    
    -- Reconciliation Processing APIs
    UNION ALL SELECT 'PERFORM_AUTO_RECONCILIATION', '/api/v1/reconciliations/auto-reconcile', 'POST', 'Perform auto reconciliation'
    UNION ALL SELECT 'PERFORM_MANUAL_RECONCILIATION', '/api/v1/reconciliations/manual-reconcile', 'POST', 'Perform manual reconciliation'
    UNION ALL SELECT 'VALIDATE_RECONCILIATION', '/api/v1/reconciliations/{id}/validate', 'POST', 'Validate reconciliation'
    UNION ALL SELECT 'APPROVE_RECONCILIATION', '/api/v1/reconciliations/{id}/approve', 'POST', 'Approve reconciliation'
    UNION ALL SELECT 'REJECT_RECONCILIATION', '/api/v1/reconciliations/{id}/reject', 'POST', 'Reject reconciliation'
    
    -- Reconciliation Reports APIs
    UNION ALL SELECT 'GENERATE_RECONCILIATION_SUMMARY', '/api/v1/reconciliations/reports/summary', 'GET', 'Generate reconciliation summary'
    UNION ALL SELECT 'GENERATE_RECONCILIATION_DETAIL', '/api/v1/reconciliations/reports/detailed', 'GET', 'Generate detailed reconciliation report'
    UNION ALL SELECT 'EXPORT_RECONCILIATION_DATA', '/api/v1/reconciliations/export', 'GET', 'Export reconciliation data'
    UNION ALL SELECT 'VIEW_RECONCILIATION_ANALYTICS', '/api/v1/reconciliations/analytics', 'GET', 'View reconciliation analytics'
    
    -- Bank Statement APIs
    UNION ALL SELECT 'UPLOAD_BANK_STATEMENT', '/api/v1/reconciliations/bank-statements/upload', 'POST', 'Upload bank statement'
    UNION ALL SELECT 'PARSE_BANK_STATEMENT', '/api/v1/reconciliations/bank-statements/{id}/parse', 'POST', 'Parse bank statement'
    UNION ALL SELECT 'VALIDATE_BANK_STATEMENT', '/api/v1/reconciliations/bank-statements/{id}/validate', 'POST', 'Validate bank statement'
    
    -- =============================================================================
    -- SYSTEM ADMINISTRATION MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'VIEW_SYSTEM_INFO', '/api/system/info', 'GET', 'Get system information'
    UNION ALL SELECT 'VIEW_SYSTEM_LOGS', '/api/system/logs', 'GET', 'Get system logs'
    UNION ALL SELECT 'VIEW_ERROR_LOGS', '/api/system/logs/errors', 'GET', 'Get error logs'
    UNION ALL SELECT 'DOWNLOAD_SYSTEM_LOGS', '/api/system/logs/download', 'GET', 'Download system logs'
    
    -- System Configuration APIs
    UNION ALL SELECT 'GET_SYSTEM_CONFIG', '/api/system/config', 'GET', 'Get system configuration'
    UNION ALL SELECT 'UPDATE_SYSTEM_CONFIG', '/api/system/config', 'PUT', 'Update system configuration'
    UNION ALL SELECT 'RESET_SYSTEM_CONFIG', '/api/system/config/reset', 'POST', 'Reset system configuration'
    
    -- Database Management APIs
    UNION ALL SELECT 'PERFORM_DATABASE_BACKUP', '/api/system/database/backup', 'POST', 'Perform database backup'
    UNION ALL SELECT 'PERFORM_DATABASE_CLEANUP', '/api/system/database/cleanup', 'POST', 'Perform database cleanup'
    UNION ALL SELECT 'VIEW_DATABASE_STATS', '/api/system/database/stats', 'GET', 'View database statistics'
    UNION ALL SELECT 'OPTIMIZE_DATABASE', '/api/system/database/optimize', 'POST', 'Optimize database'
    
    -- System Maintenance APIs
    UNION ALL SELECT 'CLEAR_CACHE', '/api/system/cache/clear', 'POST', 'Clear system cache'
    UNION ALL SELECT 'RESTART_SERVICES', '/api/system/services/restart', 'POST', 'Restart system services'
    UNION ALL SELECT 'VIEW_SYSTEM_METRICS', '/api/system/metrics', 'GET', 'View system metrics'
    UNION ALL SELECT 'EXPORT_SYSTEM_REPORT', '/api/system/reports/export', 'GET', 'Export system report'
    
    -- File Management APIs
    UNION ALL SELECT 'LIST_UPLOADED_FILES_ADMIN', '/api/admin/files', 'GET', 'List all uploaded files'
    UNION ALL SELECT 'DELETE_ANY_FILE', '/api/admin/files/{id}', 'DELETE', 'Delete any file'
    UNION ALL SELECT 'DOWNLOAD_ANY_FILE', '/api/admin/files/{id}/download', 'GET', 'Download any file'
    
    -- =============================================================================
    -- NOTIFICATION MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'SEND_USER_NOTIFICATION', '/api/notifications/send', 'POST', 'Send user notification'
    UNION ALL SELECT 'SEND_BULK_NOTIFICATION', '/api/notifications/bulk-send', 'POST', 'Send bulk notifications'
    UNION ALL SELECT 'VIEW_NOTIFICATION_HISTORY', '/api/notifications/history', 'GET', 'View notification history'
    UNION ALL SELECT 'CONFIGURE_NOTIFICATION_SETTINGS', '/api/notifications/settings', 'PUT', 'Configure notification settings'
    
    -- =============================================================================
    -- DASHBOARD AND ANALYTICS MODULE API MAPPINGS
    -- =============================================================================
    UNION ALL SELECT 'VIEW_ADMIN_DASHBOARD', '/api/dashboard/admin', 'GET', 'View admin dashboard'
    UNION ALL SELECT 'VIEW_USER_DASHBOARD', '/api/dashboard/user', 'GET', 'View user dashboard'
    UNION ALL SELECT 'VIEW_PAYMENT_ANALYTICS', '/api/dashboard/analytics/payments', 'GET', 'View payment analytics'
    UNION ALL SELECT 'VIEW_RECONCILIATION_ANALYTICS', '/api/dashboard/analytics/reconciliation', 'GET', 'View reconciliation analytics'
    UNION ALL SELECT 'EXPORT_DASHBOARD_DATA', '/api/dashboard/export', 'GET', 'Export dashboard data'
    
    -- =============================================================================
    -- AUDIT AND COMPLIANCE MODULE API MAPPINGS  
    -- =============================================================================
    UNION ALL SELECT 'VIEW_AUDIT_TRAIL', '/api/audit/trail', 'GET', 'View audit trail'
    UNION ALL SELECT 'EXPORT_AUDIT_DATA', '/api/audit/export', 'GET', 'Export audit data'
    UNION ALL SELECT 'GENERATE_COMPLIANCE_REPORT', '/api/audit/compliance-report', 'GET', 'Generate compliance report'
    UNION ALL SELECT 'VIEW_USER_ACTIVITY', '/api/audit/user-activity', 'GET', 'View user activity logs'
    
) as mapping ON p.name = mapping.permission_name;

-- =============================================================================
-- CREATE COMPREHENSIVE ROLE ASSIGNMENTS
-- =============================================================================

-- Clear existing role permissions
DELETE FROM role_permissions;

-- SUPER_ADMIN Role - All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

-- Create more specific roles
INSERT IGNORE INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Super Administrator with all system permissions'),
('USER_MANAGER', 'User and Role Management Administrator'),
('WORKER_DATA_OPERATOR', 'Worker Data Management Operator'),
('PAYMENT_PROCESSOR', 'Payment Processing Specialist'),
('EMPLOYER_COORDINATOR', 'Employer Receipt Coordinator'),
('BOARD_APPROVER', 'Board Receipt Approver'),
('RECONCILIATION_SPECIALIST', 'Reconciliation Operations Specialist'),
('SYSTEM_ADMINISTRATOR', 'System Configuration and Maintenance Administrator'),
('AUDITOR', 'System Auditor and Compliance Officer'),
('READONLY_USER', 'Read-only access to basic information');

-- SUPER_ADMIN - All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN';

-- USER_MANAGER - User, Role, and Permission management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'PERMISSION_MANAGEMENT', 'AUTH')
WHERE r.name = 'USER_MANAGER';

-- WORKER_DATA_OPERATOR - Worker data management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('WORKER', 'AUTH', 'DASHBOARD')
WHERE r.name = 'WORKER_DATA_OPERATOR'
AND p.name NOT LIKE '%DELETE%'
AND p.name NOT LIKE '%BULK_%';

-- PAYMENT_PROCESSOR - Payment processing operations
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('PAYMENT', 'AUTH', 'DASHBOARD')
WHERE r.name = 'PAYMENT_PROCESSOR';

-- EMPLOYER_COORDINATOR - Employer receipt management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('EMPLOYER', 'AUTH', 'DASHBOARD')
WHERE r.name = 'EMPLOYER_COORDINATOR';

-- BOARD_APPROVER - Board receipt approval
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('BOARD', 'AUTH', 'DASHBOARD')
WHERE r.name = 'BOARD_APPROVER';

-- RECONCILIATION_SPECIALIST - Reconciliation operations
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('RECONCILIATION', 'AUTH', 'DASHBOARD')
WHERE r.name = 'RECONCILIATION_SPECIALIST';

-- SYSTEM_ADMINISTRATOR - System administration
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('SYSTEM', 'NOTIFICATION', 'AUTH')
WHERE r.name = 'SYSTEM_ADMINISTRATOR';

-- AUDITOR - Audit and compliance
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.module IN ('AUDIT', 'AUTH', 'DASHBOARD')
   OR p.name LIKE '%VIEW_%'
   OR p.name LIKE '%GET_%'
   OR p.name LIKE '%LIST_%'
WHERE r.name = 'AUDITOR'
AND p.name NOT LIKE '%DELETE%'
AND p.name NOT LIKE '%CREATE%'
AND p.name NOT LIKE '%UPDATE%';

-- READONLY_USER - Basic read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON (
    p.name IN ('GET_PROFILE', 'UPDATE_PROFILE', 'CHANGE_PASSWORD', 'VIEW_USER_DASHBOARD')
    OR (p.module = 'DASHBOARD' AND p.name LIKE '%VIEW_%')
)
WHERE r.name = 'READONLY_USER';

-- =============================================================================
-- VERIFICATION AND SUMMARY QUERIES
-- =============================================================================

-- Summary of permissions by module
SELECT 
    module,
    COUNT(*) as permission_count
FROM permissions 
GROUP BY module 
ORDER BY permission_count DESC;

-- Summary of role assignments
SELECT 
    r.name as role_name,
    r.description,
    COUNT(rp.permission_id) as assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.description
ORDER BY assigned_permissions DESC;

-- Verify one-to-one mapping between permissions and API endpoints
SELECT 
    'Permissions without API endpoints' as check_type,
    COUNT(*) as count
FROM permissions p
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE pae.id IS NULL

UNION ALL

SELECT 
    'API endpoints without permissions' as check_type,
    COUNT(*) as count
FROM permission_api_endpoints pae
LEFT JOIN permissions p ON pae.permission_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 
    'Total permissions' as check_type,
    COUNT(*) as count
FROM permissions

UNION ALL

SELECT 
    'Total API endpoint mappings' as check_type,
    COUNT(*) as count
FROM permission_api_endpoints;

-- Show sample permission-API mappings for verification
SELECT 
    p.module,
    p.name as permission_name,
    pae.api_endpoint,
    pae.http_method,
    pae.description
FROM permissions p
JOIN permission_api_endpoints pae ON p.id = pae.permission_id
ORDER BY p.module, p.name
LIMIT 20;
