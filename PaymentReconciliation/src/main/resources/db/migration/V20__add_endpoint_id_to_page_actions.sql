-- =============================================================================
-- Migration: Add endpoint_id column to page_actions table
-- Purpose: Link page actions to their backend API endpoints
-- =============================================================================

-- Add endpoint_id column to page_actions table
ALTER TABLE page_actions
ADD COLUMN endpoint_id BIGINT NULL COMMENT 'The backend endpoint to call for this action',
ADD CONSTRAINT fk_page_actions_endpoint 
    FOREIGN KEY (endpoint_id) REFERENCES endpoints(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_page_actions_endpoint ON page_actions(endpoint_id);

-- Note: This column is nullable because not all page actions require a backend endpoint
-- Some actions may be purely frontend operations
