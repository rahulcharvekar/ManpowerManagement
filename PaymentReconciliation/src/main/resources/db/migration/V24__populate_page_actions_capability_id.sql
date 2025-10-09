-- =============================================================================
-- V24: Populate capability_id in page_actions based on page and action
-- =============================================================================

-- Get the page IDs and their context
-- Update capability_id based on page name and action type

-- For Worker Management page (page_id = 8)
UPDATE page_actions pa
INNER JOIN ui_pages p ON p.id = pa.page_id
INNER JOIN capabilities c ON c.name = CONCAT(UPPER(
    CASE 
        WHEN p.label LIKE '%Worker%' THEN 'WORKER'
        WHEN p.label LIKE '%Payment%' THEN 'PAYMENT'
        WHEN p.label LIKE '%User%' THEN 'USER_MANAGEMENT'
        WHEN p.label LIKE '%Role%' THEN 'ROLE_MANAGEMENT'
        WHEN p.label LIKE '%Employer%' THEN 'EMPLOYER'
        WHEN p.label LIKE '%Board%' THEN 'BOARD'
        WHEN p.label LIKE '%Dashboard%' THEN 'DASHBOARD'
        WHEN p.label LIKE '%Audit%' THEN 'AUDIT'
        WHEN p.label LIKE '%Reconciliation%' THEN 'RECONCILIATION'
        ELSE 'SYSTEM'
    END
), '.', UPPER(pa.action))
SET pa.capability_id = c.id
WHERE pa.capability_id IS NULL;

-- For actions that didn't match, try alternative mappings
-- Map VALIDATE to READ
UPDATE page_actions pa
INNER JOIN ui_pages p ON p.id = pa.page_id
INNER JOIN capabilities c ON c.name = CONCAT(UPPER(
    CASE 
        WHEN p.label LIKE '%Worker%' THEN 'WORKER'
        WHEN p.label LIKE '%Payment%' THEN 'PAYMENT'
        ELSE 'SYSTEM'
    END
), '.READ')
SET pa.capability_id = c.id
WHERE pa.capability_id IS NULL AND pa.action = 'VALIDATE';

-- Map UPLOAD to CREATE
UPDATE page_actions pa
INNER JOIN ui_pages p ON p.id = pa.page_id
INNER JOIN capabilities c ON c.name = CONCAT(UPPER(
    CASE 
        WHEN p.label LIKE '%Worker%' THEN 'WORKER'
        WHEN p.label LIKE '%Payment%' THEN 'PAYMENT'
        ELSE 'SYSTEM'
    END
), '.CREATE')
SET pa.capability_id = c.id
WHERE pa.capability_id IS NULL AND pa.action IN ('UPLOAD', 'CREATE');

-- Map DOWNLOAD to READ
UPDATE page_actions pa
INNER JOIN ui_pages p ON p.id = pa.page_id
INNER JOIN capabilities c ON c.name = CONCAT(UPPER(
    CASE 
        WHEN p.label LIKE '%Worker%' THEN 'WORKER'
        WHEN p.label LIKE '%Payment%' THEN 'PAYMENT'
        ELSE 'SYSTEM'
    END
), '.READ')
SET pa.capability_id = c.id
WHERE pa.capability_id IS NULL AND pa.action = 'DOWNLOAD';

-- For any remaining NULL values, assign a default capability
-- Let's check what's left and assign SYSTEM.VIEW_CONFIG as default
UPDATE page_actions pa
INNER JOIN capabilities c ON c.name = 'SYSTEM.VIEW_CONFIG'
SET pa.capability_id = c.id
WHERE pa.capability_id IS NULL;

-- Verify all page_actions have capability_id
SELECT 
    COUNT(*) as total_actions,
    SUM(CASE WHEN capability_id IS NULL THEN 1 ELSE 0 END) as null_capabilities
FROM page_actions;

-- Show the mapping
SELECT 
    pa.id,
    pa.label,
    pa.action,
    p.label as page_name,
    c.name as capability
FROM page_actions pa
LEFT JOIN ui_pages p ON p.id = pa.page_id
LEFT JOIN capabilities c ON c.id = pa.capability_id
ORDER BY p.label, pa.display_order;

SELECT 'Migration V24 complete!' as status;
