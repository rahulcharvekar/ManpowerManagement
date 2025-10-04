-- =============================================================================
-- Master Sample Data Population Script
-- Payment Reconciliation Application
-- 
-- This script runs all sample data scripts in the correct order
-- to populate master tables with test data
-- =============================================================================

-- Set session variables for better performance
SET autocommit = 0;
SET unique_checks = 0;
SET foreign_key_checks = 0;

-- Use the database
USE paymentreconciliation_dev;

-- =============================================================================
-- EXECUTION ORDER (IMPORTANT: Follow this order due to dependencies)
-- =============================================================================

-- Get the directory where this script is located
-- 1. Board Master (No dependencies)
SOURCE src/main/resources/sample-data/sample-data-board-master.sql;

-- 2. Employer Master (No dependencies)  
SOURCE src/main/resources/sample-data/sample-data-employer-master.sql;

-- 3. Worker Master (No dependencies)
SOURCE src/main/resources/sample-data/sample-data-worker-master.sql;

-- 4. Employer Toli Relation (Depends on Employer Master)
SOURCE src/main/resources/sample-data/sample-data-employer-toli-relation.sql;

-- =============================================================================
-- FINAL VERIFICATION AND SUMMARY
-- =============================================================================

-- Re-enable checks
SET foreign_key_checks = 1;
SET unique_checks = 1;
SET autocommit = 1;

-- Summary of all master data
SELECT 'MASTER DATA POPULATION SUMMARY' as summary;

SELECT 'Board Master Records' as table_name, COUNT(*) as record_count FROM board_master
UNION ALL
SELECT 'Employer Master Records' as table_name, COUNT(*) as record_count FROM employer_master  
UNION ALL
SELECT 'Worker Master Records' as table_name, COUNT(*) as record_count FROM worker_master
UNION ALL
SELECT 'Employer Toli Relations' as table_name, COUNT(*) as record_count FROM employer_toli_relation;

-- Detailed verification queries
SELECT 'DETAILED VERIFICATION QUERIES' as verification;

-- Check board distribution by state
SELECT 'Board Distribution by State:' as info;
SELECT state_name, COUNT(*) as board_count 
FROM board_master 
WHERE status = 'ACTIVE' 
GROUP BY state_name 
ORDER BY board_count DESC;

-- Check employer distribution by status
SELECT 'Employer Distribution by Status:' as info;
SELECT status, COUNT(*) as employer_count 
FROM employer_master 
GROUP BY status;

-- Check worker distribution by gender
SELECT 'Worker Distribution by Gender:' as info;
SELECT gender, COUNT(*) as worker_count 
FROM worker_master 
WHERE status = 'ACTIVE'
GROUP BY gender;

-- Check toli distribution by employer
SELECT 'Top 5 Employers by Toli Count:' as info;
SELECT 
    em.employer_name,
    COUNT(etr.toli_id) as toli_count
FROM employer_master em
LEFT JOIN employer_toli_relation etr ON em.employer_id = etr.employer_id
WHERE em.status = 'ACTIVE' AND (etr.status = 'ACTIVE' OR etr.status IS NULL)
GROUP BY em.employer_id, em.employer_name
ORDER BY toli_count DESC
LIMIT 5;

-- Sample data for testing uploads
SELECT 'SAMPLE DATA FOR TESTING UPLOADS:' as testing_info;

-- Sample employer and toli combinations for testing
SELECT 
    'Sample Employer-Toli combinations for upload testing:' as info,
    etr.employer_id,
    em.employer_name,
    etr.toli_id,
    etr.toli_name,
    etr.location
FROM employer_toli_relation etr
JOIN employer_master em ON etr.employer_id = em.employer_id
WHERE etr.status = 'ACTIVE' AND em.status = 'ACTIVE'
ORDER BY etr.employer_id, etr.toli_id
LIMIT 10;

-- Sample worker references for testing
SELECT 
    'Sample Worker References for upload testing:' as info,
    worker_reference,
    registration_id,
    worker_name,
    aadhar,
    bank_account
FROM worker_master
WHERE status = 'ACTIVE'
ORDER BY worker_id
LIMIT 10;

-- Sample board IDs for testing  
SELECT 
    'Sample Board IDs for upload testing:' as info,
    board_id,
    board_name,
    board_code,
    state_name
FROM board_master
WHERE status = 'ACTIVE'
ORDER BY board_id
LIMIT 5;

SELECT 'All master data has been successfully populated!' as final_status;
SELECT NOW() as completion_time;
