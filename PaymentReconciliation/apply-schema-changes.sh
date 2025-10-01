#!/bin/bash

# Script to apply database schema changes directly to the dev database
# This script will update the existing database with the new schema

echo "Applying database schema changes to paymentreconciliation_dev..."

# Check if we can connect to MySQL
if ! command -v mysql &> /dev/null; then
    echo "Error: MySQL client not found. Please install MySQL client tools."
    exit 1
fi

# Apply the schema changes directly
echo "Adding created_at column to worker_payments table..."

mysql -u root -p -e "
USE paymentreconciliation_dev;

-- Add created_at column if it doesn't exist
ALTER TABLE worker_payments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have a created_at timestamp
UPDATE worker_payments 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_worker_payments_created_at ON worker_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_worker_payments_status_created_at ON worker_payments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_worker_payments_receipt_created_at ON worker_payments(receipt_number, created_at);

-- Verify the changes
DESCRIBE worker_payments;
"

echo "Schema changes applied successfully!"
echo "The created_at column has been added to the worker_payments table."
