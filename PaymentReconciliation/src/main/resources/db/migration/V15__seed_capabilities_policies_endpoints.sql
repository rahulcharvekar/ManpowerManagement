-- =============================================================================
-- V15: Seed Capabilities, Policies, Endpoints, and UI Pages
-- This populates the new Capability+Policy+Service Catalog model with data
-- =============================================================================

-- =============================================================================
-- PART 1: SEED CAPABILITIES
-- =============================================================================

INSERT INTO capabilities (name, module, action, resource, description) VALUES
-- AUTH MODULE
('AUTH.LOGIN', 'AUTH', 'LOGIN', 'AUTH', 'User can login to the system'),
('AUTH.LOGOUT', 'AUTH', 'LOGOUT', 'AUTH', 'User can logout from the system'),
('AUTH.REFRESH_TOKEN', 'AUTH', 'REFRESH_TOKEN', 'AUTH', 'User can refresh authentication token'),
('AUTH.VIEW_PROFILE', 'AUTH', 'VIEW_PROFILE', 'AUTH', 'User can view their own profile'),
('AUTH.UPDATE_PROFILE', 'AUTH', 'UPDATE_PROFILE', 'AUTH', 'User can update their own profile'),
('AUTH.CHANGE_PASSWORD', 'AUTH', 'CHANGE_PASSWORD', 'AUTH', 'User can change their password'),

-- USER_MANAGEMENT MODULE
('USER_MANAGEMENT.LIST', 'USER_MANAGEMENT', 'LIST', 'USER', 'View list of all users'),
('USER_MANAGEMENT.READ', 'USER_MANAGEMENT', 'READ', 'USER', 'View specific user details'),
('USER_MANAGEMENT.CREATE', 'USER_MANAGEMENT', 'CREATE', 'USER', 'Create new user accounts'),
('USER_MANAGEMENT.UPDATE', 'USER_MANAGEMENT', 'UPDATE', 'USER', 'Update user information'),
('USER_MANAGEMENT.DELETE', 'USER_MANAGEMENT', 'DELETE', 'USER', 'Delete user accounts'),
('USER_MANAGEMENT.ACTIVATE', 'USER_MANAGEMENT', 'ACTIVATE', 'USER', 'Activate/deactivate users'),

-- ROLE_MANAGEMENT MODULE
('ROLE_MANAGEMENT.LIST', 'ROLE_MANAGEMENT', 'LIST', 'ROLE', 'View list of all roles'),
('ROLE_MANAGEMENT.READ', 'ROLE_MANAGEMENT', 'READ', 'ROLE', 'View specific role details'),
('ROLE_MANAGEMENT.CREATE', 'ROLE_MANAGEMENT', 'CREATE', 'ROLE', 'Create new roles'),
('ROLE_MANAGEMENT.UPDATE', 'ROLE_MANAGEMENT', 'UPDATE', 'ROLE', 'Update role information'),
('ROLE_MANAGEMENT.DELETE', 'ROLE_MANAGEMENT', 'DELETE', 'ROLE', 'Delete roles'),
('ROLE_MANAGEMENT.ASSIGN_USERS', 'ROLE_MANAGEMENT', 'ASSIGN_USERS', 'ROLE', 'Assign roles to users'),

-- PERMISSION_MANAGEMENT MODULE
('PERMISSION_MANAGEMENT.LIST', 'PERMISSION_MANAGEMENT', 'LIST', 'PERMISSION', 'View capabilities and policies'),
('PERMISSION_MANAGEMENT.READ', 'PERMISSION_MANAGEMENT', 'READ', 'PERMISSION', 'View capability/policy details'),
('PERMISSION_MANAGEMENT.CREATE', 'PERMISSION_MANAGEMENT', 'CREATE', 'PERMISSION', 'Create capabilities/policies'),
('PERMISSION_MANAGEMENT.UPDATE', 'PERMISSION_MANAGEMENT', 'UPDATE', 'PERMISSION', 'Update capabilities/policies'),
('PERMISSION_MANAGEMENT.DELETE', 'PERMISSION_MANAGEMENT', 'DELETE', 'PERMISSION', 'Delete capabilities/policies'),

-- WORKER MODULE
('WORKER.LIST', 'WORKER', 'LIST', 'WORKER', 'View list of worker data'),
('WORKER.READ', 'WORKER', 'READ', 'WORKER', 'View worker details'),
('WORKER.CREATE', 'WORKER', 'CREATE', 'WORKER', 'Upload/create worker data'),
('WORKER.UPDATE', 'WORKER', 'UPDATE', 'WORKER', 'Update worker information'),
('WORKER.DELETE', 'WORKER', 'DELETE', 'WORKER', 'Delete worker data'),
('WORKER.VALIDATE', 'WORKER', 'VALIDATE', 'WORKER', 'Validate worker data entries'),
('WORKER.GENERATE_PAYMENTS', 'WORKER', 'GENERATE_PAYMENTS', 'WORKER', 'Generate payment requests'),
('WORKER.DOWNLOAD', 'WORKER', 'DOWNLOAD', 'WORKER', 'Download worker data'),

-- PAYMENT MODULE
('PAYMENT.LIST', 'PAYMENT', 'LIST', 'PAYMENT', 'View list of payments'),
('PAYMENT.READ', 'PAYMENT', 'READ', 'PAYMENT', 'View payment details'),
('PAYMENT.CREATE', 'PAYMENT', 'CREATE', 'PAYMENT', 'Create payment requests'),
('PAYMENT.UPDATE', 'PAYMENT', 'UPDATE', 'PAYMENT', 'Update payment information'),
('PAYMENT.DELETE', 'PAYMENT', 'DELETE', 'PAYMENT', 'Delete payments'),
('PAYMENT.PROCESS', 'PAYMENT', 'PROCESS', 'PAYMENT', 'Process payment requests'),
('PAYMENT.APPROVE', 'PAYMENT', 'APPROVE', 'PAYMENT', 'Approve payment requests'),
('PAYMENT.REJECT', 'PAYMENT', 'REJECT', 'PAYMENT', 'Reject payment requests'),
('PAYMENT.GENERATE_REPORTS', 'PAYMENT', 'GENERATE_REPORTS', 'PAYMENT', 'Generate payment reports'),

-- EMPLOYER MODULE
('EMPLOYER.LIST', 'EMPLOYER', 'LIST', 'EMPLOYER', 'View list of employers'),
('EMPLOYER.READ', 'EMPLOYER', 'READ', 'EMPLOYER', 'View employer details'),
('EMPLOYER.CREATE', 'EMPLOYER', 'CREATE', 'EMPLOYER', 'Create employer records'),
('EMPLOYER.UPDATE', 'EMPLOYER', 'UPDATE', 'EMPLOYER', 'Update employer information'),
('EMPLOYER.DELETE', 'EMPLOYER', 'DELETE', 'EMPLOYER', 'Delete employer records'),
('EMPLOYER.VIEW_RECEIPTS', 'EMPLOYER', 'VIEW_RECEIPTS', 'EMPLOYER', 'View employer payment receipts'),
('EMPLOYER.VALIDATE_RECEIPTS', 'EMPLOYER', 'VALIDATE_RECEIPTS', 'EMPLOYER', 'Validate employer receipts'),
('EMPLOYER.SEND_TO_BOARD', 'EMPLOYER', 'SEND_TO_BOARD', 'EMPLOYER', 'Send receipts to board'),

-- BOARD MODULE
('BOARD.LIST', 'BOARD', 'LIST', 'BOARD', 'View list of board items'),
('BOARD.READ', 'BOARD', 'READ', 'BOARD', 'View board item details'),
('BOARD.VIEW_RECEIPTS', 'BOARD', 'VIEW_RECEIPTS', 'BOARD', 'View board receipts'),
('BOARD.APPROVE', 'BOARD', 'APPROVE', 'BOARD', 'Approve board receipts'),
('BOARD.REJECT', 'BOARD', 'REJECT', 'BOARD', 'Reject board receipts'),
('BOARD.GENERATE_REPORTS', 'BOARD', 'GENERATE_REPORTS', 'BOARD', 'Generate board reports'),

-- RECONCILIATION MODULE
('RECONCILIATION.LIST', 'RECONCILIATION', 'LIST', 'RECONCILIATION', 'View reconciliation data'),
('RECONCILIATION.READ', 'RECONCILIATION', 'READ', 'RECONCILIATION', 'View reconciliation details'),
('RECONCILIATION.PERFORM', 'RECONCILIATION', 'PERFORM', 'RECONCILIATION', 'Perform payment reconciliation'),
('RECONCILIATION.GENERATE_REPORTS', 'RECONCILIATION', 'GENERATE_REPORTS', 'RECONCILIATION', 'Generate reconciliation reports'),

-- DASHBOARD MODULE
('DASHBOARD.VIEW', 'DASHBOARD', 'VIEW', 'DASHBOARD', 'View dashboard'),
('DASHBOARD.VIEW_STATS', 'DASHBOARD', 'VIEW_STATS', 'DASHBOARD', 'View dashboard statistics'),

-- AUDIT MODULE
('AUDIT.VIEW_LOGS', 'AUDIT', 'VIEW_LOGS', 'AUDIT', 'View system audit logs'),
('AUDIT.VIEW_AUTH_LOGS', 'AUDIT', 'VIEW_AUTH_LOGS', 'AUDIT', 'View authorization audit logs'),
('AUDIT.EXPORT', 'AUDIT', 'EXPORT', 'AUDIT', 'Export audit logs'),

-- SYSTEM MODULE
('SYSTEM.MAINTENANCE', 'SYSTEM', 'MAINTENANCE', 'SYSTEM', 'Perform system maintenance'),
('SYSTEM.DATABASE_CLEANUP', 'SYSTEM', 'DATABASE_CLEANUP', 'SYSTEM', 'Perform database cleanup'),
('SYSTEM.VIEW_CONFIG', 'SYSTEM', 'VIEW_CONFIG', 'SYSTEM', 'View system configuration'),
('SYSTEM.UPDATE_CONFIG', 'SYSTEM', 'UPDATE_CONFIG', 'SYSTEM', 'Update system configuration');

-- =============================================================================
-- PART 2: SEED POLICIES
-- =============================================================================

-- ADMIN POLICY: Full access to everything
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.admin.full_access', 1, 'RBAC', 
 JSON_OBJECT('roles', JSON_ARRAY('ADMIN'), 'conditions', JSON_ARRAY()),
 'Admin role has full access to all capabilities', TRUE);

-- Link ADMIN policy to all capabilities
INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.admin.full_access';

-- AUTH POLICIES (Everyone can login, view profile, etc.)
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.auth.common', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('ADMIN', 'RECONCILIATION_OFFICER', 'WORKER', 'EMPLOYER', 'BOARD')),
 'All authenticated users can perform basic auth actions', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.auth.common'
  AND c.module = 'AUTH';

-- WORKER POLICIES
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.worker.full', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('WORKER', 'RECONCILIATION_OFFICER')),
 'Worker and Reconciliation Officer can manage worker data', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.worker.full'
  AND c.module = 'WORKER';

-- PAYMENT POLICIES
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.payment.full', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('RECONCILIATION_OFFICER')),
 'Reconciliation Officer can manage all payment operations', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.payment.full'
  AND c.module = 'PAYMENT';

-- EMPLOYER POLICIES
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.employer.full', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('EMPLOYER', 'RECONCILIATION_OFFICER')),
 'Employer and Reconciliation Officer can manage employer data', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.employer.full'
  AND c.module = 'EMPLOYER';

-- BOARD POLICIES
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.board.full', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('BOARD', 'RECONCILIATION_OFFICER')),
 'Board and Reconciliation Officer can manage board operations', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.board.full'
  AND c.module = 'BOARD';

-- RECONCILIATION POLICIES
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.reconciliation.full', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('RECONCILIATION_OFFICER')),
 'Reconciliation Officer can perform all reconciliation operations', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.reconciliation.full'
  AND c.module = 'RECONCILIATION';

-- DASHBOARD POLICIES
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.dashboard.view', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('ADMIN', 'RECONCILIATION_OFFICER', 'WORKER', 'EMPLOYER', 'BOARD')),
 'All authenticated users can view dashboard', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.dashboard.view'
  AND c.module = 'DASHBOARD';

-- USER/ROLE/PERMISSION MANAGEMENT POLICIES (Admin only)
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.admin.user_management', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('ADMIN')),
 'Only Admin can manage users, roles, and permissions', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.admin.user_management'
  AND c.module IN ('USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'PERMISSION_MANAGEMENT');

-- AUDIT POLICIES (Admin and Reconciliation Officer)
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.audit.view', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('ADMIN', 'RECONCILIATION_OFFICER')),
 'Admin and Reconciliation Officer can view audit logs', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.audit.view'
  AND c.module = 'AUDIT';

-- SYSTEM POLICIES (Admin only)
INSERT INTO policies (name, version, type, expr_json, description, is_active) VALUES
('policy.system.admin', 1, 'RBAC',
 JSON_OBJECT('roles', JSON_ARRAY('ADMIN')),
 'Only Admin can perform system operations', TRUE);

INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT p.id, c.id
FROM policies p
CROSS JOIN capabilities c
WHERE p.name = 'policy.system.admin'
  AND c.module = 'SYSTEM';

-- =============================================================================
-- PART 3: SEED ENDPOINTS (Service Catalog)
-- =============================================================================

-- AUTH ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('auth', 'v1', 'POST', '/api/auth/login', 'User login'),
('auth', 'v1', 'POST', '/api/auth/logout', 'User logout'),
('auth', 'v1', 'POST', '/api/auth/refresh', 'Refresh authentication token'),
('auth', 'v1', 'GET', '/api/auth/me', 'Get current user profile'),
('auth', 'v1', 'PUT', '/api/auth/me', 'Update current user profile'),
('auth', 'v1', 'PUT', '/api/auth/change-password', 'Change user password'),
('auth', 'v1', 'GET', '/api/auth/ui-config', 'Get UI configuration');

-- USER MANAGEMENT ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('user', 'v1', 'GET', '/api/auth/users', 'List all users'),
('user', 'v1', 'GET', '/api/auth/users/{id}', 'Get user by ID'),
('user', 'v1', 'POST', '/api/auth/register', 'Create new user'),
('user', 'v1', 'PUT', '/api/auth/users/{id}', 'Update user'),
('user', 'v1', 'DELETE', '/api/auth/users/{id}', 'Delete user'),
('user', 'v1', 'PATCH', '/api/auth/users/{id}/activate', 'Activate user'),
('user', 'v1', 'PATCH', '/api/auth/users/{id}/deactivate', 'Deactivate user');

-- ROLE MANAGEMENT ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('role', 'v1', 'GET', '/api/admin/roles', 'List all roles'),
('role', 'v1', 'GET', '/api/admin/roles/{id}', 'Get role by ID'),
('role', 'v1', 'POST', '/api/admin/roles', 'Create new role'),
('role', 'v1', 'PUT', '/api/admin/roles/{id}', 'Update role'),
('role', 'v1', 'DELETE', '/api/admin/roles/{id}', 'Delete role'),
('role', 'v1', 'GET', '/api/admin/roles/{id}/users', 'Get users in role'),
('role', 'v1', 'POST', '/api/admin/roles/{roleId}/users/{userId}', 'Assign user to role'),
('role', 'v1', 'DELETE', '/api/admin/roles/{roleId}/users/{userId}', 'Remove user from role');

-- WORKER ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('worker', 'v1', 'GET', '/api/worker/uploaded-data/list', 'List worker uploads'),
('worker', 'v1', 'GET', '/api/worker/uploaded-data/files/{id}', 'Get worker file details'),
('worker', 'v1', 'POST', '/api/worker/uploaded-data/upload', 'Upload worker data'),
('worker', 'v1', 'PUT', '/api/worker/uploaded-data/files/{id}', 'Update worker file'),
('worker', 'v1', 'DELETE', '/api/worker/uploaded-data/files/{id}', 'Delete worker file'),
('worker', 'v1', 'POST', '/api/worker/uploaded-data/files/{id}/validate', 'Validate worker data'),
('worker', 'v1', 'POST', '/api/worker/uploaded-data/generate-payments', 'Generate payment requests'),
('worker', 'v1', 'GET', '/api/worker/uploaded-data/download/{id}', 'Download worker data');

-- PAYMENT ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('payment', 'v1', 'GET', '/api/payments', 'List payments'),
('payment', 'v1', 'GET', '/api/payments/{id}', 'Get payment details'),
('payment', 'v1', 'POST', '/api/payments', 'Create payment'),
('payment', 'v1', 'PUT', '/api/payments/{id}', 'Update payment'),
('payment', 'v1', 'DELETE', '/api/payments/{id}', 'Delete payment'),
('payment', 'v1', 'POST', '/api/payments/{id}/process', 'Process payment'),
('payment', 'v1', 'POST', '/api/payments/{id}/approve', 'Approve payment'),
('payment', 'v1', 'POST', '/api/payments/{id}/reject', 'Reject payment'),
('payment', 'v1', 'GET', '/api/payments/reports', 'Generate payment reports');

-- EMPLOYER ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('employer', 'v1', 'GET', '/api/employers', 'List employers'),
('employer', 'v1', 'GET', '/api/employers/{id}', 'Get employer details'),
('employer', 'v1', 'POST', '/api/employers', 'Create employer'),
('employer', 'v1', 'PUT', '/api/employers/{id}', 'Update employer'),
('employer', 'v1', 'DELETE', '/api/employers/{id}', 'Delete employer'),
('employer', 'v1', 'GET', '/api/employers/{id}/receipts', 'View employer receipts'),
('employer', 'v1', 'POST', '/api/employers/{id}/receipts/validate', 'Validate receipts'),
('employer', 'v1', 'POST', '/api/employers/{id}/receipts/send-to-board', 'Send to board');

-- BOARD ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('board', 'v1', 'GET', '/api/board/receipts', 'List board receipts'),
('board', 'v1', 'GET', '/api/board/receipts/{id}', 'Get board receipt details'),
('board', 'v1', 'POST', '/api/board/receipts/{id}/approve', 'Approve board receipt'),
('board', 'v1', 'POST', '/api/board/receipts/{id}/reject', 'Reject board receipt'),
('board', 'v1', 'GET', '/api/board/reports', 'Generate board reports');

-- RECONCILIATION ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('reconciliation', 'v1', 'GET', '/api/reconciliation', 'List reconciliations'),
('reconciliation', 'v1', 'GET', '/api/reconciliation/{id}', 'Get reconciliation details'),
('reconciliation', 'v1', 'POST', '/api/reconciliation/perform', 'Perform reconciliation'),
('reconciliation', 'v1', 'GET', '/api/reconciliation/reports', 'Generate reconciliation reports');

-- DASHBOARD ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('dashboard', 'v1', 'GET', '/api/dashboard', 'Get dashboard data'),
('dashboard', 'v1', 'GET', '/api/dashboard/stats', 'Get dashboard statistics');

-- AUDIT ENDPOINTS
INSERT INTO endpoints (service, version, method, path, description) VALUES
('audit', 'v1', 'GET', '/api/audit/logs', 'View audit logs'),
('audit', 'v1', 'GET', '/api/audit/auth-logs', 'View authorization logs'),
('audit', 'v1', 'GET', '/api/audit/export', 'Export audit logs');

-- =============================================================================
-- PART 4: LINK ENDPOINTS TO POLICIES
-- =============================================================================

-- Link all AUTH endpoints to auth.common policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'auth' AND p.name = 'policy.auth.common';

-- Link USER endpoints to admin.user_management policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'user' AND p.name = 'policy.admin.user_management';

-- Link ROLE endpoints to admin.user_management policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'role' AND p.name = 'policy.admin.user_management';

-- Link WORKER endpoints to worker.full policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'worker' AND p.name = 'policy.worker.full';

-- Link PAYMENT endpoints to payment.full policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'payment' AND p.name = 'policy.payment.full';

-- Link EMPLOYER endpoints to employer.full policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'employer' AND p.name = 'policy.employer.full';

-- Link BOARD endpoints to board.full policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'board' AND p.name = 'policy.board.full';

-- Link RECONCILIATION endpoints to reconciliation.full policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'reconciliation' AND p.name = 'policy.reconciliation.full';

-- Link DASHBOARD endpoints to dashboard.view policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'dashboard' AND p.name = 'policy.dashboard.view';

-- Link AUDIT endpoints to audit.view policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT e.id, p.id
FROM endpoints e
CROSS JOIN policies p
WHERE e.service = 'audit' AND p.name = 'policy.audit.view';

-- =============================================================================
-- PART 5: SEED UI PAGES
-- =============================================================================

INSERT INTO ui_pages (page_id, module, label, route, parent_id, display_order, icon, is_menu_item) VALUES
-- Top-level menu items
('DASHBOARD', 'DASHBOARD', 'Dashboard', '/dashboard', NULL, 1, 'dashboard', TRUE),
('WORKER', 'WORKER', 'Workers', '/workers', NULL, 2, 'people', TRUE),
('PAYMENT', 'PAYMENT', 'Payments', '/payments', NULL, 3, 'payments', TRUE),
('EMPLOYER', 'EMPLOYER', 'Employers', '/employers', NULL, 4, 'business', TRUE),
('BOARD', 'BOARD', 'Board', '/board', NULL, 5, 'approval', TRUE),
('RECONCILIATION', 'RECONCILIATION', 'Reconciliation', '/reconciliation', NULL, 6, 'sync', TRUE),
('ADMIN', 'SYSTEM', 'Administration', '/admin', NULL, 7, 'settings', TRUE);

-- Get parent IDs for nested pages
SET @worker_id = (SELECT id FROM ui_pages WHERE page_id = 'WORKER');
SET @payment_id = (SELECT id FROM ui_pages WHERE page_id = 'PAYMENT');
SET @employer_id = (SELECT id FROM ui_pages WHERE page_id = 'EMPLOYER');
SET @board_id = (SELECT id FROM ui_pages WHERE page_id = 'BOARD');
SET @recon_id = (SELECT id FROM ui_pages WHERE page_id = 'RECONCILIATION');
SET @admin_id = (SELECT id FROM ui_pages WHERE page_id = 'ADMIN');

-- Worker sub-pages
INSERT INTO ui_pages (page_id, module, label, route, parent_id, display_order, icon, is_menu_item) VALUES
('WORKER_LIST', 'WORKER', 'Worker List', '/workers/list', @worker_id, 1, 'list', TRUE),
('WORKER_UPLOAD', 'WORKER', 'Upload Workers', '/workers/upload', @worker_id, 2, 'upload', TRUE),
('WORKER_VALIDATE', 'WORKER', 'Validate Data', '/workers/validate', @worker_id, 3, 'check', TRUE);

-- Payment sub-pages
INSERT INTO ui_pages (page_id, module, label, route, parent_id, display_order, icon, is_menu_item) VALUES
('PAYMENT_LIST', 'PAYMENT', 'Payment List', '/payments/list', @payment_id, 1, 'list', TRUE),
('PAYMENT_PROCESS', 'PAYMENT', 'Process Payments', '/payments/process', @payment_id, 2, 'process', TRUE),
('PAYMENT_REPORTS', 'PAYMENT', 'Payment Reports', '/payments/reports', @payment_id, 3, 'report', TRUE);

-- Admin sub-pages
INSERT INTO ui_pages (page_id, module, label, route, parent_id, display_order, icon, is_menu_item) VALUES
('ADMIN_USERS', 'USER_MANAGEMENT', 'User Management', '/admin/users', @admin_id, 1, 'people', TRUE),
('ADMIN_ROLES', 'ROLE_MANAGEMENT', 'Role Management', '/admin/roles', @admin_id, 2, 'shield', TRUE),
('ADMIN_AUDIT', 'AUDIT', 'Audit Logs', '/admin/audit', @admin_id, 3, 'history', TRUE),
('ADMIN_SYSTEM', 'SYSTEM', 'System Settings', '/admin/system', @admin_id, 4, 'settings', TRUE);

-- =============================================================================
-- PART 6: SEED PAGE ACTIONS
-- =============================================================================

-- Worker Upload page actions
INSERT INTO page_actions (page_id, action_name, capability_id, label, icon, variant, display_order) VALUES
((SELECT id FROM ui_pages WHERE page_id = 'WORKER_UPLOAD'), 
 'upload', (SELECT id FROM capabilities WHERE name = 'WORKER.CREATE'), 
 'Upload File', 'upload', 'primary', 1),
((SELECT id FROM ui_pages WHERE page_id = 'WORKER_UPLOAD'), 
 'validate', (SELECT id FROM capabilities WHERE name = 'WORKER.VALIDATE'), 
 'Validate Data', 'check', 'secondary', 2);

-- Worker List page actions
INSERT INTO page_actions (page_id, action_name, capability_id, label, icon, variant, display_order) VALUES
((SELECT id FROM ui_pages WHERE page_id = 'WORKER_LIST'), 
 'create', (SELECT id FROM capabilities WHERE name = 'WORKER.CREATE'), 
 'Add Worker', 'add', 'primary', 1),
((SELECT id FROM ui_pages WHERE page_id = 'WORKER_LIST'), 
 'edit', (SELECT id FROM capabilities WHERE name = 'WORKER.UPDATE'), 
 'Edit', 'edit', 'secondary', 2),
((SELECT id FROM ui_pages WHERE page_id = 'WORKER_LIST'), 
 'delete', (SELECT id FROM capabilities WHERE name = 'WORKER.DELETE'), 
 'Delete', 'delete', 'danger', 3);

-- Payment List page actions
INSERT INTO page_actions (page_id, action_name, capability_id, label, icon, variant, display_order) VALUES
((SELECT id FROM ui_pages WHERE page_id = 'PAYMENT_LIST'), 
 'create', (SELECT id FROM capabilities WHERE name = 'PAYMENT.CREATE'), 
 'Create Payment', 'add', 'primary', 1),
((SELECT id FROM ui_pages WHERE page_id = 'PAYMENT_LIST'), 
 'approve', (SELECT id FROM capabilities WHERE name = 'PAYMENT.APPROVE'), 
 'Approve', 'check', 'success', 2),
((SELECT id FROM ui_pages WHERE page_id = 'PAYMENT_LIST'), 
 'reject', (SELECT id FROM capabilities WHERE name = 'PAYMENT.REJECT'), 
 'Reject', 'close', 'danger', 3);

-- User Management page actions
INSERT INTO page_actions (page_id, action_name, capability_id, label, icon, variant, display_order) VALUES
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_USERS'), 
 'create', (SELECT id FROM capabilities WHERE name = 'USER_MANAGEMENT.CREATE'), 
 'Create User', 'add', 'primary', 1),
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_USERS'), 
 'edit', (SELECT id FROM capabilities WHERE name = 'USER_MANAGEMENT.UPDATE'), 
 'Edit User', 'edit', 'secondary', 2),
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_USERS'), 
 'delete', (SELECT id FROM capabilities WHERE name = 'USER_MANAGEMENT.DELETE'), 
 'Delete User', 'delete', 'danger', 3);

-- =============================================================================
-- Verification Queries
-- =============================================================================

SELECT 'Migration complete!' as status;
SELECT COUNT(*) as capabilities_count FROM capabilities;
SELECT COUNT(*) as policies_count FROM policies;
SELECT COUNT(*) as endpoints_count FROM endpoints;
SELECT COUNT(*) as ui_pages_count FROM ui_pages;
SELECT COUNT(*) as page_actions_count FROM page_actions;
SELECT COUNT(*) as policy_capabilities_count FROM policy_capabilities;
SELECT COUNT(*) as endpoint_policies_count FROM endpoint_policies;
