-- =============================================================================
-- GRANULAR PERMISSION SYSTEM - QUICK REFERENCE QUERIES
-- Use these queries to understand and verify the permission system
-- =============================================================================

-- =============================================================================
-- 1. VIEW ALL PERMISSIONS BY MODULE
-- =============================================================================
SELECT 
    module,
    name as permission_name,
    description
FROM permissions 
ORDER BY module, name;

-- =============================================================================
-- 2. VIEW PERMISSION-API ENDPOINT MAPPINGS
-- =============================================================================
SELECT 
    p.module,
    p.name as permission_name,
    CONCAT(pae.http_method, ' ', pae.api_endpoint) as api_endpoint,
    pae.description
FROM permissions p
JOIN permission_api_endpoints pae ON p.id = pae.permission_id
ORDER BY p.module, p.name;

-- =============================================================================
-- 3. VIEW ROLE ASSIGNMENTS WITH PERMISSION COUNTS
-- =============================================================================
SELECT 
    r.name as role_name,
    r.description,
    COUNT(rp.permission_id) as total_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name, r.description
ORDER BY total_permissions DESC;

-- =============================================================================
-- 4. VIEW USER-ROLE ASSIGNMENTS
-- =============================================================================
SELECT 
    u.username,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    u.email,
    r.name as assigned_role,
    u.is_active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
ORDER BY u.username;

-- =============================================================================
-- 5. FIND PERMISSIONS FOR A SPECIFIC ROLE
-- =============================================================================
-- Replace 'WORKER_DATA_OPERATOR' with the role you want to check
SELECT 
    p.module,
    p.name as permission_name,
    CONCAT(pae.http_method, ' ', pae.api_endpoint) as api_endpoint
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE r.name = 'WORKER_DATA_OPERATOR'
ORDER BY p.module, p.name;

-- =============================================================================
-- 6. FIND PERMISSIONS FOR A SPECIFIC USER
-- =============================================================================
-- Replace 'workeroperator' with the username you want to check
SELECT DISTINCT
    p.module,
    p.name as permission_name,
    CONCAT(pae.http_method, ' ', pae.api_endpoint) as api_endpoint
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE u.username = 'workeroperator'
ORDER BY p.module, p.name;

-- =============================================================================
-- 7. CHECK IF USER HAS SPECIFIC PERMISSION
-- =============================================================================
-- Replace 'workeroperator' and 'LIST_WORKER_PAYMENTS' with actual values
SELECT 
    u.username,
    p.name as permission_name,
    CASE 
        WHEN p.id IS NOT NULL THEN 'GRANTED'
        ELSE 'DENIED'
    END as access_status
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.name = 'LIST_WORKER_PAYMENTS'
WHERE u.username = 'workeroperator';

-- =============================================================================
-- 8. FIND WHICH USERS CAN ACCESS A SPECIFIC API ENDPOINT
-- =============================================================================
-- Replace with the API endpoint you want to check
SELECT DISTINCT
    u.username,
    CONCAT(u.first_name, ' ', u.last_name) as full_name,
    r.name as role_name,
    p.name as permission_name
FROM permission_api_endpoints pae
JOIN permissions p ON pae.permission_id = p.id
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN user_roles ur ON r.id = ur.role_id
JOIN users u ON ur.user_id = u.id
WHERE pae.api_endpoint = '/api/v1/worker-payments' 
AND pae.http_method = 'GET'
AND u.is_active = true
ORDER BY u.username;

-- =============================================================================
-- 9. PERMISSIONS BY MODULE SUMMARY
-- =============================================================================
SELECT 
    module,
    COUNT(*) as total_permissions,
    COUNT(DISTINCT CASE 
        WHEN name LIKE '%LIST_%' OR name LIKE '%GET_%' OR name LIKE '%VIEW_%' 
        THEN 1 END) as read_permissions,
    COUNT(DISTINCT CASE 
        WHEN name LIKE '%CREATE_%' OR name LIKE '%ADD_%' 
        THEN 1 END) as create_permissions,
    COUNT(DISTINCT CASE 
        WHEN name LIKE '%UPDATE_%' OR name LIKE '%EDIT_%' 
        THEN 1 END) as update_permissions,
    COUNT(DISTINCT CASE 
        WHEN name LIKE '%DELETE_%' OR name LIKE '%REMOVE_%' 
        THEN 1 END) as delete_permissions
FROM permissions
GROUP BY module
ORDER BY total_permissions DESC;

-- =============================================================================
-- 10. API ENDPOINTS BY HTTP METHOD
-- =============================================================================
SELECT 
    http_method,
    COUNT(*) as endpoint_count,
    COUNT(DISTINCT SUBSTRING_INDEX(api_endpoint, '/', 4)) as unique_base_paths
FROM permission_api_endpoints
GROUP BY http_method
ORDER BY endpoint_count DESC;

-- =============================================================================
-- 11. VALIDATE PERMISSION SYSTEM INTEGRITY
-- =============================================================================
-- Check for orphaned records and system integrity
SELECT 'Check Type' as check_type, 'Count' as count_value

UNION ALL
SELECT 'Permissions without API mappings', CAST(COUNT(*) as CHAR)
FROM permissions p
LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
WHERE pae.id IS NULL

UNION ALL
SELECT 'API mappings without permissions', CAST(COUNT(*) as CHAR)
FROM permission_api_endpoints pae
LEFT JOIN permissions p ON pae.permission_id = p.id
WHERE p.id IS NULL

UNION ALL
SELECT 'Users without roles', CAST(COUNT(*) as CHAR)
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL AND u.is_active = true

UNION ALL
SELECT 'Roles without permissions', CAST(COUNT(*) as CHAR)
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE rp.role_id IS NULL

UNION ALL
SELECT 'Duplicate API endpoint mappings', CAST(COUNT(*) as CHAR)
FROM (
    SELECT api_endpoint, http_method, COUNT(*) as dup_count
    FROM permission_api_endpoints
    GROUP BY api_endpoint, http_method
    HAVING COUNT(*) > 1
) duplicates;

-- =============================================================================
-- 12. SAMPLE AUTHENTICATION/AUTHORIZATION QUERIES
-- =============================================================================

-- Get all permissions for user authentication
DELIMITER //
CREATE PROCEDURE GetUserPermissions(IN p_username VARCHAR(100))
BEGIN
    SELECT DISTINCT
        p.name as permission_name,
        p.module,
        pae.api_endpoint,
        pae.http_method
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    LEFT JOIN permission_api_endpoints pae ON p.id = pae.permission_id
    WHERE u.username = p_username AND u.is_active = true
    ORDER BY p.module, p.name;
END //
DELIMITER ;

-- Check if user has specific permission
DELIMITER //
CREATE PROCEDURE CheckUserPermission(
    IN p_username VARCHAR(100), 
    IN p_permission_name VARCHAR(100)
)
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(p.id) > 0 THEN 'GRANTED'
            ELSE 'DENIED'
        END as permission_status
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.username = p_username 
    AND p.name = p_permission_name 
    AND u.is_active = true;
END //
DELIMITER ;

-- =============================================================================
-- 13. TESTING DATA VERIFICATION
-- =============================================================================

-- Verify sample users have correct role assignments
SELECT 
    'Sample User Role Verification' as verification_type,
    '' as username,
    '' as expected_role,
    '' as actual_role,
    '' as status

UNION ALL

SELECT 
    '',
    u.username,
    CASE 
        WHEN u.username = 'superadmin' THEN 'SUPER_ADMIN'
        WHEN u.username = 'workeroperator' THEN 'WORKER_DATA_OPERATOR'
        WHEN u.username = 'paymentprocessor' THEN 'PAYMENT_PROCESSOR'
        WHEN u.username = 'readonly' THEN 'READONLY_USER'
        ELSE 'UNKNOWN'
    END as expected_role,
    COALESCE(r.name, 'NO_ROLE') as actual_role,
    CASE 
        WHEN (u.username = 'superadmin' AND r.name = 'SUPER_ADMIN') OR
             (u.username = 'workeroperator' AND r.name = 'WORKER_DATA_OPERATOR') OR
             (u.username = 'paymentprocessor' AND r.name = 'PAYMENT_PROCESSOR') OR
             (u.username = 'readonly' AND r.name = 'READONLY_USER')
        THEN 'CORRECT'
        ELSE 'INCORRECT'
    END as status
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.username IN ('superadmin', 'workeroperator', 'paymentprocessor', 'readonly')
ORDER BY u.username;

-- =============================================================================
-- USAGE EXAMPLES:
-- =============================================================================
-- 1. To check permissions for a user:
-- CALL GetUserPermissions('workeroperator');

-- 2. To check if user has specific permission:
-- CALL CheckUserPermission('workeroperator', 'LIST_WORKER_PAYMENTS');

-- 3. To see all API endpoints a role can access:
-- Run query #5 with your desired role name

-- 4. To find who can access a specific API:
-- Run query #8 with your desired API endpoint
