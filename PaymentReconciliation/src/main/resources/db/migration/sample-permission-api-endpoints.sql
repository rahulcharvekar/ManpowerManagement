-- =============================================================================
-- Sample Data for Permission API Endpoints
-- =============================================================================

-- First, let's insert some basic permissions if they don't exist
INSERT IGNORE INTO permissions (name, description, module) VALUES
('READ_WORKER_DATA', 'Can read worker payment data', 'WORKER'),
('UPLOAD_WORKER_DATA', 'Can upload worker data files', 'WORKER'),
('APPROVE_PAYMENTS', 'Can approve payment transactions', 'PAYMENT'),
('MANAGE_USERS', 'Can manage system users', 'ADMIN'),
('VIEW_DASHBOARD', 'Can view dashboard and analytics', 'DASHBOARD'),
('RECONCILE_PAYMENTS', 'Can perform payment reconciliation', 'RECONCILIATION'),
('MANAGE_RECEIPTS', 'Can manage receipt processing', 'RECEIPT'),
('EXPORT_DATA', 'Can export data and reports', 'EXPORT');

-- Now insert the API endpoint mappings
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) 
SELECT p.id, endpoint.api_endpoint, endpoint.http_method, endpoint.description
FROM permissions p
CROSS JOIN (
    -- READ_WORKER_DATA endpoints
    SELECT 'READ_WORKER_DATA' as permission_name, '/api/v1/worker-payments' as api_endpoint, 'GET' as http_method, 'Get worker payments list' as description
    UNION ALL
    SELECT 'READ_WORKER_DATA', '/api/v1/worker-payments/{id}', 'GET', 'Get specific worker payment'
    UNION ALL
    SELECT 'READ_WORKER_DATA', '/api/worker/uploaded-data/files/summaries', 'GET', 'Get uploaded file summaries'
    UNION ALL
    SELECT 'READ_WORKER_DATA', '/api/worker/uploaded-data/files/{id}/summary', 'GET', 'Get specific file summary'
    
    -- UPLOAD_WORKER_DATA endpoints
    UNION ALL
    SELECT 'UPLOAD_WORKER_DATA', '/api/worker/uploaded-data/upload', 'POST', 'Upload worker data files'
    UNION ALL
    SELECT 'UPLOAD_WORKER_DATA', '/api/worker/uploaded-data/validate', 'POST', 'Validate uploaded data'
    
    -- APPROVE_PAYMENTS endpoints
    UNION ALL
    SELECT 'APPROVE_PAYMENTS', '/api/v1/worker-payments/{id}/approve', 'POST', 'Approve specific payment'
    UNION ALL
    SELECT 'APPROVE_PAYMENTS', '/api/payments/batch-approve', 'POST', 'Batch approve payments'
    UNION ALL
    SELECT 'APPROVE_PAYMENTS', '/api/v1/worker-payments/{id}/reject', 'POST', 'Reject specific payment'
    
    -- MANAGE_USERS endpoints
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users', 'GET', 'Get all users'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users', 'POST', 'Create new user'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users/{id}', 'PUT', 'Update user'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/auth/users/{id}', 'DELETE', 'Delete user'
    UNION ALL
    SELECT 'MANAGE_USERS', '/api/admin/roles/assign', 'POST', 'Assign roles to user'
    
    -- VIEW_DASHBOARD endpoints
    UNION ALL
    SELECT 'VIEW_DASHBOARD', '/api/dashboard/stats', 'GET', 'Get dashboard statistics'
    UNION ALL
    SELECT 'VIEW_DASHBOARD', '/api/dashboard/charts', 'GET', 'Get dashboard charts'
    UNION ALL
    SELECT 'VIEW_DASHBOARD', '/api/dashboard/summary', 'GET', 'Get dashboard summary'
    
    -- RECONCILE_PAYMENTS endpoints
    UNION ALL
    SELECT 'RECONCILE_PAYMENTS', '/api/reconciliation/start', 'POST', 'Start reconciliation process'
    UNION ALL
    SELECT 'RECONCILE_PAYMENTS', '/api/reconciliation/status', 'GET', 'Get reconciliation status'
    UNION ALL
    SELECT 'RECONCILE_PAYMENTS', '/api/reconciliation/reports', 'GET', 'Get reconciliation reports'
    
    -- MANAGE_RECEIPTS endpoints
    UNION ALL
    SELECT 'MANAGE_RECEIPTS', '/api/receipts/worker', 'GET', 'Get worker receipts'
    UNION ALL
    SELECT 'MANAGE_RECEIPTS', '/api/receipts/employer', 'GET', 'Get employer receipts'
    UNION ALL
    SELECT 'MANAGE_RECEIPTS', '/api/receipts/board', 'GET', 'Get board receipts'
    UNION ALL
    SELECT 'MANAGE_RECEIPTS', '/api/receipts/{id}/process', 'POST', 'Process receipt'
    
    -- EXPORT_DATA endpoints
    UNION ALL
    SELECT 'EXPORT_DATA', '/api/export/worker-payments', 'GET', 'Export worker payments'
    UNION ALL
    SELECT 'EXPORT_DATA', '/api/export/reconciliation-report', 'GET', 'Export reconciliation report'
    UNION ALL
    SELECT 'EXPORT_DATA', '/api/export/receipts', 'GET', 'Export receipts data'
) as endpoint
WHERE p.name = endpoint.permission_name;

-- Verification query to check inserted data
SELECT 
    p.name as permission_name,
    pae.api_endpoint,
    pae.http_method,
    pae.description,
    pae.is_active
FROM permission_api_endpoints pae
JOIN permissions p ON pae.permission_id = p.id
ORDER BY p.name, pae.api_endpoint;
