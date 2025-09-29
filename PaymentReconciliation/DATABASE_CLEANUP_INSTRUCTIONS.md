# Database Cleanup Instructions

## Option 1: Using MySQL Command Line (if available)

```bash
# Connect to MySQL
mysql -u root -p

# Run the cleanup script
source /Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/cleanup_database.sql
```

## Option 2: Using MySQL Workbench or phpMyAdmin

1. Open your MySQL client (Workbench, phpMyAdmin, etc.)
2. Connect to your database server
3. Select the `paymentreconciliation_dev` database
4. Copy and paste the contents of `cleanup_database.sql` and execute

## Option 3: Using Docker (if MySQL is in Docker)

```bash
# If your MySQL is running in Docker, find the container
docker ps | grep mysql

# Execute the cleanup script
docker exec -i <mysql-container-name> mysql -u root -p paymentreconciliation_dev < cleanup_database.sql
```

## What the cleanup does:

1. **Truncates all tables** - Removes all data while keeping table structure
2. **Resets auto-increment counters** - Starts IDs from 1 again
3. **Maintains referential integrity** - Temporarily disables foreign keys during cleanup
4. **Verifies cleanup** - Shows row counts to confirm tables are empty
5. **Shows schema** - Displays the worker_payments table structure including the new `file_id` column

## Tables cleaned:

- `worker_payments` - All payment records
- `uploaded_files` - All file upload records  
- `worker_payment_receipts` - All worker receipts
- `employer_payment_receipts` - All employer receipts
- `board_reconciliation_receipts` - All board reconciliation receipts

## After cleanup, you can test:

1. **File Upload**: `/api/worker-payments/file/upload`
2. **New Validation API**: `/api/worker-payments/file/validate/{fileId}?page=0&size=10`
3. **File Validation**: `/api/worker-payments/file/validate/{fileId}` (POST)
4. **Processing**: `/api/worker-payments/file/process/{fileId}`

The worker_payments table now has the new `file_id` column for direct linkage!
