-- =============================================================================
-- Migration Script: Component-Based to Unified Permission System
-- Purpose: Migrate from component_permissions tables to simplified permissions
-- Date: October 9, 2025
-- =============================================================================

USE paymentreconciliation_dev;

-- =============================================================================
-- STEP 1: Backup existing data (optional but recommended)
-- =============================================================================
-- CREATE TABLE permissions_backup AS SELECT * FROM permissions;
-- CREATE TABLE ui_components_backup AS SELECT * FROM ui_components WHERE 1=1;
-- CREATE TABLE component_permissions_backup AS SELECT * FROM component_permissions WHERE 1=1;

-- =============================================================================
-- STEP 2: Add new columns to permissions table
-- =============================================================================

-- Check if columns already exist before adding
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND COLUMN_NAME = 'route') = 0,
    'ALTER TABLE permissions ADD COLUMN route VARCHAR(200) COMMENT ''Frontend route path for navigation''',
    'SELECT ''Column route already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND COLUMN_NAME = 'display_order') = 0,
    'ALTER TABLE permissions ADD COLUMN display_order INT DEFAULT 0 COMMENT ''Order for displaying in navigation menu''',
    'SELECT ''Column display_order already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND COLUMN_NAME = 'is_menu_item') = 0,
    'ALTER TABLE permissions ADD COLUMN is_menu_item BOOLEAN DEFAULT FALSE COMMENT ''Whether this permission represents a menu item''',
    'SELECT ''Column is_menu_item already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND COLUMN_NAME = 'is_active') = 0,
    'ALTER TABLE permissions ADD COLUMN is_active BOOLEAN DEFAULT TRUE COMMENT ''Whether this permission is active''',
    'SELECT ''Column is_active already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make module column NOT NULL if it isn't already
ALTER TABLE permissions MODIFY COLUMN module VARCHAR(50) NOT NULL COMMENT 'UI component/module identifier';

-- =============================================================================
-- STEP 3: Create new indexes
-- =============================================================================

-- Check and create indexes if they don't exist
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND INDEX_NAME = 'idx_module_order') = 0,
    'CREATE INDEX idx_module_order ON permissions(module, display_order)',
    'SELECT ''Index idx_module_order already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND INDEX_NAME = 'idx_menu_item') = 0,
    'CREATE INDEX idx_menu_item ON permissions(is_menu_item)',
    'SELECT ''Index idx_menu_item already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.STATISTICS 
     WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
     AND TABLE_NAME = 'permissions' 
     AND INDEX_NAME = 'idx_active') = 0,
    'CREATE INDEX idx_active ON permissions(is_active)',
    'SELECT ''Index idx_active already exists'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =============================================================================
-- STEP 4: Migrate data from component tables (if they exist)
-- =============================================================================

-- Update existing permissions with UI metadata from ui_components (if table exists)
SET @table_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
    AND TABLE_NAME = 'ui_components'
);

-- Only run if ui_components table exists
SET @sql = IF(
    @table_exists > 0,
    '
    UPDATE permissions p
    INNER JOIN ui_components uc ON UPPER(p.module) = UPPER(uc.component_key)
    SET 
        p.route = uc.route,
        p.display_order = uc.display_order,
        p.is_active = uc.is_active
    WHERE p.name LIKE CONCAT(UPPER(uc.component_key), ''_READ'')
    ',
    'SELECT ''ui_components table does not exist, skipping migration'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mark READ permissions as menu items
UPDATE permissions 
SET is_menu_item = TRUE 
WHERE name LIKE '%_READ' 
AND route IS NOT NULL;

-- =============================================================================
-- STEP 5: Drop old component tables (ONLY if they exist and after verification)
-- =============================================================================

-- WARNING: Uncomment these lines only after verifying migration was successful
-- and after backing up data!

-- DROP TABLE IF EXISTS role_component_permissions;
-- DROP TABLE IF EXISTS component_permissions;
-- DROP TABLE IF EXISTS ui_components;

-- =============================================================================
-- STEP 6: Verification Queries
-- =============================================================================

-- Check permissions table structure
SELECT 
    'Permissions Table Structure' as check_type,
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
AND TABLE_NAME = 'permissions'
ORDER BY ORDINAL_POSITION;

-- Check permissions grouped by module
SELECT 
    'Permissions by Module' as check_type,
    module,
    COUNT(*) as total_permissions,
    SUM(CASE WHEN is_menu_item = TRUE THEN 1 ELSE 0 END) as menu_items,
    SUM(CASE WHEN route IS NOT NULL THEN 1 ELSE 0 END) as with_routes,
    MAX(display_order) as max_order
FROM permissions
GROUP BY module
ORDER BY MIN(display_order);

-- Check indexes
SELECT 
    'Permissions Indexes' as check_type,
    INDEX_NAME, 
    COLUMN_NAME, 
    SEQ_IN_INDEX,
    NON_UNIQUE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
AND TABLE_NAME = 'permissions'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- Check for orphaned component tables
SELECT 
    'Component Tables Status' as check_type,
    TABLE_NAME,
    TABLE_ROWS,
    CONCAT(ROUND(DATA_LENGTH / 1024 / 1024, 2), ' MB') as size
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'paymentreconciliation_dev' 
AND TABLE_NAME IN ('ui_components', 'component_permissions', 'role_component_permissions');

SELECT 'Migration completed successfully!' as status;
SELECT 'Please review the verification results above' as note;
SELECT 'Uncomment DROP TABLE statements only after verification' as warning;
