-- Database Cleanup Script for paymentreconciliation_dev
-- Run this script to clean all data and test the new functionality

USE paymentreconciliation_dev;

-- Disable foreign key checks to avoid constraint issues
SET FOREIGN_KEY_CHECKS = 0;

-- Clean all tables in the correct order (child tables first)
TRUNCATE TABLE board_receipts;
TRUNCATE TABLE employer_payment_receipts;
TRUNCATE TABLE worker_payment_receipts;
TRUNCATE TABLE worker_uploaded_data;
TRUNCATE TABLE worker_payments;
TRUNCATE TABLE uploaded_files;

-- Reset auto-increment counters
ALTER TABLE board_receipts AUTO_INCREMENT = 1;
ALTER TABLE employer_payment_receipts AUTO_INCREMENT = 1;
ALTER TABLE worker_payment_receipts AUTO_INCREMENT = 1;
ALTER TABLE worker_uploaded_data AUTO_INCREMENT = 1;
ALTER TABLE worker_payments AUTO_INCREMENT = 1;
ALTER TABLE uploaded_files AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify tables are empty
SELECT 'worker_payments' as table_name, COUNT(*) as row_count FROM worker_payments
UNION ALL
SELECT 'worker_uploaded_data', COUNT(*) FROM worker_uploaded_data
UNION ALL
SELECT 'uploaded_files', COUNT(*) FROM uploaded_files
UNION ALL
SELECT 'worker_payment_receipts', COUNT(*) FROM worker_payment_receipts
UNION ALL
SELECT 'employer_payment_receipts', COUNT(*) FROM employer_payment_receipts
UNION ALL
SELECT 'board_receipts', COUNT(*) FROM board_receipts;

-- Show the updated schema to verify new columns and tables exist
DESCRIBE worker_payments;
DESCRIBE worker_uploaded_data;
