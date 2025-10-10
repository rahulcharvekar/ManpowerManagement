-- ============================================================================
-- AUTHORIZATION DATA AUDIT SCRIPT
-- Purpose: Identify gaps and inconsistencies in authorization data
-- ============================================================================

-- Select the database
USE paymentreconciliation;

-- ============================================================================
-- 1. CHECK CAPABILITIES WITHOUT CORRESPONDING ENDPOINTS
-- ============================================================================
SELECT '=== CAPABILITIES WITHOUT MATCHING ENDPOINTS ===' as check_name;

SELECT 
    c.id as capability_id,
    c.name as capability_name,
    c.module,
    c.action,
    COUNT(DISTINCT ep.endpoint_id) as endpoint_count,
    GROUP_CONCAT(DISTINCT e.path) as available_endpoints
FROM capabilities c
LEFT JOIN policy_capabilities pc ON c.id = pc.capability_id
LEFT JOIN endpoint_policies ep ON pc.policy_id = ep.policy_id
LEFT JOIN endpoints e ON ep.endpoint_id = e.id
    AND LOWER(e.service) = LOWER(c.module)
    AND e.method = CASE 
        WHEN c.action = 'CREATE' THEN 'POST'
        WHEN c.action = 'READ' THEN 'GET'
        WHEN c.action = 'UPDATE' THEN 'PUT'
        WHEN c.action = 'DELETE' THEN 'DELETE'
        WHEN c.action = 'LIST' THEN 'GET'
        WHEN c.action = 'APPROVE' THEN 'POST'
        WHEN c.action = 'REJECT' THEN 'POST'
        WHEN c.action = 'PROCESS' THEN 'POST'
        WHEN c.action = 'GENERATE_PAYMENTS' THEN 'POST'
        WHEN c.action = 'GENERATE_REPORTS' THEN 'GET'
        WHEN c.action = 'VIEW' THEN 'GET'
        WHEN c.action = 'VIEW_STATS' THEN 'GET'
        WHEN c.action = 'VALIDATE' THEN 'POST'
        WHEN c.action = 'DOWNLOAD' THEN 'GET'
        WHEN c.action = 'EXPORT' THEN 'GET'
        WHEN c.action = 'SEND_TO_BOARD' THEN 'POST'
        WHEN c.action = 'VIEW_RECEIPTS' THEN 'GET'
        WHEN c.action = 'VALIDATE_RECEIPTS' THEN 'POST'
        WHEN c.action = 'VIEW_CONFIG' THEN 'GET'
        WHEN c.action = 'UPDATE_CONFIG' THEN 'PUT'
        WHEN c.action = 'MAINTENANCE' THEN 'POST'
        WHEN c.action = 'DATABASE_CLEANUP' THEN 'POST'
        WHEN c.action = 'VIEW_LOGS' THEN 'GET'
        WHEN c.action = 'VIEW_AUTH_LOGS' THEN 'GET'
        WHEN c.action = 'PERFORM' THEN 'POST'
        WHEN c.action = 'ACTIVATE' THEN 'PATCH'
        WHEN c.action = 'ASSIGN_USERS' THEN 'POST'
        ELSE 'GET'
    END
WHERE c.is_active = 1
GROUP BY c.id, c.name, c.module, c.action
HAVING endpoint_count = 0
ORDER BY c.module, c.action;

-- ============================================================================
-- 2. CHECK POLICIES WITHOUT CAPABILITIES
-- ============================================================================
SELECT '=== POLICIES WITHOUT CAPABILITIES ===' as check_name;

SELECT 
    p.id as policy_id,
    p.name as policy_name,
    p.type,
    p.expression,
    COUNT(pc.capability_id) as capability_count
FROM policies p
LEFT JOIN policy_capabilities pc ON p.id = pc.policy_id
WHERE p.is_active = 1
GROUP BY p.id, p.name, p.type, p.expression
HAVING capability_count = 0
ORDER BY p.name;

-- ============================================================================
-- 3. CHECK POLICIES WITHOUT ENDPOINTS
-- ============================================================================
SELECT '=== POLICIES WITHOUT ENDPOINTS ===' as check_name;

SELECT 
    p.id as policy_id,
    p.name as policy_name,
    p.type,
    p.expression,
    COUNT(ep.endpoint_id) as endpoint_count
FROM policies p
LEFT JOIN endpoint_policies ep ON p.id = ep.policy_id
WHERE p.is_active = 1
GROUP BY p.id, p.name, p.type, p.expression
HAVING endpoint_count = 0
ORDER BY p.name;

-- ============================================================================
-- 4. CHECK PAGEACTIONS WITHOUT ENDPOINTS
-- ============================================================================
SELECT '=== PAGE ACTIONS WITHOUT ENDPOINTS ===' as check_name;

SELECT 
    pa.id as action_id,
    pa.label as action_label,
    pa.action as action_type,
    c.name as required_capability,
    p.route as page_route,
    pa.endpoint_id
FROM page_actions pa
JOIN capabilities c ON pa.capability_id = c.id
JOIN ui_pages p ON pa.page_id = p.id
WHERE pa.is_active = 1
    AND pa.endpoint_id IS NULL
ORDER BY p.route, pa.display_order;

-- ============================================================================
-- 5. CHECK CAPABILITY-ENDPOINT CONSISTENCY
-- ============================================================================
SELECT '=== CAPABILITIES WITH POLICIES BUT MISSING ENDPOINTS ===' as check_name;

SELECT 
    c.name as capability,
    c.module,
    c.action,
    COUNT(DISTINCT pc.policy_id) as policy_count,
    COUNT(DISTINCT ep.endpoint_id) as endpoint_count,
    GROUP_CONCAT(DISTINCT p.name) as policies
FROM capabilities c
JOIN policy_capabilities pc ON c.id = pc.capability_id
JOIN policies p ON pc.policy_id = p.id AND p.is_active = 1
LEFT JOIN endpoint_policies ep ON pc.policy_id = ep.policy_id
    AND EXISTS (
        SELECT 1 FROM endpoints e 
        WHERE e.id = ep.endpoint_id 
        AND LOWER(e.service) = LOWER(c.module)
    )
WHERE c.is_active = 1
GROUP BY c.id, c.name, c.module, c.action
HAVING policy_count > 0 AND endpoint_count = 0
ORDER BY c.module, c.action;

-- ============================================================================
-- 6. CHECK ORPHANED ENDPOINTS (NOT LINKED TO ANY POLICY)
-- ============================================================================
SELECT '=== ENDPOINTS WITHOUT POLICIES ===' as check_name;

SELECT 
    e.id as endpoint_id,
    e.service,
    e.version,
    e.method,
    e.path,
    e.description,
    COUNT(ep.policy_id) as policy_count
FROM endpoints e
LEFT JOIN endpoint_policies ep ON e.id = ep.endpoint_id
WHERE e.is_active = 1
GROUP BY e.id, e.service, e.version, e.method, e.path, e.description
HAVING policy_count = 0
ORDER BY e.service, e.method, e.path;

-- ============================================================================
-- 7. CHECK ROLES WITHOUT POLICIES
-- ============================================================================
SELECT '=== ROLES WITHOUT MATCHING POLICIES ===' as check_name;

SELECT 
    r.id as role_id,
    r.name as role_name,
    r.description,
    COUNT(DISTINCT p.id) as matching_policies
FROM roles r
LEFT JOIN policies p ON p.is_active = 1 
    AND (
        p.expression LIKE CONCAT('%"', r.name, '"%')
        OR p.expression LIKE CONCAT('%''', r.name, '''%')
    )
WHERE r.is_active = 1
GROUP BY r.id, r.name, r.description
HAVING matching_policies = 0
ORDER BY r.name;

-- ============================================================================
-- 8. CHECK USER ROLE ASSIGNMENTS
-- ============================================================================
SELECT '=== USERS WITH ROLE ASSIGNMENTS ===' as check_name;

SELECT 
    u.id as user_id,
    u.username,
    COUNT(DISTINCT ur.role_id) as role_count,
    GROUP_CONCAT(DISTINCT r.name) as roles
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, u.username
ORDER BY role_count DESC, u.username;

-- ============================================================================
-- 9. SUMMARY STATISTICS
-- ============================================================================
SELECT '=== SUMMARY STATISTICS ===' as check_name;

SELECT 
    'Total Users' as metric,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'Total Active Roles' as metric,
    COUNT(*) as count
FROM roles WHERE is_active = 1
UNION ALL
SELECT 
    'Total Active Policies' as metric,
    COUNT(*) as count
FROM policies WHERE is_active = 1
UNION ALL
SELECT 
    'Total Active Capabilities' as metric,
    COUNT(*) as count
FROM capabilities WHERE is_active = 1
UNION ALL
SELECT 
    'Total Active Endpoints' as metric,
    COUNT(*) as count
FROM endpoints WHERE is_active = 1
UNION ALL
SELECT 
    'Total Active UI Pages' as metric,
    COUNT(*) as count
FROM ui_pages WHERE is_active = 1
UNION ALL
SELECT 
    'Total Active Page Actions' as metric,
    COUNT(*) as count
FROM page_actions WHERE is_active = 1
UNION ALL
SELECT 
    'Total Policy-Capability Links' as metric,
    COUNT(*) as count
FROM policy_capabilities pc
JOIN policies p ON pc.policy_id = p.id AND p.is_active = 1
UNION ALL
SELECT 
    'Total Endpoint-Policy Links' as metric,
    COUNT(*) as count
FROM endpoint_policies ep
JOIN policies p ON ep.policy_id = p.id AND p.is_active = 1;

-- ============================================================================
-- 10. DETAILED AUTHORIZATION CHAIN FOR ADMIN ROLE
-- ============================================================================
SELECT '=== ADMIN ROLE AUTHORIZATION CHAIN ===' as check_name;

SELECT 
    'ADMIN' as role_name,
    p.name as policy_name,
    c.name as capability_name,
    e.method as endpoint_method,
    e.path as endpoint_path,
    CASE 
        WHEN pc.id IS NOT NULL AND ep.id IS NOT NULL THEN '✓ Complete'
        WHEN pc.id IS NOT NULL AND ep.id IS NULL THEN '✗ Missing Endpoint'
        WHEN pc.id IS NULL AND ep.id IS NOT NULL THEN '✗ Missing Capability'
        ELSE '✗ Not Linked'
    END as status
FROM policies p
LEFT JOIN policy_capabilities pc ON p.id = pc.policy_id
LEFT JOIN capabilities c ON pc.capability_id = c.id
LEFT JOIN endpoint_policies ep ON p.id = ep.policy_id
LEFT JOIN endpoints e ON ep.endpoint_id = e.id
WHERE p.is_active = 1
    AND p.expression LIKE '%"ADMIN"%'
ORDER BY p.name, c.module, c.action, e.service, e.path
LIMIT 50;

SELECT '=== AUDIT COMPLETE ===' as check_name;
