-- V27__add_ui_type_to_endpoints.sql
-- Add ui_type column to endpoints table for UI usage classification

ALTER TABLE endpoints ADD COLUMN ui_type VARCHAR(32) DEFAULT NULL COMMENT 'UI usage type: ACTION, LIST, FORM, etc.';

-- Add index for potential queries on ui_type
CREATE INDEX idx_endpoints_ui_type ON endpoints(ui_type);

-- Add comment to the table
ALTER TABLE endpoints COMMENT = 'API endpoints with UI usage classification';
