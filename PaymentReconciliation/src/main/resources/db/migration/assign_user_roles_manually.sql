-- =============================================================================
-- Manual User Role Assignment Script
-- Use this to assign specific roles to users after migration
-- =============================================================================

-- First, check current user roles in old system
SELECT 
    id,
    username,
    role as old_role,
    email
FROM users
ORDER BY id;

-- Check what roles are available in new system
SELECT * FROM roles;

-- Check current role assignments
SELECT 
    u.id,
    u.username,
    u.role as old_role,
    r.name as new_role
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
ORDER BY u.id;

-- =============================================================================
-- Manual Role Assignments (uncomment and modify as needed)
-- =============================================================================

-- Assign specific user to ADMIN role
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 1, id FROM roles WHERE name = 'ADMIN'
-- ON DUPLICATE KEY UPDATE user_id = 1;

-- Assign user to RECONCILIATION_OFFICER role
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 4, id FROM roles WHERE name = 'RECONCILIATION_OFFICER'
-- ON DUPLICATE KEY UPDATE user_id = 4;

-- Assign user to EMPLOYER role
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 5, id FROM roles WHERE name = 'EMPLOYER'
-- ON DUPLICATE KEY UPDATE user_id = 5;

-- Assign user to BOARD role
-- INSERT INTO user_roles (user_id, role_id)
-- SELECT 6, id FROM roles WHERE name = 'BOARD'
-- ON DUPLICATE KEY UPDATE user_id = 6;

-- =============================================================================
-- Suggested Assignments Based on Username
-- =============================================================================

-- superadmin → ADMIN
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'superadmin' AND r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE user_id = u.id;

-- usermanager → ADMIN (user management)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'usermanager' AND r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE user_id = u.id;

-- workeroperator → WORKER + RECONCILIATION_OFFICER
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'workeroperator' AND r.name IN ('WORKER', 'RECONCILIATION_OFFICER')
ON DUPLICATE KEY UPDATE user_id = u.id;

-- paymentprocessor → RECONCILIATION_OFFICER
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'paymentprocessor' AND r.name = 'RECONCILIATION_OFFICER'
ON DUPLICATE KEY UPDATE user_id = u.id;

-- employercoord → EMPLOYER
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'employercoord' AND r.name = 'EMPLOYER'
ON DUPLICATE KEY UPDATE user_id = u.id;

-- =============================================================================
-- Verification Query
-- =============================================================================

SELECT 
    u.id,
    u.username,
    u.role as old_role,
    GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ', ') as new_roles,
    COUNT(r.id) as role_count
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username, u.role
ORDER BY u.id;

-- Show users without any roles
SELECT 
    u.id,
    u.username,
    u.role as old_role,
    'NO ROLE ASSIGNED!' as warning
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;
