-- =============================================================================
-- V23: Add capability_id foreign key to page_actions and migrate from required_capability
-- =============================================================================

-- Step 1: Add the capability_id column (nullable initially for migration)
ALTER TABLE page_actions 
ADD COLUMN capability_id BIGINT NULL COMMENT 'Foreign key to capabilities table';

-- Step 2: Migrate data from required_capability (string) to capability_id (FK)
-- This assumes required_capability contains the capability name
UPDATE page_actions pa
INNER JOIN capabilities c ON c.name = pa.required_capability
SET pa.capability_id = c.id
WHERE pa.required_capability IS NOT NULL;

-- Step 3: Make capability_id NOT NULL (after data migration)
ALTER TABLE page_actions 
MODIFY COLUMN capability_id BIGINT NOT NULL COMMENT 'Foreign key to capabilities table';

-- Step 4: Add foreign key constraint
ALTER TABLE page_actions
ADD CONSTRAINT fk_page_actions_capability 
FOREIGN KEY (capability_id) REFERENCES capabilities(id) ON DELETE CASCADE;

-- Step 5: Add index for performance
CREATE INDEX idx_page_actions_capability ON page_actions(capability_id);

-- Step 6: Drop the old required_capability column
ALTER TABLE page_actions 
DROP COLUMN required_capability;

-- Step 7: Also drop the 'key' column if it's not being used by the entity
-- Check if the key column exists and is not used
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'page_actions' 
  AND column_name = 'key';

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE page_actions DROP COLUMN `key`', 
    'SELECT ''key column already removed'' as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 8: Rename action_name to action to match entity (if not already done)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'page_actions' 
  AND column_name = 'action_name';

SET @sql = IF(@col_exists > 0, 
    'ALTER TABLE page_actions CHANGE COLUMN action_name action VARCHAR(64) NOT NULL', 
    'SELECT ''action column already correct'' as status');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration V23 complete!' as status;
SELECT 'page_actions table now has capability_id FK' as result;
