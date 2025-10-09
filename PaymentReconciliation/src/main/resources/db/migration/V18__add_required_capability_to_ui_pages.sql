-- V18: Add required_capability column to ui_pages table and rename key to page_id
-- This column stores the capability name required to access each UI page

-- Rename 'key' column to 'page_id' to match the original schema design
-- This handles cases where Hibernate auto-created the column with a different name
ALTER TABLE ui_pages 
CHANGE COLUMN `key` `page_id` VARCHAR(64) NOT NULL UNIQUE COMMENT 'Unique page identifier';

-- Add index for performance when querying by required_capability
-- Note: required_capability column already exists (created by Hibernate auto-ddl)
-- We only need to add the index if it doesn't exist
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = DATABASE() 
               AND table_name = 'ui_pages' 
               AND index_name = 'idx_required_capability');

SET @sqlstmt := IF(@exist = 0, 
                   'CREATE INDEX idx_required_capability ON ui_pages(required_capability)', 
                   'SELECT ''Index already exists'' AS message');

PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional: Update existing pages with appropriate capabilities based on their module
-- This is commented out as it should be done manually or through separate data migration
-- UPDATE ui_pages SET required_capability = 'VIEW_WORKERS' WHERE module = 'WORKER';
-- UPDATE ui_pages SET required_capability = 'VIEW_PAYMENTS' WHERE module = 'PAYMENT';
-- UPDATE ui_pages SET required_capability = 'VIEW_EMPLOYERS' WHERE module = 'EMPLOYER';
-- UPDATE ui_pages SET required_capability = 'VIEW_BOARDS' WHERE module = 'BOARD';
-- UPDATE ui_pages SET required_capability = 'VIEW_RECONCILIATION' WHERE module = 'RECONCILIATION';
-- UPDATE ui_pages SET required_capability = 'VIEW_ADMIN' WHERE module = 'ADMIN';
