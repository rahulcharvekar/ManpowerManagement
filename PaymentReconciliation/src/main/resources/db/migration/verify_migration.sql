-- =============================================================================
-- Verification Script for Capability+Policy+Service Catalog Migration
-- Run this after V14 and V15 migrations to verify everything is correct
-- =============================================================================

-- 1. Check that old tables are gone
SELECT 
    'Old tables check' as test,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - Old tables removed'
        ELSE '❌ FAIL - Old tables still exist'
    END as result
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('permissions', 'role_permissions', 'component_permissions', 'permission_api_endpoints');

-- 2. Check that new tables exist
SELECT 
    'New tables check' as test,
    CASE 
        WHEN COUNT(*) = 10 THEN '✅ PASS - All 10 new tables created'
        ELSE CONCAT('❌ FAIL - Only ', COUNT(*), ' of 10 tables exist')
    END as result
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN (
    'capabilities', 'policies', 'policy_capabilities', 
    'endpoints', 'endpoint_policies', 
    'roles', 'user_roles', 
    'ui_pages', 'page_actions', 'authorization_audit'
  );

-- 3. Check capabilities count
SELECT 
    'Capabilities seeded' as test,
    CASE 
        WHEN COUNT(*) >= 70 THEN CONCAT('✅ PASS - ', COUNT(*), ' capabilities')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' capabilities (expected 77)')
    END as result
FROM capabilities;

-- 4. Check policies count
SELECT 
    'Policies seeded' as test,
    CASE 
        WHEN COUNT(*) >= 10 THEN CONCAT('✅ PASS - ', COUNT(*), ' policies')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' policies (expected 12)')
    END as result
FROM policies;

-- 5. Check endpoints count
SELECT 
    'Endpoints seeded' as test,
    CASE 
        WHEN COUNT(*) >= 50 THEN CONCAT('✅ PASS - ', COUNT(*), ' endpoints')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' endpoints (expected 60+)')
    END as result
FROM endpoints;

-- 6. Check UI pages count
SELECT 
    'UI Pages seeded' as test,
    CASE 
        WHEN COUNT(*) >= 15 THEN CONCAT('✅ PASS - ', COUNT(*), ' UI pages')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' UI pages (expected 16)')
    END as result
FROM ui_pages;

-- 7. Check page actions count
SELECT 
    'Page Actions seeded' as test,
    CASE 
        WHEN COUNT(*) >= 8 THEN CONCAT('✅ PASS - ', COUNT(*), ' page actions')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' page actions (expected 10+)')
    END as result
FROM page_actions;

-- 8. Check roles exist
SELECT 
    'Roles created' as test,
    CASE 
        WHEN COUNT(*) >= 5 THEN CONCAT('✅ PASS - ', COUNT(*), ' roles')
        ELSE CONCAT('❌ FAIL - Only ', COUNT(*), ' roles (expected 5)')
    END as result
FROM roles;

-- 9. Check users have roles assigned
SELECT 
    'User roles assigned' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN CONCAT('✅ PASS - ', COUNT(*), ' user-role assignments')
        ELSE '❌ FAIL - No users assigned to roles'
    END as result
FROM user_roles;

-- 10. Check policy-capability mappings
SELECT 
    'Policy-Capability links' as test,
    CASE 
        WHEN COUNT(*) >= 100 THEN CONCAT('✅ PASS - ', COUNT(*), ' links')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' links (expected 100+)')
    END as result
FROM policy_capabilities;

-- 11. Check endpoint-policy mappings
SELECT 
    'Endpoint-Policy links' as test,
    CASE 
        WHEN COUNT(*) >= 50 THEN CONCAT('✅ PASS - ', COUNT(*), ' links')
        ELSE CONCAT('⚠️  WARNING - Only ', COUNT(*), ' links (expected 60+)')
    END as result
FROM endpoint_policies;

-- =============================================================================
-- Detailed Counts by Module
-- =============================================================================

SELECT '=== CAPABILITIES BY MODULE ===' as section;

SELECT 
    module,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT action ORDER BY action SEPARATOR ', ') as actions
FROM capabilities
GROUP BY module
ORDER BY module;

SELECT '=== POLICIES BY TYPE ===' as section;

SELECT 
    type,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count
FROM policies
GROUP BY type;

SELECT '=== ENDPOINTS BY SERVICE ===' as section;

SELECT 
    service,
    version,
    COUNT(*) as count,
    COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active_count
FROM endpoints
GROUP BY service, version
ORDER BY service, version;

SELECT '=== ROLES WITH USER COUNTS ===' as section;

SELECT 
    r.name,
    r.description,
    COUNT(DISTINCT ur.user_id) as user_count
FROM roles r
LEFT JOIN user_roles ur ON r.id = ur.role_id
GROUP BY r.id, r.name, r.description
ORDER BY r.name;

SELECT '=== UI PAGES HIERARCHY ===' as section;

WITH RECURSIVE page_tree AS (
    SELECT 
        id,
        page_id,
        module,
        label,
        route,
        parent_id,
        display_order,
        0 as level,
        CAST(page_id AS CHAR(200)) as path
    FROM ui_pages
    WHERE parent_id IS NULL AND is_active = TRUE
    
    UNION ALL
    
    SELECT 
        p.id,
        p.page_id,
        p.module,
        p.label,
        p.route,
        p.parent_id,
        p.display_order,
        pt.level + 1,
        CONCAT(pt.path, ' > ', p.page_id)
    FROM ui_pages p
    JOIN page_tree pt ON p.parent_id = pt.id
    WHERE p.is_active = TRUE
)
SELECT 
    CONCAT(REPEAT('  ', level), label) as hierarchy,
    route,
    module,
    display_order,
    (SELECT COUNT(*) FROM page_actions pa WHERE pa.page_id = page_tree.id AND pa.is_active = TRUE) as action_count
FROM page_tree
ORDER BY level, display_order;

-- =============================================================================
-- Sample Policy Evaluations
-- =============================================================================

SELECT '=== ADMIN CAPABILITIES (First 10) ===' as section;

SELECT DISTINCT c.name, c.module, c.action
FROM capabilities c
JOIN policy_capabilities pc ON c.id = pc.capability_id
JOIN policies p ON pc.policy_id = p.id
WHERE p.name = 'policy.admin.full_access'
  AND p.is_active = TRUE
ORDER BY c.module, c.action
LIMIT 10;

SELECT '=== WORKER ROLE CAPABILITIES ===' as section;

SELECT DISTINCT c.name, c.module, c.action
FROM capabilities c
JOIN policy_capabilities pc ON c.id = pc.capability_id
JOIN policies p ON pc.policy_id = p.id
WHERE p.is_active = TRUE
  AND p.expr_json LIKE '%WORKER%'
ORDER BY c.module, c.action;

SELECT '=== RECONCILIATION_OFFICER CAPABILITIES (Sample) ===' as section;

SELECT DISTINCT c.name, c.module, c.action
FROM capabilities c
JOIN policy_capabilities pc ON c.id = pc.capability_id
JOIN policies p ON pc.policy_id = p.id
WHERE p.is_active = TRUE
  AND p.expr_json LIKE '%RECONCILIATION_OFFICER%'
ORDER BY c.module, c.action
LIMIT 15;

-- =============================================================================
-- Endpoint Access Examples
-- =============================================================================

SELECT '=== WORKER SERVICE ENDPOINTS ===' as section;

SELECT 
    e.method,
    e.path,
    e.version,
    GROUP_CONCAT(p.name SEPARATOR ', ') as required_policies
FROM endpoints e
JOIN endpoint_policies ep ON e.id = ep.endpoint_id
JOIN policies p ON ep.policy_id = p.id
WHERE e.service = 'worker'
  AND e.is_active = TRUE
GROUP BY e.id, e.method, e.path, e.version
ORDER BY e.path;

SELECT '=== USER MANAGEMENT ENDPOINTS ===' as section;

SELECT 
    e.method,
    e.path,
    e.version,
    GROUP_CONCAT(p.name SEPARATOR ', ') as required_policies
FROM endpoints e
JOIN endpoint_policies ep ON e.id = ep.endpoint_id
JOIN policies p ON ep.policy_id = p.id
WHERE e.service = 'user'
  AND e.is_active = TRUE
GROUP BY e.id, e.method, e.path, e.version
ORDER BY e.path;

-- =============================================================================
-- Integrity Checks
-- =============================================================================

SELECT '=== INTEGRITY CHECKS ===' as section;

-- Check for policies without capabilities
SELECT 
    'Policies without capabilities' as check_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All policies have capabilities'
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' policies have no capabilities')
    END as result
FROM policies p
LEFT JOIN policy_capabilities pc ON p.id = pc.policy_id
WHERE pc.policy_id IS NULL AND p.is_active = TRUE;

-- Check for endpoints without policies
SELECT 
    'Endpoints without policies' as check_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All endpoints have policies'
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' endpoints have no policies')
    END as result
FROM endpoints e
LEFT JOIN endpoint_policies ep ON e.id = ep.endpoint_id
WHERE ep.endpoint_id IS NULL AND e.is_active = TRUE;

-- Check for pages without actions
SELECT 
    'Pages without actions' as check_name,
    CASE 
        WHEN COUNT(*) <= 5 THEN CONCAT('✅ PASS - Only ', COUNT(*), ' pages without actions (acceptable)')
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' pages have no actions')
    END as result
FROM ui_pages p
LEFT JOIN page_actions pa ON p.id = pa.page_id
WHERE pa.page_id IS NULL AND p.is_active = TRUE AND p.is_menu_item = TRUE;

-- Check for orphaned capabilities
SELECT 
    'Orphaned capabilities' as check_name,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ PASS - All capabilities are linked to policies'
        ELSE CONCAT('⚠️  WARNING - ', COUNT(*), ' capabilities not linked to any policy')
    END as result
FROM capabilities c
LEFT JOIN policy_capabilities pc ON c.id = pc.capability_id
WHERE pc.capability_id IS NULL;

-- =============================================================================
-- Summary Statistics
-- =============================================================================

SELECT '=== FINAL SUMMARY ===' as section;

SELECT 'Total Capabilities' as metric, COUNT(*) as count FROM capabilities
UNION ALL
SELECT 'Total Policies', COUNT(*) FROM policies
UNION ALL
SELECT 'Active Policies', COUNT(*) FROM policies WHERE is_active = TRUE
UNION ALL
SELECT 'Total Endpoints', COUNT(*) FROM endpoints
UNION ALL
SELECT 'Active Endpoints', COUNT(*) FROM endpoints WHERE is_active = TRUE
UNION ALL
SELECT 'Total Roles', COUNT(*) FROM roles
UNION ALL
SELECT 'Total Users with Roles', COUNT(DISTINCT user_id) FROM user_roles
UNION ALL
SELECT 'Total UI Pages', COUNT(*) FROM ui_pages
UNION ALL
SELECT 'Menu Items', COUNT(*) FROM ui_pages WHERE is_menu_item = TRUE AND is_active = TRUE
UNION ALL
SELECT 'Total Page Actions', COUNT(*) FROM page_actions
UNION ALL
SELECT 'Policy-Capability Mappings', COUNT(*) FROM policy_capabilities
UNION ALL
SELECT 'Endpoint-Policy Mappings', COUNT(*) FROM endpoint_policies;

SELECT 'Verification Complete! ✅' as status;
SELECT 'Review results above. All ✅ PASS checks indicate successful migration.' as note;
SELECT 'Warnings (⚠️) should be investigated but may be acceptable.' as note;
SELECT 'Failures (❌) must be fixed before proceeding.' as note;
