-- Migration to create permission-based RBAC system
-- V10__create_permission_based_rbac.sql

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    module VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Add legacy_role column to users table for backward compatibility
ALTER TABLE users ADD COLUMN IF NOT EXISTS legacy_role VARCHAR(50);

-- Update legacy_role column with current role values
UPDATE users SET legacy_role = role WHERE legacy_role IS NULL;

-- Insert default permissions
INSERT IGNORE INTO permissions (name, description, module) VALUES
-- Worker module permissions
('READ_WORKER_DATA', 'View worker uploaded data', 'WORKER'),
('UPLOAD_WORKER_DATA', 'Upload worker data files', 'WORKER'),
('VALIDATE_WORKER_DATA', 'Validate worker data entries', 'WORKER'),
('GENERATE_WORKER_PAYMENTS', 'Generate payment requests for workers', 'WORKER'),
('DELETE_WORKER_DATA', 'Delete worker data entries', 'WORKER'),

-- Payment module permissions
('READ_PAYMENTS', 'View payment information', 'PAYMENT'),
('PROCESS_PAYMENTS', 'Process payment requests', 'PAYMENT'),
('APPROVE_PAYMENTS', 'Approve payment requests', 'PAYMENT'),
('REJECT_PAYMENTS', 'Reject payment requests', 'PAYMENT'),
('GENERATE_PAYMENT_REPORTS', 'Generate payment reports', 'PAYMENT'),

-- Employer module permissions
('READ_EMPLOYER_RECEIPTS', 'View employer payment receipts', 'EMPLOYER'),
('VALIDATE_EMPLOYER_RECEIPTS', 'Validate employer payment receipts', 'EMPLOYER'),
('SEND_TO_BOARD', 'Send receipts to board for approval', 'EMPLOYER'),

-- Board module permissions
('READ_BOARD_RECEIPTS', 'View board receipts', 'BOARD'),
('APPROVE_BOARD_RECEIPTS', 'Approve board receipts', 'BOARD'),
('REJECT_BOARD_RECEIPTS', 'Reject board receipts', 'BOARD'),
('GENERATE_BOARD_REPORTS', 'Generate board reports', 'BOARD'),

-- Reconciliation module permissions
('READ_RECONCILIATIONS', 'View reconciliation data', 'RECONCILIATION'),
('PERFORM_RECONCILIATION', 'Perform payment reconciliation', 'RECONCILIATION'),
('GENERATE_RECONCILIATION_REPORTS', 'Generate reconciliation reports', 'RECONCILIATION'),

-- System/Admin permissions
('MANAGE_USERS', 'Manage user accounts', 'SYSTEM'),
('MANAGE_ROLES', 'Manage roles and permissions', 'SYSTEM'),
('VIEW_SYSTEM_LOGS', 'View system audit logs', 'SYSTEM'),
('SYSTEM_MAINTENANCE', 'Perform system maintenance tasks', 'SYSTEM'),
('DATABASE_CLEANUP', 'Perform database cleanup operations', 'SYSTEM');

-- Insert default roles
INSERT IGNORE INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('RECONCILIATION_OFFICER', 'Payment Reconciliation Officer'),
('WORKER', 'Worker with access to worker-related functions'),
('EMPLOYER', 'Employer with access to employer-related functions'),
('BOARD', 'Board Member with access to board-related functions');

-- Assign permissions to ADMIN role (all permissions)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';

-- Assign permissions to RECONCILIATION_OFFICER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'RECONCILIATION_OFFICER'
AND p.name IN (
    'READ_WORKER_DATA', 'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS',
    'READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS', 'GENERATE_PAYMENT_REPORTS',
    'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD',
    'READ_RECONCILIATIONS', 'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS'
);

-- Assign permissions to WORKER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'WORKER'
AND p.name IN (
    'READ_WORKER_DATA', 'UPLOAD_WORKER_DATA', 'READ_PAYMENTS'
);

-- Assign permissions to EMPLOYER role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'EMPLOYER'
AND p.name IN (
    'READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD',
    'READ_PAYMENTS'
);

-- Assign permissions to BOARD role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'BOARD'
AND p.name IN (
    'READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS'
);

-- Migrate existing users to new role system
-- Assign roles to users based on their legacy_role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.legacy_role = r.name
AND u.legacy_role IS NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
