-- =============================================================================
-- DEPRECATED - Comprehensive Permission API Endpoints Data
-- This file has been superseded by V13__granular_permission_api_mapping.sql
-- 
-- NEW APPROACH: One-to-one relationship between permissions and API endpoints
-- Each permission now corresponds to exactly one API endpoint + HTTP method
-- 
-- Please use the new granular permission system instead of this file
-- =============================================================================

-- WARNING: This approach is DEPRECATED
-- The old broad permissions have been replaced with granular permissions
-- 
-- OLD APPROACH (DEPRECATED):
-- - 'MANAGE_USERS' covered multiple user management operations
-- - 'READ_WORKER_DATA' covered multiple read operations
-- - Multiple API endpoints mapped to single permission
--
-- NEW APPROACH (RECOMMENDED):
-- - 'LIST_ALL_USERS' → GET /api/admin/users
-- - 'CREATE_NEW_USER' → POST /api/admin/users  
-- - 'UPDATE_USER_INFO' → PUT /api/admin/users/{id}
-- - Each permission maps to exactly one API endpoint
--
-- Migration: Run V13__granular_permission_api_mapping.sql instead

-- For reference only - these permissions are no longer used:
-- 
-- OLD BROAD PERMISSIONS (DEPRECATED):
-- ('READ_WORKER_DATA', 'Can read worker payment data and file summaries', 'WORKER'),
-- ('UPLOAD_WORKER_DATA', 'Can upload worker data files', 'WORKER'),
-- ('VALIDATE_WORKER_DATA', 'Can validate uploaded worker data files', 'WORKER'),
-- ('GENERATE_WORKER_PAYMENTS', 'Can generate worker payment records', 'WORKER'),
-- ('DELETE_WORKER_DATA', 'Can delete worker payment data and uploaded files', 'WORKER'),
-- ('READ_PAYMENTS', 'Can read payment data and processing status', 'PAYMENT'),
-- ('PROCESS_PAYMENTS', 'Can process payment transactions', 'PAYMENT'),
-- ('APPROVE_PAYMENTS', 'Can approve payment transactions', 'PAYMENT'),
-- ('REJECT_PAYMENTS', 'Can reject payment transactions', 'PAYMENT'),
-- ('GENERATE_PAYMENT_REPORTS', 'Can generate payment reports and analytics', 'PAYMENT'),
-- ('READ_EMPLOYER_RECEIPTS', 'Can read employer receipt data', 'EMPLOYER'),
-- ('VALIDATE_EMPLOYER_RECEIPTS', 'Can validate employer receipts', 'EMPLOYER'),
-- ('SEND_TO_BOARD', 'Can send employer receipts to board for approval', 'EMPLOYER'),
-- ('READ_BOARD_RECEIPTS', 'Can read board receipt data', 'BOARD'),
-- ('APPROVE_BOARD_RECEIPTS', 'Can approve board receipts', 'BOARD'),
-- ('REJECT_BOARD_RECEIPTS', 'Can reject board receipts', 'BOARD'),
-- ('GENERATE_BOARD_REPORTS', 'Can generate board reports and analytics', 'BOARD'),
-- ('READ_RECONCILIATIONS', 'Can read reconciliation data and status', 'RECONCILIATION'),
-- ('PERFORM_RECONCILIATION', 'Can perform reconciliation operations', 'RECONCILIATION'),
-- ('GENERATE_RECONCILIATION_REPORTS', 'Can generate reconciliation reports and exports', 'RECONCILIATION'),
-- ('MANAGE_USERS', 'Can manage system users and user accounts', 'SYSTEM'),
-- ('MANAGE_ROLES', 'Can manage roles, permissions and role assignments', 'SYSTEM'),
-- ('VIEW_SYSTEM_LOGS', 'Can view system logs and debug information', 'SYSTEM'),
-- ('SYSTEM_MAINTENANCE', 'Can perform system maintenance operations', 'SYSTEM'),
-- ('DATABASE_CLEANUP', 'Can perform database cleanup operations', 'SYSTEM');

-- MIGRATION INSTRUCTIONS:
-- 1. Use V13__granular_permission_api_mapping.sql for new installations
-- 2. For existing systems, run the migration script to update permissions
-- 3. Update your application code to use the new granular permissions
-- 4. Refer to GRANULAR_PERMISSION_SYSTEM_GUIDE.md for complete documentation

-- Now insert the API endpoint mappings
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) 
SELECT p.id, endpoint.api_endpoint, endpoint.http_method, endpoint.description
FROM permissions p
CROSS JOIN (
    -- =========================================================================
    -- WORKER MODULE ENDPOINTS
    -- =========================================================================
    
    -- READ_WORKER_DATA endpoints
    SELECT 'READ_WORKER_DATA' as permission_name, '/api/v1/worker-payments' as api_endpoint, 'GET' as http_method, 'Get worker payments list' as description
    UNION ALL
    SELECT 'READ_WORKER_DATA', '/api/worker/uploaded-data/files/summaries', 'GET', 'Get uploaded file summaries'
    
    -- UPLOAD_WORKER_DATA endpoints
    UNION ALL
    SELECT 'UPLOAD_WORKER_DATA', '/api/worker/uploaded-data/upload', 'POST', 'Upload worker data files'
    
    -- VALIDATE_WORKER_DATA endpoints
    UNION ALL
    SELECT 'VALIDATE_WORKER_DATA', '/api/worker/uploaded-data/file/{fileId}/validate', 'POST', 'Validate specific uploaded file'
    
    -- GENERATE_WORKER_PAYMENTS endpoints
    UNION ALL
    SELECT 'GENERATE_WORKER_PAYMENTS', '/api/v1/worker-payments', 'POST', 'Generate worker payment records'
    
    -- DELETE_WORKER_DATA endpoints
    UNION ALL
    SELECT 'DELETE_WORKER_DATA', '/api/v1/worker-payments/{id}', 'DELETE', 'Delete specific worker payment'
    UNION ALL
    SELECT 'DELETE_WORKER_DATA', '/api/worker/uploaded-data/{id}', 'DELETE', 'Delete uploaded worker data file'
    
    -- =========================================================================
    -- PAYMENT MODULE ENDPOINTS
    -- =========================================================================
    
    -- READ_PAYMENTS endpoints
    UNION ALL
    SELECT 'READ_PAYMENTS', '/api/v1/worker-payments', 'GET', 'Get worker payments for processing'
    UNION ALL
    SELECT 'READ_PAYMENTS', '/api/payment-processing', 'GET', 'Get payment processing status'
    
    -- PROCESS_PAYMENTS endpoints
    UNION ALL
    SELECT 'PROCESS_PAYMENTS', '/api/payment-processing/process', 'POST', 'Process payment transactions'
    
    -- APPROVE_PAYMENTS endpoints
    UNION ALL
    SELECT 'APPROVE_PAYMENTS', '/api/payment-processing/{id}/approve', 'POST', 'Approve payment in processing queue'
    UNION ALL
    SELECT 'APPROVE_PAYMENTS', '/api/v1/worker-payments/{id}/approve', 'POST', 'Approve specific worker payment'
    
    -- REJECT_PAYMENTS endpoints
    UNION ALL
    SELECT 'REJECT_PAYMENTS', '/api/payment-processing/{id}/reject', 'POST', 'Reject payment in processing queue'
    UNION ALL
    SELECT 'REJECT_PAYMENTS', '/api/v1/worker-payments/{id}/reject', 'POST', 'Reject specific worker payment'
    
    -- GENERATE_PAYMENT_REPORTS endpoints
    UNION ALL
    SELECT 'GENERATE_PAYMENT_REPORTS', '/api/v1/worker-payments/reports', 'GET', 'Generate worker payment reports'
    UNION ALL
    SELECT 'GENERATE_PAYMENT_REPORTS', '/api/payment-processing/reports', 'GET', 'Generate payment processing reports'
    
    -- =========================================================================
    -- EMPLOYER MODULE ENDPOINTS
    -- =========================================================================
    
    -- READ_EMPLOYER_RECEIPTS endpoints
    UNION ALL
    SELECT 'READ_EMPLOYER_RECEIPTS', '/api/employer/receipts', 'GET', 'Get employer receipt data'
    
    -- VALIDATE_EMPLOYER_RECEIPTS endpoints
    UNION ALL
    SELECT 'VALIDATE_EMPLOYER_RECEIPTS', '/api/employer/receipts/{id}/validate', 'POST', 'Validate specific employer receipt'
    
    -- SEND_TO_BOARD endpoints
    UNION ALL
    SELECT 'SEND_TO_BOARD', '/api/employer/receipts/{id}/send-to-board', 'POST', 'Send employer receipt to board for approval'
    
    -- =========================================================================
    -- BOARD MODULE ENDPOINTS
    -- =========================================================================
    
    -- READ_BOARD_RECEIPTS endpoints
    UNION ALL
    SELECT 'READ_BOARD_RECEIPTS', '/api/v1/board-receipts', 'GET', 'Get board receipt data'
    
    -- APPROVE_BOARD_RECEIPTS endpoints
    UNION ALL
    SELECT 'APPROVE_BOARD_RECEIPTS', '/api/v1/board-receipts/{id}/approve', 'POST', 'Approve specific board receipt'
    
    -- REJECT_BOARD_RECEIPTS endpoints
    UNION ALL
    SELECT 'REJECT_BOARD_RECEIPTS', '/api/v1/board-receipts/{id}/reject', 'POST', 'Reject specific board receipt'
    
    -- GENERATE_BOARD_REPORTS endpoints
    UNION ALL
    SELECT 'GENERATE_BOARD_REPORTS', '/api/v1/board-receipts/reports', 'GET', 'Generate board receipt reports'
    
    -- =========================================================================
    -- RECONCILIATION MODULE ENDPOINTS
    -- =========================================================================
    
    -- READ_RECONCILIATIONS endpoints
    UNION ALL
    SELECT 'READ_RECONCILIATIONS', '/api/v1/reconciliations', 'GET', 'Get reconciliation data and status'
    
    -- PERFORM_RECONCILIATION endpoints
    UNION ALL
    SELECT 'PERFORM_RECONCILIATION', '/api/v1/reconciliations/perform', 'POST', 'Perform reconciliation operations'
    
    -- GENERATE_RECONCILIATION_REPORTS endpoints
    UNION ALL
    SELECT 'GENERATE_RECONCILIATION_REPORTS', '/api/v1/reconciliations/export', 'GET', 'Export reconciliation data'
    UNION ALL
    SELECT 'GENERATE_RECONCILIATION_REPORTS', '/api/v1/reconciliations/reports', 'GET', 'Generate reconciliation reports'
    
    -- =========================================================================
    -- SYSTEM MODULE ENDPOINTS
    -- =========================================================================
    
    -- MANAGE_USERS endpoints
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users', 'GET', 'Get all users'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users', 'POST', 'Create new user'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/register', 'POST', 'Register new user account'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users/{id}', 'GET', 'Get specific user details'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users/{id}', 'PUT', 'Update user information'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users/{id}', 'DELETE', 'Delete user account'
    
    -- MANAGE_ROLES endpoints
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/roles', 'GET', 'Get all roles'
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/roles', 'POST', 'Create new role'
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/roles', 'PUT', 'Update role'
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/roles', 'DELETE', 'Delete role'
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/permissions', 'GET', 'Get all permissions'
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/permissions', 'POST', 'Create new permission'
    UNION ALL
    SELECT 'MANAGE_ROLES', '/api/admin/roles/assign', 'POST', 'Assign roles to users'
    
    -- VIEW_SYSTEM_LOGS endpoints
    UNION ALL
    SELECT 'VIEW_SYSTEM_LOGS', '/api/debug/*', 'GET', 'Access debug endpoints'
    UNION ALL
    SELECT 'VIEW_SYSTEM_LOGS', '/api/admin/logs', 'GET', 'View system logs'
    
    -- SYSTEM_MAINTENANCE endpoints
    UNION ALL
    SELECT 'SYSTEM_MAINTENANCE', '/api/system/config', 'GET', 'Get system configuration'
    UNION ALL
    SELECT 'SYSTEM_MAINTENANCE', '/api/system/config', 'PUT', 'Update system configuration'
    UNION ALL
    SELECT 'SYSTEM_MAINTENANCE', '/api/system/info', 'GET', 'Get system information'
    
    -- DATABASE_CLEANUP endpoints
    UNION ALL
    SELECT 'DATABASE_CLEANUP', '/api/system/database/cleanup', 'POST', 'Perform database cleanup operations'
    
) as endpoint
WHERE p.name = endpoint.permission_name;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check all inserted permissions
SELECT 
    id,
    name,
    description,
    module,
    created_at
FROM permissions 
ORDER BY module, name;

-- Check all inserted permission-endpoint mappings
SELECT 
    p.module,
    p.name as permission_name,
    pae.api_endpoint,
    pae.http_method,
    pae.description,
    pae.is_active
FROM permission_api_endpoints pae
JOIN permissions p ON pae.permission_id = p.id
ORDER BY p.module, p.name, pae.api_endpoint;

-- Count endpoints per permission
SELECT 
    p.name as permission_name,
    p.module,
    COUNT(pae.id) as endpoint_count
FROM permissions p
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
GROUP BY p.id, p.name, p.module
ORDER BY p.module, endpoint_count DESC;

-- Check for any missing mappings
SELECT 
    p.name as permission_without_endpoints
FROM permissions p
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE pae.id IS NULL;
