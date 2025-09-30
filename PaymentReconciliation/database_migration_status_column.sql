-- Migration script to increase status column size in board_receipts table
-- Run this script to fix the "Data truncated for column 'status'" error

-- Alter the status column to increase its size from VARCHAR(16) to VARCHAR(32)
ALTER TABLE board_receipts MODIFY COLUMN status VARCHAR(32) NOT NULL;

-- Verify the change (optional - for checking)
-- DESCRIBE board_receipts;

-- The following are the current valid status values:
-- 'PENDING', 'VERIFIED', 'REJECTED', 'PROCESSED'

-- Update any existing NULL status values to PENDING (if any exist)
UPDATE board_receipts SET status = 'PENDING' WHERE status IS NULL OR status = '';

-- Verify no invalid status values exist (optional check)
-- SELECT DISTINCT status FROM board_receipts;
