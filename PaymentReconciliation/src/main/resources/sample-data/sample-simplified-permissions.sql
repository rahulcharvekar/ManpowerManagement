-- =============================================================================
-- Sample Simplified Permissions Data
-- This file contains sample permission data using the simplified approach
-- where module column acts as UI component identifier
-- =============================================================================

USE paymentreconciliation_dev;

-- Clear existing data (optional - use with caution)
-- DELETE FROM permission_api_endpoints;
-- DELETE FROM role_permissions;
-- DELETE FROM permissions;

-- =============================================================================
-- PERMISSIONS (Module-based, unified for API + UI)
-- =============================================================================

-- USER MODULE (User Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('USER_READ', 'View and list all users', 'USER', '/admin/users', 10, TRUE, TRUE),
('USER_CREATE', 'Create new users', 'USER', NULL, 11, FALSE, TRUE),
('USER_EDIT', 'Edit user details and roles', 'USER', NULL, 12, FALSE, TRUE),
('USER_DELETE', 'Delete users from system', 'USER', NULL, 13, FALSE, TRUE),
('USER_EXPORT', 'Export user data', 'USER', NULL, 14, FALSE, TRUE);

-- ROLE MODULE (Role Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('ROLE_READ', 'View and list all roles', 'ROLE', '/admin/roles', 20, TRUE, TRUE),
('ROLE_CREATE', 'Create new roles', 'ROLE', NULL, 21, FALSE, TRUE),
('ROLE_EDIT', 'Edit role details', 'ROLE', NULL, 22, FALSE, TRUE),
('ROLE_DELETE', 'Delete roles', 'ROLE', NULL, 23, FALSE, TRUE),
('ROLE_ASSIGN_PERMISSIONS', 'Assign permissions to roles', 'ROLE', NULL, 24, FALSE, TRUE);

-- PERMISSION MODULE (Permission Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('PERMISSION_READ', 'View all permissions', 'PERMISSION', '/admin/permissions', 30, TRUE, TRUE),
('PERMISSION_CREATE', 'Create new permissions', 'PERMISSION', NULL, 31, FALSE, TRUE),
('PERMISSION_EDIT', 'Edit permission details', 'PERMISSION', NULL, 32, FALSE, TRUE),
('PERMISSION_DELETE', 'Delete permissions', 'PERMISSION', NULL, 33, FALSE, TRUE);

-- WORKER MODULE (Worker Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('WORKER_READ', 'View worker records', 'WORKER', '/workers', 40, TRUE, TRUE),
('WORKER_CREATE', 'Add new workers', 'WORKER', NULL, 41, FALSE, TRUE),
('WORKER_EDIT', 'Edit worker information', 'WORKER', NULL, 42, FALSE, TRUE),
('WORKER_DELETE', 'Delete worker records', 'WORKER', NULL, 43, FALSE, TRUE),
('WORKER_IMPORT', 'Import worker data from files', 'WORKER', NULL, 44, FALSE, TRUE),
('WORKER_EXPORT', 'Export worker data', 'WORKER', NULL, 45, FALSE, TRUE);

-- EMPLOYER MODULE (Employer Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('EMPLOYER_READ', 'View employer records', 'EMPLOYER', '/employers', 50, TRUE, TRUE),
('EMPLOYER_CREATE', 'Add new employers', 'EMPLOYER', NULL, 51, FALSE, TRUE),
('EMPLOYER_EDIT', 'Edit employer information', 'EMPLOYER', NULL, 52, FALSE, TRUE),
('EMPLOYER_DELETE', 'Delete employer records', 'EMPLOYER', NULL, 53, FALSE, TRUE),
('EMPLOYER_EXPORT', 'Export employer data', 'EMPLOYER', NULL, 54, FALSE, TRUE);

-- BOARD MODULE (Board Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('BOARD_READ', 'View board records', 'BOARD', '/boards', 60, TRUE, TRUE),
('BOARD_CREATE', 'Add new boards', 'BOARD', NULL, 61, FALSE, TRUE),
('BOARD_EDIT', 'Edit board information', 'BOARD', NULL, 62, FALSE, TRUE),
('BOARD_DELETE', 'Delete board records', 'BOARD', NULL, 63, FALSE, TRUE);

-- PAYMENT MODULE (Payment Processing)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('PAYMENT_READ', 'View payment records', 'PAYMENT', '/payments', 70, TRUE, TRUE),
('PAYMENT_CREATE', 'Process new payments', 'PAYMENT', NULL, 71, FALSE, TRUE),
('PAYMENT_EDIT', 'Edit payment details', 'PAYMENT', NULL, 72, FALSE, TRUE),
('PAYMENT_DELETE', 'Delete payment records', 'PAYMENT', NULL, 73, FALSE, TRUE),
('PAYMENT_APPROVE', 'Approve and validate payments', 'PAYMENT', NULL, 74, FALSE, TRUE),
('PAYMENT_REJECT', 'Reject payments', 'PAYMENT', NULL, 75, FALSE, TRUE),
('PAYMENT_EXPORT', 'Export payment data', 'PAYMENT', NULL, 76, FALSE, TRUE);

-- RECEIPT MODULE (Receipt Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('RECEIPT_READ', 'View payment receipts', 'RECEIPT', '/receipts', 80, TRUE, TRUE),
('RECEIPT_CREATE', 'Generate receipts', 'RECEIPT', NULL, 81, FALSE, TRUE),
('RECEIPT_APPROVE', 'Approve receipts', 'RECEIPT', NULL, 82, FALSE, TRUE),
('RECEIPT_EXPORT', 'Export receipt data', 'RECEIPT', NULL, 83, FALSE, TRUE);

-- RECONCILIATION MODULE (Reconciliation Dashboard)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('RECONCILIATION_READ', 'View reconciliation dashboard', 'RECONCILIATION', '/reconciliation', 90, TRUE, TRUE),
('RECONCILIATION_PROCESS', 'Process reconciliation', 'RECONCILIATION', NULL, 91, FALSE, TRUE),
('RECONCILIATION_APPROVE', 'Approve reconciliation', 'RECONCILIATION', NULL, 92, FALSE, TRUE),
('RECONCILIATION_EXPORT', 'Export reconciliation data', 'RECONCILIATION', NULL, 93, FALSE, TRUE);

-- UPLOAD MODULE (File Upload Management)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('UPLOAD_READ', 'View uploaded files', 'UPLOAD', '/uploads', 100, TRUE, TRUE),
('UPLOAD_CREATE', 'Upload new files', 'UPLOAD', NULL, 101, FALSE, TRUE),
('UPLOAD_DELETE', 'Delete uploaded files', 'UPLOAD', NULL, 102, FALSE, TRUE),
('UPLOAD_PROCESS', 'Process uploaded files', 'UPLOAD', NULL, 103, FALSE, TRUE);

-- REPORT MODULE (Reports & Analytics)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('REPORT_READ', 'View and generate reports', 'REPORT', '/reports', 110, TRUE, TRUE),
('REPORT_EXPORT', 'Export reports', 'REPORT', NULL, 111, FALSE, TRUE),
('REPORT_SCHEDULE', 'Schedule automated reports', 'REPORT', NULL, 112, FALSE, TRUE);

-- AUDIT MODULE (Audit Logs)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('AUDIT_READ', 'View audit logs and history', 'AUDIT', '/admin/audit', 120, TRUE, TRUE),
('AUDIT_EXPORT', 'Export audit logs', 'AUDIT', NULL, 121, FALSE, TRUE);

-- SYSTEM MODULE (System Settings)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('SYSTEM_READ', 'View system settings', 'SYSTEM', '/admin/settings', 130, TRUE, TRUE),
('SYSTEM_EDIT', 'Modify system settings', 'SYSTEM', NULL, 131, FALSE, TRUE);

-- DASHBOARD MODULE (Main Dashboard)
INSERT INTO permissions (name, description, module, route, display_order, is_menu_item, is_active) VALUES
('DASHBOARD_READ', 'View main dashboard', 'DASHBOARD', '/dashboard', 1, TRUE, TRUE);

-- =============================================================================
-- PERMISSION API ENDPOINTS MAPPING
-- =============================================================================

-- USER Module API Endpoints
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) VALUES
((SELECT id FROM permissions WHERE name = 'USER_READ'), '/api/auth/users', 'GET', 'List all users'),
((SELECT id FROM permissions WHERE name = 'USER_READ'), '/api/auth/users/{id}', 'GET', 'Get user by ID'),
((SELECT id FROM permissions WHERE name = 'USER_CREATE'), '/api/auth/register', 'POST', 'Register new user'),
((SELECT id FROM permissions WHERE name = 'USER_EDIT'), '/api/auth/users/{id}', 'PUT', 'Update user'),
((SELECT id FROM permissions WHERE name = 'USER_EDIT'), '/api/auth/users/{id}/roles', 'PUT', 'Update user roles'),
((SELECT id FROM permissions WHERE name = 'USER_DELETE'), '/api/auth/users/{id}', 'DELETE', 'Delete user');

-- ROLE Module API Endpoints
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) VALUES
((SELECT id FROM permissions WHERE name = 'ROLE_READ'), '/api/roles', 'GET', 'List all roles'),
((SELECT id FROM permissions WHERE name = 'ROLE_READ'), '/api/roles/{id}', 'GET', 'Get role by ID'),
((SELECT id FROM permissions WHERE name = 'ROLE_CREATE'), '/api/roles', 'POST', 'Create new role'),
((SELECT id FROM permissions WHERE name = 'ROLE_EDIT'), '/api/roles/{id}', 'PUT', 'Update role'),
((SELECT id FROM permissions WHERE name = 'ROLE_DELETE'), '/api/roles/{id}', 'DELETE', 'Delete role'),
((SELECT id FROM permissions WHERE name = 'ROLE_ASSIGN_PERMISSIONS'), '/api/roles/{id}/permissions', 'PUT', 'Assign permissions to role');

-- WORKER Module API Endpoints
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) VALUES
((SELECT id FROM permissions WHERE name = 'WORKER_READ'), '/api/workers', 'GET', 'List all workers'),
((SELECT id FROM permissions WHERE name = 'WORKER_READ'), '/api/workers/{id}', 'GET', 'Get worker by ID'),
((SELECT id FROM permissions WHERE name = 'WORKER_CREATE'), '/api/workers', 'POST', 'Create new worker'),
((SELECT id FROM permissions WHERE name = 'WORKER_EDIT'), '/api/workers/{id}', 'PUT', 'Update worker'),
((SELECT id FROM permissions WHERE name = 'WORKER_DELETE'), '/api/workers/{id}', 'DELETE', 'Delete worker'),
((SELECT id FROM permissions WHERE name = 'WORKER_IMPORT'), '/api/workers/import', 'POST', 'Import workers from file');

-- PAYMENT Module API Endpoints
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) VALUES
((SELECT id FROM permissions WHERE name = 'PAYMENT_READ'), '/api/payments', 'GET', 'List all payments'),
((SELECT id FROM permissions WHERE name = 'PAYMENT_READ'), '/api/payments/{id}', 'GET', 'Get payment by ID'),
((SELECT id FROM permissions WHERE name = 'PAYMENT_CREATE'), '/api/payments', 'POST', 'Create new payment'),
((SELECT id FROM permissions WHERE name = 'PAYMENT_EDIT'), '/api/payments/{id}', 'PUT', 'Update payment'),
((SELECT id FROM permissions WHERE name = 'PAYMENT_DELETE'), '/api/payments/{id}', 'DELETE', 'Delete payment'),
((SELECT id FROM permissions WHERE name = 'PAYMENT_APPROVE'), '/api/payments/{id}/approve', 'POST', 'Approve payment'),
((SELECT id FROM permissions WHERE name = 'PAYMENT_REJECT'), '/api/payments/{id}/reject', 'POST', 'Reject payment');

-- UPLOAD Module API Endpoints
INSERT INTO permission_api_endpoints (permission_id, api_endpoint, http_method, description) VALUES
((SELECT id FROM permissions WHERE name = 'UPLOAD_READ'), '/api/uploads', 'GET', 'List uploaded files'),
((SELECT id FROM permissions WHERE name = 'UPLOAD_CREATE'), '/api/uploads', 'POST', 'Upload new file'),
((SELECT id FROM permissions WHERE name = 'UPLOAD_DELETE'), '/api/uploads/{id}', 'DELETE', 'Delete uploaded file'),
((SELECT id FROM permissions WHERE name = 'UPLOAD_PROCESS'), '/api/uploads/{id}/process', 'POST', 'Process uploaded file');

-- Add more API endpoint mappings as needed...

-- =============================================================================
-- Verification Queries
-- =============================================================================

-- Check all permissions grouped by module
SELECT 
    module,
    COUNT(*) as permission_count,
    MAX(route) as menu_route,
    SUM(CASE WHEN is_menu_item = TRUE THEN 1 ELSE 0 END) as menu_items
FROM permissions
GROUP BY module
ORDER BY display_order;

-- Check permissions with their API endpoints
SELECT 
    p.module,
    p.name,
    p.route,
    p.is_menu_item,
    COUNT(pae.id) as api_endpoint_count
FROM permissions p
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
GROUP BY p.id, p.module, p.name, p.route, p.is_menu_item
ORDER BY p.display_order;

SELECT 'Sample permissions data loaded successfully!' as status;
