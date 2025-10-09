-- =============================================================================
-- V25: Make capability_id NOT NULL in page_actions
-- =============================================================================

-- First verify all rows have capability_id populated
SET @null_count = (SELECT COUNT(*) FROM page_actions WHERE capability_id IS NULL);

-- Only proceed if no NULL values exist
SET @sql = IF(@null_count = 0,
    'ALTER TABLE page_actions MODIFY COLUMN capability_id BIGINT NOT NULL COMMENT ''Foreign key to capabilities table''',
    CONCAT('SELECT ''ERROR: Cannot make capability_id NOT NULL - found ', @null_count, ' rows with NULL values'' as error_message')
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration V25 complete!' as status;
SELECT 'capability_id is now NOT NULL' as result;
