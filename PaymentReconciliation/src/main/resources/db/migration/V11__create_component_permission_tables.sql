-- Component-Based Permission System Tables
-- Migration: V11__create_component_permission_tables.sql
-- Description: Create tables for component-based permission system

-- Create UI Components table
CREATE TABLE ui_components (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    component_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier for the component (e.g., user-management)',
    display_name VARCHAR(200) NOT NULL COMMENT 'Human-readable name for the component',
    description TEXT COMMENT 'Description of what the component does',
    category VARCHAR(50) COMMENT 'Category for grouping (e.g., Administration, Reconciliation)',
    route VARCHAR(200) COMMENT 'Frontend route path for the component',
    icon VARCHAR(10) COMMENT 'Icon representation (emoji or icon class)',
    display_order INT DEFAULT 0 COMMENT 'Order for displaying in navigation',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether the component is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_component_key (component_key),
    INDEX idx_category (category),
    INDEX idx_active_order (is_active, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='UI Components that can have permissions assigned';

-- Create Component Permissions table
CREATE TABLE component_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    component_id BIGINT NOT NULL COMMENT 'Reference to ui_components table',
    action VARCHAR(50) NOT NULL COMMENT 'Action type (VIEW, CREATE, EDIT, DELETE, etc.)',
    description TEXT COMMENT 'Description of what this permission allows',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this permission is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (component_id) REFERENCES ui_components(id) ON DELETE CASCADE,
    UNIQUE KEY unique_component_action (component_id, action),
    INDEX idx_component_id (component_id),
    INDEX idx_action (action),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Specific permissions (actions) available for each UI component';

-- Create Role Component Permissions table
CREATE TABLE role_component_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL COMMENT 'Reference to roles table',
    component_permission_id BIGINT NOT NULL COMMENT 'Reference to component_permissions table',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this role-permission assignment is active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (component_permission_id) REFERENCES component_permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_component_permission (role_id, component_permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_component_permission_id (component_permission_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Assignment of component permissions to roles';

-- Insert initial UI components
INSERT INTO ui_components (component_key, display_name, description, category, route, icon, display_order, is_active) VALUES
('dashboard', 'Dashboard', 'Main dashboard with overview and statistics', 'General', '/dashboard', '🏠', 1, true),
('user-management', 'User Management', 'Manage system users, roles, and permissions', 'Administration', '/admin/users', '👥', 10, true),
('system-settings', 'System Settings', 'Configure system-wide settings and parameters', 'Administration', '/admin/settings', '⚙️', 20, true),
('system-logs', 'System Logs', 'View and analyze system logs and audit trails', 'Administration', '/admin/logs', '📋', 30, true),
('payment-processing', 'Payment Processing', 'Process, validate, and manage payments', 'Reconciliation', '/payments', '💳', 40, true),
('reconciliation-dashboard', 'Reconciliation Dashboard', 'View reconciliation status, reports, and analytics', 'Reconciliation', '/reconciliation', '📊', 50, true),
('worker-payments', 'Worker Payments', 'View and manage worker payment data and records', 'Worker', '/worker/payments', '💵', 60, true),
('worker-upload', 'Worker Data Upload', 'Upload and process worker payment files', 'Worker', '/worker/upload', '📁', 70, true),
('employer-receipts', 'Employer Receipts', 'View, validate, and manage employer receipts', 'Employer', '/employer/receipts', '🧾', 80, true),
('board-receipts', 'Board Receipts', 'View, review, and approve board receipts', 'Board', '/board/receipts', '📄', 90, true),
('reports', 'Reports', 'Generate and view various system reports', 'Reporting', '/reports', '📈', 100, true);

-- Insert component permissions for all components
-- VIEW permission for all components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'VIEW',
    CONCAT('Can view and access ', display_name),
    true
FROM ui_components;

-- CREATE permission for applicable components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'CREATE',
    CONCAT('Can create new records in ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('user-management', 'payment-processing', 'worker-upload', 'system-settings');

-- EDIT permission for applicable components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'EDIT',
    CONCAT('Can edit and modify records in ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('user-management', 'system-settings', 'payment-processing', 'worker-payments', 'employer-receipts');

-- DELETE permission for applicable components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'DELETE',
    CONCAT('Can delete records from ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('user-management', 'worker-payments', 'system-logs');

-- APPROVE permission for workflow components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'APPROVE',
    CONCAT('Can approve items in ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('payment-processing', 'employer-receipts', 'board-receipts');

-- REJECT permission for workflow components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'REJECT',
    CONCAT('Can reject items in ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('payment-processing', 'employer-receipts', 'board-receipts');

-- UPLOAD permission for file components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'UPLOAD',
    CONCAT('Can upload files to ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('worker-upload');

-- EXPORT permission for data components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'EXPORT',
    CONCAT('Can export data from ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('reconciliation-dashboard', 'worker-payments', 'employer-receipts', 'reports', 'system-logs');

-- MANAGE permission for administrative components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'MANAGE',
    CONCAT('Full management access to ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('user-management', 'system-settings');

-- ANALYTICS permission for dashboard components
INSERT INTO component_permissions (component_id, action, description, is_active)
SELECT 
    id,
    'ANALYTICS',
    CONCAT('Can view analytics and insights in ', display_name),
    true
FROM ui_components 
WHERE component_key IN ('dashboard', 'reconciliation-dashboard', 'reports');

COMMIT;
