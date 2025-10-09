-- =============================================================================
-- V14: Complete Migration to Capability + Policy + Service Catalog Model
-- This migration REPLACES the old RBAC system with a clean new architecture
-- NO BACKWARD COMPATIBILITY - This is a forward-only migration
-- =============================================================================

-- Step 1: Drop old tables and their dependencies
-- =============================================================================

-- Drop junction tables first (they have foreign keys)
DROP TABLE IF EXISTS role_component_permissions;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS permission_api_endpoints;

-- Drop main tables
DROP TABLE IF EXISTS component_permissions;
DROP TABLE IF EXISTS ui_components;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

-- Step 2: Create new Capability + Policy + Service Catalog tables
-- =============================================================================

-- 1) CAPABILITIES: Stable identifiers for what users can do
CREATE TABLE capabilities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) UNIQUE NOT NULL COMMENT 'Capability name, e.g., WORKER.CREATE',
    module VARCHAR(64) NOT NULL COMMENT 'Module grouping, e.g., WORKER, PAYMENT',
    action VARCHAR(64) NOT NULL COMMENT 'Action type, e.g., CREATE, READ, UPDATE',
    description TEXT COMMENT 'Human-readable description',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_module (module),
    INDEX idx_action (action),
    UNIQUE INDEX idx_module_action (module, action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Capabilities represent what users can do';

-- 2) POLICIES: RBAC/ABAC rules that grant capabilities
CREATE TABLE policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(128) UNIQUE NOT NULL COMMENT 'Policy name, e.g., policy.worker.create',
    version INTEGER NOT NULL DEFAULT 1 COMMENT 'Policy version for tracking changes',
    type ENUM('RBAC', 'ABAC', 'HYBRID') NOT NULL DEFAULT 'RBAC' COMMENT 'Policy evaluation type',
    expr_json JSON NOT NULL COMMENT 'Policy expression in JSON format',
    description TEXT COMMENT 'Human-readable policy description',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Policies define authorization rules';

-- 3) POLICY_CAPABILITIES: Many-to-many mapping
CREATE TABLE policy_capabilities (
    policy_id BIGINT NOT NULL,
    capability_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (policy_id, capability_id),
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE,
    FOREIGN KEY (capability_id) REFERENCES capabilities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Links policies to capabilities';

-- 4) ENDPOINTS: Service catalog entries (versioned API endpoints)
CREATE TABLE endpoints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(64) NOT NULL COMMENT 'Service name, e.g., worker, payment',
    version VARCHAR(64) NOT NULL DEFAULT 'v1' COMMENT 'API version, e.g., v1, v2',
    method VARCHAR(8) NOT NULL COMMENT 'HTTP method: GET, POST, PUT, DELETE, PATCH',
    path VARCHAR(256) NOT NULL COMMENT 'API path template, e.g., /api/worker/upload',
    description TEXT COMMENT 'Endpoint description',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_service_version_method_path (service, version, method, path),
    INDEX idx_service (service),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Service catalog - versioned API endpoints';

-- 5) ENDPOINT_POLICIES: Many-to-many mapping
CREATE TABLE endpoint_policies (
    endpoint_id BIGINT NOT NULL,
    policy_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (endpoint_id, policy_id),
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE CASCADE,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Links endpoints to required policies';

-- 6) ROLES: Simplified roles table (no direct permission link)
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE COMMENT 'Role name, e.g., ADMIN, WORKER',
    description VARCHAR(255) COMMENT 'Role description',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='User roles';

-- 7) USER_ROLES: User to role mapping
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Assigns roles to users';

-- 8) UI_PAGES: Frontend pages/routes for menu building
CREATE TABLE ui_pages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_id VARCHAR(64) UNIQUE NOT NULL COMMENT 'Unique page identifier',
    module VARCHAR(64) NOT NULL COMMENT 'Module grouping for menu',
    label VARCHAR(128) NOT NULL COMMENT 'Display label',
    route VARCHAR(256) COMMENT 'Frontend route path',
    parent_id BIGINT COMMENT 'Parent page for nested menus',
    display_order INTEGER NOT NULL DEFAULT 0 COMMENT 'Sort order in menu',
    icon VARCHAR(64) COMMENT 'Icon name/class',
    is_menu_item BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Show in navigation menu',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    feature_flag VARCHAR(64) COMMENT 'Optional feature flag name',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES ui_pages(id) ON DELETE SET NULL,
    INDEX idx_module (module),
    INDEX idx_active (is_active),
    INDEX idx_menu (is_menu_item, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='UI pages and navigation structure';

-- 9) PAGE_ACTIONS: Actions available on each page
CREATE TABLE page_actions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    page_id BIGINT NOT NULL,
    action_name VARCHAR(64) NOT NULL COMMENT 'Action name, e.g., create, edit, delete',
    capability_id BIGINT NOT NULL COMMENT 'Required capability',
    label VARCHAR(128) NOT NULL COMMENT 'Button/action label',
    icon VARCHAR(64) COMMENT 'Action icon',
    variant VARCHAR(32) DEFAULT 'default' COMMENT 'UI variant: primary, secondary, danger',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES ui_pages(id) ON DELETE CASCADE,
    FOREIGN KEY (capability_id) REFERENCES capabilities(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_page_action_capability (page_id, action_name, capability_id),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Actions available on UI pages';

-- 10) AUTHORIZATION_AUDIT: Audit log for authorization decisions
CREATE TABLE authorization_audit (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    endpoint_id BIGINT COMMENT 'Endpoint accessed',
    capability_id BIGINT COMMENT 'Capability checked',
    policy_id BIGINT COMMENT 'Policy evaluated',
    decision ENUM('ALLOW', 'DENY') NOT NULL,
    reason VARCHAR(255) COMMENT 'Decision reason/explanation',
    request_method VARCHAR(8) COMMENT 'HTTP method',
    request_path VARCHAR(512) COMMENT 'Request path',
    ip_address VARCHAR(45) COMMENT 'Client IP address',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE SET NULL,
    FOREIGN KEY (capability_id) REFERENCES capabilities(id) ON DELETE SET NULL,
    FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE SET NULL,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_decision (decision),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Authorization decision audit log';

-- =============================================================================
-- Step 3: Seed default roles
-- =============================================================================

INSERT INTO roles (name, description) VALUES
('ADMIN', 'System Administrator with full access'),
('RECONCILIATION_OFFICER', 'Payment Reconciliation Officer'),
('WORKER', 'Worker role with worker-related access'),
('EMPLOYER', 'Employer role with employer-related access'),
('BOARD', 'Board member with approval authority');

-- =============================================================================
-- Step 4: Migrate existing users to new role system
-- =============================================================================

-- Assign roles based on existing user.role column (only if users table exists)
-- Map legacy roles to new roles:
-- - ADMIN stays ADMIN
-- - USER maps to WORKER (default for general users)
-- - Other roles map directly if they match

-- Check if users table exists before attempting migration
SET @users_exists = (
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() 
    AND table_name = 'users'
);

-- Migrate user roles only if users table exists
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE @users_exists > 0
  AND u.role IS NOT NULL
  AND (
    -- Direct match for ADMIN
    (UPPER(u.role) = 'ADMIN' AND r.name = 'ADMIN')
    OR
    -- Map USER to WORKER role (default mapping)
    (UPPER(u.role) = 'USER' AND r.name = 'WORKER')
    OR
    -- Direct match for WORKER
    (UPPER(u.role) = 'WORKER' AND r.name = 'WORKER')
    OR
    -- Direct match for RECONCILIATION_OFFICER
    (UPPER(u.role) = 'RECONCILIATION_OFFICER' AND r.name = 'RECONCILIATION_OFFICER')
    OR
    -- Direct match for EMPLOYER
    (UPPER(u.role) = 'EMPLOYER' AND r.name = 'EMPLOYER')
    OR
    -- Direct match for BOARD
    (UPPER(u.role) = 'BOARD' AND r.name = 'BOARD')
  )
ON DUPLICATE KEY UPDATE user_id = u.id;

-- Optional: If you want to assign ADMIN to multiple roles, uncomment below
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT u.id, r.id
-- FROM users u
-- CROSS JOIN roles r
-- WHERE u.role = 'ADMIN' 
--   AND r.name IN ('ADMIN', 'RECONCILIATION_OFFICER')
-- ON DUPLICATE KEY UPDATE user_id = u.id;

-- =============================================================================
-- Verification Queries (commented out - uncomment to verify)
-- =============================================================================

-- SELECT 'Capabilities count:', COUNT(*) FROM capabilities;
-- SELECT 'Policies count:', COUNT(*) FROM policies;
-- SELECT 'Endpoints count:', COUNT(*) FROM endpoints;
-- SELECT 'UI Pages count:', COUNT(*) FROM ui_pages;
-- SELECT 'User Roles migrated:', COUNT(*) FROM user_roles;

-- =============================================================================
-- Notes:
-- =============================================================================
-- * Old PERMISSIONS table is completely removed
-- * CAPABILITIES represent "what can be done"
-- * POLICIES encode "who can do it" using RBAC/ABAC rules
-- * ENDPOINTS are in a service catalog, separate from auth
-- * UI_PAGES and PAGE_ACTIONS define frontend navigation
-- * Authorization decisions are audited in AUTHORIZATION_AUDIT
-- =============================================================================
