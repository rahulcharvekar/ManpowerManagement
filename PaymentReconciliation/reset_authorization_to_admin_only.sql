-- ========================================================================================
-- AUTHORIZATION SYSTEM RESET SCRIPT
-- This script backs up all authorization data and resets to minimal admin-only setup
-- ========================================================================================

-- Set variables for backup timestamp
SET @backup_timestamp = DATE_FORMAT(NOW(), '%Y%m%d_%H%i%s');
SET @backup_suffix = CONCAT('_backup_', @backup_timestamp);

-- ========================================================================================
-- PART 1: CREATE BACKUP TABLES
-- ========================================================================================

-- Drop existing backup tables if they exist
DROP TABLE IF EXISTS roles_backup;
DROP TABLE IF EXISTS user_roles_backup;
DROP TABLE IF EXISTS capabilities_backup;
DROP TABLE IF EXISTS policies_backup;
DROP TABLE IF EXISTS policy_capabilities_backup;
DROP TABLE IF EXISTS endpoints_backup;
DROP TABLE IF EXISTS endpoint_policies_backup;
DROP TABLE IF EXISTS ui_pages_backup;
DROP TABLE IF EXISTS page_actions_backup;

-- Backup roles table
CREATE TABLE roles_backup AS SELECT * FROM roles;

-- Backup user_roles junction table
CREATE TABLE user_roles_backup AS SELECT * FROM user_roles;

-- Backup capabilities table
CREATE TABLE capabilities_backup AS SELECT * FROM capabilities;

-- Backup policies table
CREATE TABLE policies_backup AS SELECT * FROM policies;

-- Backup policy_capabilities junction table
CREATE TABLE policy_capabilities_backup AS SELECT * FROM policy_capabilities;

-- Backup endpoints table
CREATE TABLE endpoints_backup AS SELECT * FROM endpoints;

-- Backup endpoint_policies junction table
CREATE TABLE endpoint_policies_backup AS SELECT * FROM endpoint_policies;

-- Backup ui_pages table
CREATE TABLE ui_pages_backup AS SELECT * FROM ui_pages;

-- Backup page_actions table
CREATE TABLE page_actions_backup AS SELECT * FROM page_actions;

-- ========================================================================================
-- PART 2: FLUSH ALL AUTHORIZATION DATA
-- ========================================================================================

-- Delete junction tables first (due to foreign key constraints)
DELETE FROM endpoint_policies;
DELETE FROM policy_capabilities;
DELETE FROM user_roles;
DELETE FROM page_actions;

-- Delete main tables
DELETE FROM roles;
DELETE FROM capabilities;
DELETE FROM policies;
DELETE FROM endpoints;
DELETE FROM ui_pages;

-- Reset auto-increment counters
ALTER TABLE roles AUTO_INCREMENT = 1;
ALTER TABLE capabilities AUTO_INCREMENT = 1;
ALTER TABLE policies AUTO_INCREMENT = 1;
ALTER TABLE endpoints AUTO_INCREMENT = 1;
ALTER TABLE ui_pages AUTO_INCREMENT = 1;
ALTER TABLE user_roles AUTO_INCREMENT = 1;
ALTER TABLE policy_capabilities AUTO_INCREMENT = 1;
ALTER TABLE endpoint_policies AUTO_INCREMENT = 1;
ALTER TABLE page_actions AUTO_INCREMENT = 1;

-- ========================================================================================
-- PART 3: CREATE MINIMAL ADMIN-ONLY AUTHORIZATION SYSTEM
-- ========================================================================================

-- Create ADMIN role
INSERT INTO roles (name, description, is_active, created_at, updated_at) VALUES
('ADMIN', 'System Administrator with full access', TRUE, NOW(), NOW());

-- Assign ADMIN role to existing user (assuming user_id = 1)
INSERT INTO user_roles (user_id, role_id, assigned_at) VALUES
(1, 1, NOW());

-- Create comprehensive capabilities for all system functions
INSERT INTO capabilities (name, description, module, action, resource, is_active, created_at, updated_at) VALUES
-- Authentication & User Management
('AUTH_LOGIN', 'User login capability', 'AUTH', 'LOGIN', 'USER', TRUE, NOW(), NOW()),
('AUTH_LOGOUT', 'User logout capability', 'AUTH', 'LOGOUT', 'USER', TRUE, NOW(), NOW()),
('AUTH_PROFILE_READ', 'Read user profile', 'AUTH', 'READ', 'PROFILE', TRUE, NOW(), NOW()),
('AUTH_PROFILE_UPDATE', 'Update user profile', 'AUTH', 'UPDATE', 'PROFILE', TRUE, NOW(), NOW()),

-- User Management
('USER_MANAGE', 'Full user management', 'USER_MANAGEMENT', 'MANAGE', 'USER', TRUE, NOW(), NOW()),
('USER_CREATE', 'Create users', 'USER_MANAGEMENT', 'CREATE', 'USER', TRUE, NOW(), NOW()),
('USER_READ', 'Read user data', 'USER_MANAGEMENT', 'READ', 'USER', TRUE, NOW(), NOW()),
('USER_UPDATE', 'Update users', 'USER_MANAGEMENT', 'UPDATE', 'USER', TRUE, NOW(), NOW()),
('USER_DELETE', 'Delete users', 'USER_MANAGEMENT', 'DELETE', 'USER', TRUE, NOW(), NOW()),

-- Role Management
('ROLE_MANAGE', 'Full role management', 'ROLE_MANAGEMENT', 'MANAGE', 'ROLE', TRUE, NOW(), NOW()),
('ROLE_CREATE', 'Create roles', 'ROLE_MANAGEMENT', 'CREATE', 'ROLE', TRUE, NOW(), NOW()),
('ROLE_READ', 'Read role data', 'ROLE_MANAGEMENT', 'READ', 'ROLE', TRUE, NOW(), NOW()),
('ROLE_UPDATE', 'Update roles', 'ROLE_MANAGEMENT', 'UPDATE', 'ROLE', TRUE, NOW(), NOW()),
('ROLE_DELETE', 'Delete roles', 'ROLE_MANAGEMENT', 'DELETE', 'ROLE', TRUE, NOW(), NOW()),

-- Capability Management
('CAPABILITY_MANAGE', 'Full capability management', 'CAPABILITY_MANAGEMENT', 'MANAGE', 'CAPABILITY', TRUE, NOW(), NOW()),
('CAPABILITY_CREATE', 'Create capabilities', 'CAPABILITY_MANAGEMENT', 'CREATE', 'CAPABILITY', TRUE, NOW(), NOW()),
('CAPABILITY_READ', 'Read capability data', 'CAPABILITY_MANAGEMENT', 'READ', 'CAPABILITY', TRUE, NOW(), NOW()),
('CAPABILITY_UPDATE', 'Update capabilities', 'CAPABILITY_MANAGEMENT', 'UPDATE', 'CAPABILITY', TRUE, NOW(), NOW()),
('CAPABILITY_DELETE', 'Delete capabilities', 'CAPABILITY_MANAGEMENT', 'DELETE', 'CAPABILITY', TRUE, NOW(), NOW()),

-- Policy Management
('POLICY_MANAGE', 'Full policy management', 'POLICY_MANAGEMENT', 'MANAGE', 'POLICY', TRUE, NOW(), NOW()),
('POLICY_CREATE', 'Create policies', 'POLICY_MANAGEMENT', 'CREATE', 'POLICY', TRUE, NOW(), NOW()),
('POLICY_READ', 'Read policy data', 'POLICY_MANAGEMENT', 'READ', 'POLICY', TRUE, NOW(), NOW()),
('POLICY_UPDATE', 'Update policies', 'POLICY_MANAGEMENT', 'UPDATE', 'POLICY', TRUE, NOW(), NOW()),
('POLICY_DELETE', 'Delete policies', 'POLICY_MANAGEMENT', 'DELETE', 'POLICY', TRUE, NOW(), NOW()),

-- Endpoint Management
('ENDPOINT_MANAGE', 'Full endpoint management', 'ENDPOINT_MANAGEMENT', 'MANAGE', 'ENDPOINT', TRUE, NOW(), NOW()),
('ENDPOINT_CREATE', 'Create endpoints', 'ENDPOINT_MANAGEMENT', 'CREATE', 'ENDPOINT', TRUE, NOW(), NOW()),
('ENDPOINT_READ', 'Read endpoint data', 'ENDPOINT_MANAGEMENT', 'READ', 'ENDPOINT', TRUE, NOW(), NOW()),
('ENDPOINT_UPDATE', 'Update endpoints', 'ENDPOINT_MANAGEMENT', 'UPDATE', 'ENDPOINT', TRUE, NOW(), NOW()),
('ENDPOINT_DELETE', 'Delete endpoints', 'ENDPOINT_MANAGEMENT', 'DELETE', 'ENDPOINT', TRUE, NOW(), NOW()),

-- UI Page Management
('UI_PAGE_MANAGE', 'Full UI page management', 'UI_MANAGEMENT', 'MANAGE', 'PAGE', TRUE, NOW(), NOW()),
('UI_PAGE_CREATE', 'Create UI pages', 'UI_MANAGEMENT', 'CREATE', 'PAGE', TRUE, NOW(), NOW()),
('UI_PAGE_READ', 'Read UI page data', 'UI_MANAGEMENT', 'READ', 'PAGE', TRUE, NOW(), NOW()),
('UI_PAGE_UPDATE', 'Update UI pages', 'UI_MANAGEMENT', 'UPDATE', 'PAGE', TRUE, NOW(), NOW()),
('UI_PAGE_DELETE', 'Delete UI pages', 'UI_MANAGEMENT', 'DELETE', 'PAGE', TRUE, NOW(), NOW()),

-- Page Action Management
('PAGE_ACTION_MANAGE', 'Full page action management', 'UI_MANAGEMENT', 'MANAGE', 'ACTION', TRUE, NOW(), NOW()),
('PAGE_ACTION_CREATE', 'Create page actions', 'UI_MANAGEMENT', 'CREATE', 'ACTION', TRUE, NOW(), NOW()),
('PAGE_ACTION_READ', 'Read page action data', 'UI_MANAGEMENT', 'READ', 'ACTION', TRUE, NOW(), NOW()),
('PAGE_ACTION_UPDATE', 'Update page actions', 'UI_MANAGEMENT', 'UPDATE', 'ACTION', TRUE, NOW(), NOW()),
('PAGE_ACTION_DELETE', 'Delete page actions', 'UI_MANAGEMENT', 'DELETE', 'ACTION', TRUE, NOW(), NOW()),

-- System Administration
('SYSTEM_MAINTENANCE', 'System maintenance operations', 'SYSTEM', 'MAINTENANCE', 'SYSTEM', TRUE, NOW(), NOW()),
('SYSTEM_CONFIG_READ', 'Read system configuration', 'SYSTEM', 'READ', 'CONFIG', TRUE, NOW(), NOW()),
('SYSTEM_CONFIG_UPDATE', 'Update system configuration', 'SYSTEM', 'UPDATE', 'CONFIG', TRUE, NOW(), NOW()),
('SYSTEM_LOGS_READ', 'Read system logs', 'SYSTEM', 'READ', 'LOGS', TRUE, NOW(), NOW()),
('SYSTEM_BACKUP', 'System backup operations', 'SYSTEM', 'BACKUP', 'SYSTEM', TRUE, NOW(), NOW());

-- Create comprehensive admin policy that grants ALL capabilities
INSERT INTO policies (name, type, expression, description, is_active, created_at, updated_at) VALUES
('policy.admin.full_access', 'RBAC', '{"roles": ["ADMIN"]}', 'Full system access for administrators', TRUE, NOW(), NOW());

-- Link ALL capabilities to the admin policy
INSERT INTO policy_capabilities (policy_id, capability_id)
SELECT 1, id FROM capabilities WHERE is_active = TRUE;

-- Create essential endpoints for the system
INSERT INTO endpoints (service, version, method, path, description, is_active, created_at, updated_at) VALUES
-- Authentication endpoints
('auth', 'v1', 'POST', '/api/auth/login', 'User login', TRUE, NOW(), NOW()),
('auth', 'v1', 'POST', '/api/auth/logout', 'User logout', TRUE, NOW(), NOW()),
('auth', 'v1', 'GET', '/api/auth/profile', 'Get user profile', TRUE, NOW(), NOW()),
('auth', 'v1', 'PUT', '/api/auth/profile', 'Update user profile', TRUE, NOW(), NOW()),
('auth', 'v1', 'GET', '/api/auth/authorization', 'Get user authorization data', TRUE, NOW(), NOW()),

-- User management endpoints
('admin', 'v1', 'GET', '/api/admin/users', 'List users', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/users', 'Create user', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/users/{id}', 'Get user details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/users/{id}', 'Update user', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/users/{id}', 'Delete user', TRUE, NOW(), NOW()),

-- Role management endpoints
('admin', 'v1', 'GET', '/api/admin/roles', 'List roles', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/roles', 'Create role', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/roles/{id}', 'Get role details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/roles/{id}', 'Update role', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/roles/{id}', 'Delete role', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/roles/assign', 'Assign role to user', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/roles/revoke', 'Revoke role from user', TRUE, NOW(), NOW()),

-- Capability management endpoints
('admin', 'v1', 'GET', '/api/admin/capabilities', 'List capabilities', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/capabilities', 'Create capability', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/capabilities/{id}', 'Get capability details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/capabilities/{id}', 'Update capability', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/capabilities/{id}', 'Delete capability', TRUE, NOW(), NOW()),

-- Policy management endpoints
('admin', 'v1', 'GET', '/api/admin/policies', 'List policies', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/policies', 'Create policy', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/policies/{id}', 'Get policy details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/policies/{id}', 'Update policy', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/policies/{id}', 'Delete policy', TRUE, NOW(), NOW()),

-- Endpoint management endpoints
('admin', 'v1', 'GET', '/api/admin/endpoints', 'List endpoints', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/endpoints', 'Create endpoint', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/endpoints/{id}', 'Get endpoint details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/endpoints/{id}', 'Update endpoint', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/endpoints/{id}', 'Delete endpoint', TRUE, NOW(), NOW()),

-- UI management endpoints
('admin', 'v1', 'GET', '/api/admin/ui-pages', 'List UI pages', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/ui-pages', 'Create UI page', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/ui-pages/{id}', 'Get UI page details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/ui-pages/{id}', 'Update UI page', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/ui-pages/{id}', 'Delete UI page', TRUE, NOW(), NOW()),

('admin', 'v1', 'GET', '/api/admin/page-actions', 'List page actions', TRUE, NOW(), NOW()),
('admin', 'v1', 'POST', '/api/admin/page-actions', 'Create page action', TRUE, NOW(), NOW()),
('admin', 'v1', 'GET', '/api/admin/page-actions/{id}', 'Get page action details', TRUE, NOW(), NOW()),
('admin', 'v1', 'PUT', '/api/admin/page-actions/{id}', 'Update page action', TRUE, NOW(), NOW()),
('admin', 'v1', 'DELETE', '/api/admin/page-actions/{id}', 'Delete page action', TRUE, NOW(), NOW()),

-- System endpoints
('system', 'v1', 'GET', '/api/system/health', 'System health check', TRUE, NOW(), NOW()),
('system', 'v1', 'GET', '/api/system/info', 'System information', TRUE, NOW(), NOW()),
('system', 'v1', 'GET', '/api/system/logs', 'System logs', TRUE, NOW(), NOW()),
('system', 'v1', 'POST', '/api/system/backup', 'Create system backup', TRUE, NOW(), NOW());

-- Link ALL endpoints to the admin policy
INSERT INTO endpoint_policies (endpoint_id, policy_id)
SELECT id, 1 FROM endpoints WHERE is_active = TRUE;

-- Create basic UI pages for administration
-- Insert parent pages first
INSERT INTO ui_pages (page_id, module, label, route, parent_id, display_order, icon, is_menu_item, required_capability, is_active, created_at, updated_at) VALUES
-- Main sections
('DASHBOARD', 'DASHBOARD', 'Dashboard', '/dashboard', NULL, 1, 'dashboard', TRUE, NULL, TRUE, NOW(), NOW()),
('ADMIN', 'ADMIN', 'Administration', '/admin', NULL, 2, 'settings', TRUE, 'USER_MANAGE', TRUE, NOW(), NOW()),
('SYSTEM', 'SYSTEM', 'System', '/system', NULL, 3, 'cogs', TRUE, 'SYSTEM_MAINTENANCE', TRUE, NOW(), NOW());

-- Get parent IDs and insert child pages
SET @admin_id = (SELECT id FROM ui_pages WHERE page_id = 'ADMIN');
SET @system_id = (SELECT id FROM ui_pages WHERE page_id = 'SYSTEM');

INSERT INTO ui_pages (page_id, module, label, route, parent_id, display_order, icon, is_menu_item, required_capability, is_active, created_at, updated_at) VALUES
-- Admin sub-pages
('ADMIN_USERS', 'USER_MANAGEMENT', 'User Management', '/admin/users', @admin_id, 1, 'users', TRUE, 'USER_MANAGE', TRUE, NOW(), NOW()),
('ADMIN_ROLES', 'ROLE_MANAGEMENT', 'Role Management', '/admin/roles', @admin_id, 2, 'shield', TRUE, 'ROLE_MANAGE', TRUE, NOW(), NOW()),
('ADMIN_CAPABILITIES', 'CAPABILITY_MANAGEMENT', 'Capabilities', '/admin/capabilities', @admin_id, 3, 'key', TRUE, 'CAPABILITY_MANAGE', TRUE, NOW(), NOW()),
('ADMIN_POLICIES', 'POLICY_MANAGEMENT', 'Policies', '/admin/policies', @admin_id, 4, 'file-contract', TRUE, 'POLICY_MANAGE', TRUE, NOW(), NOW()),
('ADMIN_ENDPOINTS', 'ENDPOINT_MANAGEMENT', 'Endpoints', '/admin/endpoints', @admin_id, 5, 'plug', TRUE, 'ENDPOINT_MANAGE', TRUE, NOW(), NOW()),
('ADMIN_UI_PAGES', 'UI_MANAGEMENT', 'UI Pages', '/admin/ui-pages', @admin_id, 6, 'desktop', TRUE, 'UI_PAGE_MANAGE', TRUE, NOW(), NOW()),
('ADMIN_PAGE_ACTIONS', 'UI_MANAGEMENT', 'Page Actions', '/admin/page-actions', @admin_id, 7, 'mouse-pointer', TRUE, 'PAGE_ACTION_MANAGE', TRUE, NOW(), NOW()),

-- System sub-pages
('SYSTEM_LOGS', 'SYSTEM', 'System Logs', '/system/logs', @system_id, 1, 'file-alt', TRUE, 'SYSTEM_LOGS_READ', TRUE, NOW(), NOW()),
('SYSTEM_BACKUP', 'SYSTEM', 'Backup & Restore', '/system/backup', @system_id, 2, 'save', TRUE, 'SYSTEM_BACKUP', TRUE, NOW(), NOW());

-- Create page actions for key admin functions
INSERT INTO page_actions (page_id, action, label, icon, variant, capability_id, endpoint_id, display_order, is_active, created_at, updated_at) VALUES
-- User Management actions
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_USERS'), 'create', 'Create User', 'plus', 'primary', (SELECT id FROM capabilities WHERE name = 'USER_CREATE'), (SELECT id FROM endpoints WHERE path = '/api/admin/users' AND method = 'POST'), 1, TRUE, NOW(), NOW()),
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_USERS'), 'edit', 'Edit User', 'edit', 'secondary', (SELECT id FROM capabilities WHERE name = 'USER_UPDATE'), NULL, 2, TRUE, NOW(), NOW()),
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_USERS'), 'delete', 'Delete User', 'trash', 'danger', (SELECT id FROM capabilities WHERE name = 'USER_DELETE'), NULL, 3, TRUE, NOW(), NOW()),

-- Role Management actions
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_ROLES'), 'create', 'Create Role', 'plus', 'primary', (SELECT id FROM capabilities WHERE name = 'ROLE_CREATE'), (SELECT id FROM endpoints WHERE path = '/api/admin/roles' AND method = 'POST'), 1, TRUE, NOW(), NOW()),
((SELECT id FROM ui_pages WHERE page_id = 'ADMIN_ROLES'), 'assign', 'Assign Role', 'user-plus', 'secondary', (SELECT id FROM capabilities WHERE name = 'ROLE_MANAGE'), (SELECT id FROM endpoints WHERE path = '/api/admin/roles/assign' AND method = 'POST'), 2, TRUE, NOW(), NOW()),

-- System actions
((SELECT id FROM ui_pages WHERE page_id = 'SYSTEM_BACKUP'), 'backup', 'Create Backup', 'save', 'primary', (SELECT id FROM capabilities WHERE name = 'SYSTEM_BACKUP'), (SELECT id FROM endpoints WHERE path = '/api/system/backup' AND method = 'POST'), 1, TRUE, NOW(), NOW());

-- ========================================================================================
-- VERIFICATION QUERIES
-- ========================================================================================

-- Verify existing user has ADMIN role
SELECT 'Existing user with ADMIN role:' as info, u.username, u.email, r.name as role_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'ADMIN';

-- Verify admin role exists
SELECT 'Admin role created:' as info, name, description FROM roles WHERE name = 'ADMIN';

-- Count capabilities created
SELECT 'Capabilities created:' as info, COUNT(*) as count FROM capabilities;

-- Count policies created
SELECT 'Policies created:' as info, COUNT(*) as count FROM policies;

-- Count endpoints created
SELECT 'Endpoints created:' as info, COUNT(*) as count FROM endpoints;

-- Count UI pages created
SELECT 'UI pages created:' as info, COUNT(*) as count FROM ui_pages;

-- Count page actions created
SELECT 'Page actions created:' as info, COUNT(*) as count FROM page_actions;

-- ========================================================================================
-- CLEANUP INSTRUCTIONS
-- ========================================================================================

/*
To restore from backup (if needed), you can:

1. Drop current tables and rename backup tables:
   -- Repeat for all other tables (roles, capabilities, etc.)...

2. Or selectively restore data by copying from backup tables:
   INSERT INTO roles SELECT * FROM roles_backup WHERE name = 'some_role';

IMPORTANT NOTES:
- Users table is preserved as-is
- The existing user is assigned the ADMIN role
- In production, ensure the existing user has a strong password
- Backup tables are created for other authorization data for restoration if needed
- All auto-increment counters are reset to 1 (except users)
- The existing user has access to ALL system functions via ADMIN role
*/</content>
<parameter name="filePath">/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/reset_authorization_to_admin_only.sql
