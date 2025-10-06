-- Component Permission System Verification Queries
-- Use these queries to verify the component-based permission system

-- 1. View all UI components
SELECT 
    component_key,
    display_name,
    category,
    route,
    icon,
    display_order,
    is_active
FROM ui_components 
ORDER BY category, display_order;

-- 2. View all component permissions
SELECT 
    c.component_key,
    c.display_name,
    cp.action,
    cp.description,
    cp.is_active
FROM ui_components c
JOIN component_permissions cp ON c.id = cp.component_id
ORDER BY c.component_key, cp.action;

-- 3. View role assignments to component permissions
SELECT 
    r.name as role_name,
    c.component_key,
    c.display_name as component_name,
    cp.action,
    rcp.is_active
FROM roles r
JOIN role_component_permissions rcp ON r.id = rcp.role_id
JOIN component_permissions cp ON rcp.component_permission_id = cp.id
JOIN ui_components c ON cp.component_id = c.id
WHERE rcp.is_active = true
ORDER BY r.name, c.category, c.display_order, cp.action;

-- 4. Get permissions for a specific role (example: ADMIN)
SELECT 
    c.component_key,
    c.display_name,
    c.category,
    c.route,
    GROUP_CONCAT(cp.action ORDER BY cp.action) as allowed_actions
FROM roles r
JOIN role_component_permissions rcp ON r.id = rcp.role_id
JOIN component_permissions cp ON rcp.component_permission_id = cp.id
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'ADMIN' AND rcp.is_active = true
GROUP BY c.id, c.component_key, c.display_name, c.category, c.route
ORDER BY c.category, c.display_order;

-- 5. Get all permissions for a specific user (replace 'admin' with actual username)
SELECT 
    u.username,
    c.component_key,
    c.display_name,
    c.route,
    GROUP_CONCAT(DISTINCT cp.action ORDER BY cp.action) as allowed_actions
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_component_permissions rcp ON r.id = rcp.role_id
JOIN component_permissions cp ON rcp.component_permission_id = cp.id
JOIN ui_components c ON cp.component_id = c.id
WHERE u.username = 'admin' AND rcp.is_active = true
GROUP BY u.id, c.id, c.component_key, c.display_name, c.route
ORDER BY c.category, c.display_order;

-- 6. Count permissions by role
SELECT 
    r.name as role_name,
    COUNT(DISTINCT c.id) as components_accessible,
    COUNT(rcp.id) as total_permissions
FROM roles r
LEFT JOIN role_component_permissions rcp ON r.id = rcp.role_id AND rcp.is_active = true
LEFT JOIN component_permissions cp ON rcp.component_permission_id = cp.id
LEFT JOIN ui_components c ON cp.component_id = c.id
GROUP BY r.id, r.name
ORDER BY total_permissions DESC;

-- 7. Check for users without any component permissions
SELECT 
    u.username,
    u.full_name,
    u.enabled,
    COUNT(rcp.id) as permission_count
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_component_permissions rcp ON r.id = rcp.role_id AND rcp.is_active = true
GROUP BY u.id, u.username, u.full_name, u.enabled
HAVING permission_count = 0
ORDER BY u.username;

-- 8. View navigation structure for a specific role
SELECT 
    c.category,
    c.component_key,
    c.display_name,
    c.route,
    c.icon,
    c.display_order,
    GROUP_CONCAT(cp.action ORDER BY cp.action) as actions
FROM roles r
JOIN role_component_permissions rcp ON r.id = rcp.role_id
JOIN component_permissions cp ON rcp.component_permission_id = cp.id
JOIN ui_components c ON cp.component_id = c.id
WHERE r.name = 'RECONCILIATION_OFFICER' 
  AND rcp.is_active = true 
  AND cp.action = 'VIEW'
GROUP BY c.id
ORDER BY c.category, c.display_order;
