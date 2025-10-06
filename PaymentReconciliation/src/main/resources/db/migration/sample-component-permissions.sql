-- Component-Based Permission System Sample Data
-- This script demonstrates the new component-based permission system

-- Insert UI Components
INSERT INTO ui_components (component_key, display_name, description, category, route, icon, display_order, is_active) VALUES
('user-management', 'User Management', 'Manage system users and their roles', 'Administration', '/admin/users', '👥', 10, true),
('system-settings', 'System Settings', 'Configure system-wide settings', 'Administration', '/admin/settings', '⚙️', 20, true),
('payment-processing', 'Payment Processing', 'Process and manage payments', 'Reconciliation', '/payments', '💳', 30, true),
('reconciliation-dashboard', 'Reconciliation Dashboard', 'View reconciliation status and reports', 'Reconciliation', '/reconciliation', '📊', 40, true),
('worker-payments', 'Worker Payments', 'View and manage worker payment data', 'Worker', '/worker/payments', '💵', 50, true),
('worker-upload', 'Worker Data Upload', 'Upload worker payment files', 'Worker', '/worker/upload', '📁', 60, true),
('employer-receipts', 'Employer Receipts', 'View and validate employer receipts', 'Employer', '/employer/receipts', '🧾', 70, true),
('board-receipts', 'Board Receipts', 'View and approve board receipts', 'Board', '/board/receipts', '📄', 80, true);

-- Insert Component Permissions (linking components to actions)
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'VIEW',
    'Can view ' || c.display_name,
    true
FROM ui_components c;

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'CREATE',
    'Can create records in ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('user-management', 'payment-processing', 'worker-upload');

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'EDIT',
    'Can edit records in ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('user-management', 'system-settings', 'payment-processing', 'worker-payments');

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'DELETE',
    'Can delete records from ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('user-management', 'worker-payments');

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'APPROVE',
    'Can approve items in ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('payment-processing', 'employer-receipts', 'board-receipts');

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'UPLOAD',
    'Can upload files to ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('worker-upload');

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'EXPORT',
    'Can export data from ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('reconciliation-dashboard', 'worker-payments', 'employer-receipts');

INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    c.id,
    'MANAGE',
    'Full management access to ' || c.display_name,
    true
FROM ui_components c
WHERE c.component_key IN ('user-management', 'system-settings');

-- Link Role Component Permissions to Roles
-- ADMIN role gets full access to user-management and system-settings
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'ADMIN' 
  AND c.component_key IN ('user-management', 'system-settings')
  AND cp.is_active = true;

-- RECONCILIATION_OFFICER role gets access to reconciliation and payment processing
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'RECONCILIATION_OFFICER' 
  AND c.component_key IN ('payment-processing', 'reconciliation-dashboard')
  AND cp.is_active = true;

-- WORKER_DATA_OPERATOR role gets access to worker-related components
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'WORKER_DATA_OPERATOR' 
  AND c.component_key IN ('worker-payments', 'worker-upload')
  AND cp.is_active = true;

-- EMPLOYER_RECEIPT_VALIDATOR role gets access to employer receipts
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'EMPLOYER_RECEIPT_VALIDATOR' 
  AND c.component_key IN ('employer-receipts')
  AND cp.is_active = true;

-- BOARD_RECEIPT_APPROVER role gets access to board receipts
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'BOARD_RECEIPT_APPROVER' 
  AND c.component_key IN ('board-receipts')
  AND cp.is_active = true;

-- Example: Give ADMIN read access to all components for monitoring
INSERT INTO role_component_permissions (role_id, component_permission_id, is_active)
SELECT 
    r.id,
    cp.id,
    true
FROM roles r
CROSS JOIN component_permissions cp
WHERE r.name = 'ADMIN' 
  AND cp.action = 'VIEW'
  AND cp.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM role_component_permissions rcp2 
    WHERE rcp2.role_id = r.id AND rcp2.component_permission_id = cp.id
  );

COMMIT;
