-- Assign Component Permissions to Existing Roles
-- Migration: V12__assign_component_permissions_to_roles.sql
-- Description: Link existing roles to component permissions

-- ADMIN role gets comprehensive access
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'ADMIN' 
  AND c.component_key IN (
    'dashboard',
    'user-management', 
    'system-settings', 
    'system-logs',
    'payment-processing',
    'reconciliation-dashboard',
    'worker-payments',
    'employer-receipts',
    'board-receipts',
    'reports'
  )
  AND cp.is_active = true;

-- RECONCILIATION_OFFICER role gets reconciliation and payment access
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'RECONCILIATION_OFFICER' 
  AND c.component_key IN (
    'dashboard',
    'payment-processing', 
    'reconciliation-dashboard',
    'worker-payments',
    'reports'
  )
  AND cp.action IN ('VIEW', 'CREATE', 'EDIT', 'APPROVE', 'REJECT', 'EXPORT', 'ANALYTICS')
  AND cp.is_active = true;

-- WORKER_DATA_OPERATOR role gets worker-related access
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'WORKER_DATA_OPERATOR' 
  AND c.component_key IN (
    'dashboard',
    'worker-payments', 
    'worker-upload',
    'reconciliation-dashboard'
  )
  AND cp.action IN ('VIEW', 'EDIT', 'UPLOAD', 'EXPORT', 'ANALYTICS')
  AND cp.is_active = true;

-- EMPLOYER_RECEIPT_VALIDATOR role gets employer receipt access
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'EMPLOYER_RECEIPT_VALIDATOR' 
  AND c.component_key IN (
    'dashboard',
    'employer-receipts',
    'reconciliation-dashboard',
    'reports'
  )
  AND cp.action IN ('VIEW', 'EDIT', 'APPROVE', 'REJECT', 'EXPORT', 'ANALYTICS')
  AND cp.is_active = true;

-- BOARD_RECEIPT_APPROVER role gets board receipt access
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'BOARD_RECEIPT_APPROVER' 
  AND c.component_key IN (
    'dashboard',
    'board-receipts',
    'reconciliation-dashboard',
    'reports'
  )
  AND cp.action IN ('VIEW', 'APPROVE', 'REJECT', 'EXPORT', 'ANALYTICS')
  AND cp.is_active = true;

-- VIEWER role gets read-only access to relevant components
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'VIEWER' 
  AND c.component_key IN (
    'dashboard',
    'reconciliation-dashboard',
    'reports'
  )
  AND cp.action IN ('VIEW', 'ANALYTICS')
  AND cp.is_active = true;

-- USER role gets basic dashboard access
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'USER' 
  AND c.component_key IN ('dashboard')
  AND cp.action = 'VIEW'
  AND cp.is_active = true;

-- Add special permissions for specific role combinations
-- ADMIN gets additional MANAGE permissions
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'ADMIN' 
  AND cp.action = 'MANAGE'
  AND cp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM role_component_permissions rcp2 
    WHERE rcp2.role_id = r.id AND rcp2.component_permission_id = cp.id
  );

-- Add DELETE permissions for ADMIN where appropriate
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'ADMIN' 
  AND cp.action = 'DELETE'
  AND cp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM role_component_permissions rcp2 
    WHERE rcp2.role_id = r.id AND rcp2.component_permission_id = cp.id
  );

COMMIT;
