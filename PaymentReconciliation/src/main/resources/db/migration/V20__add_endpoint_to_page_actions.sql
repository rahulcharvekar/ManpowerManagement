-- =============================================================================
-- V16: Add endpoint_id to page_actions table
-- This links frontend actions to their corresponding backend API endpoints
-- =============================================================================

-- Add endpoint_id column to page_actions table
ALTER TABLE page_actions 
ADD COLUMN endpoint_id BIGINT NULL COMMENT 'The backend endpoint to call for this action';

-- Add foreign key constraint
ALTER TABLE page_actions 
ADD CONSTRAINT fk_page_action_endpoint 
FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_page_action_endpoint ON page_actions(endpoint_id);

-- =============================================================================
-- Note: Update statements removed - will be populated when data is seeded
-- The endpoint_id will be set when page_actions are created/updated
-- =============================================================================

SELECT 'Migration V16 complete!' as status;
SELECT 'endpoint_id column added to page_actions table' as result;
