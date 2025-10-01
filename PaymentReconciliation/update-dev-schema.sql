-- Schema Update Script for Development Database
-- Execute this script in your MySQL client or database management tool

-- Use the development database
USE paymentreconciliation_dev;

-- Add created_at column to worker_payments table if it doesn't exist
ALTER TABLE worker_payments 
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have a created_at timestamp (set to current time)
UPDATE worker_payments 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL OR created_at = '0000-00-00 00:00:00';

-- Add indexes for better query performance when filtering by date
CREATE INDEX idx_worker_payments_created_at ON worker_payments(created_at);
CREATE INDEX idx_worker_payments_status_created_at ON worker_payments(status, created_at);
CREATE INDEX idx_worker_payments_receipt_created_at ON worker_payments(receipt_number, created_at);

-- Verify the changes
DESCRIBE worker_payments;

-- Show some sample data to verify the created_at column
SELECT id, worker_name, status, receipt_number, created_at 
FROM worker_payments 
ORDER BY created_at DESC 
LIMIT 5;
