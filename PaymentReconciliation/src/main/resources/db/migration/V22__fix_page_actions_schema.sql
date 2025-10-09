-- =============================================================================
-- V22: Fix page_actions table schema to match entity
-- =============================================================================

-- Check if icon column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'page_actions' 
  AND column_name = 'icon';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE page_actions ADD COLUMN icon VARCHAR(64) NULL COMMENT ''Action icon''', 
    'SELECT ''icon column already exists'' as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if variant column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'page_actions' 
  AND column_name = 'variant';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE page_actions ADD COLUMN variant VARCHAR(32) DEFAULT ''default'' COMMENT ''UI variant: primary, secondary, danger''', 
    'SELECT ''variant column already exists'' as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename action_name to action if it exists
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'page_actions' 
  AND column_name = 'action_name';

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE page_actions CHANGE COLUMN action_name action VARCHAR(64) NOT NULL', 
    'SELECT ''action_name column does not exist, action already correct'' as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration V22 complete!' as status;
SELECT 'page_actions schema fixed' as result;
