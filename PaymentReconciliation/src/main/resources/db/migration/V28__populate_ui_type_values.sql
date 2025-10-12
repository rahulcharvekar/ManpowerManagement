-- Update existing endpoints with appropriate ui_type values for testing
-- This is a one-time data population script

-- Update some common endpoint types
UPDATE endpoints SET ui_type = 'LIST' WHERE path LIKE '%paginated%' AND method = 'POST';
UPDATE endpoints SET ui_type = 'UPLOAD' WHERE path LIKE '%upload%' AND method = 'POST';
UPDATE endpoints SET ui_type = 'ACTION' WHERE path LIKE '%validate%' AND method = 'POST';
UPDATE endpoints SET ui_type = 'ACTION' WHERE path LIKE '%process%' AND method = 'POST';
UPDATE endpoints SET ui_type = 'DETAIL' WHERE path LIKE '%/{id}%' AND method = 'GET';
UPDATE endpoints SET ui_type = 'LIST' WHERE path LIKE '%/%' AND method = 'GET' AND path NOT LIKE '%/{id}%';
UPDATE endpoints SET ui_type = 'CREATE' WHERE method = 'POST' AND path NOT LIKE '%upload%' AND path NOT LIKE '%validate%' AND path NOT LIKE '%process%';
UPDATE endpoints SET ui_type = 'UPDATE' WHERE method = 'PUT';
UPDATE endpoints SET ui_type = 'DELETE' WHERE method = 'DELETE';
UPDATE endpoints SET ui_type = 'META' WHERE path LIKE '%meta%' OR path LIKE '%endpoints%';

-- Set default for any remaining null values
UPDATE endpoints SET ui_type = 'ACTION' WHERE ui_type IS NULL;
