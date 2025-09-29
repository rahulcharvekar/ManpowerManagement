# Complete Database Cleanup Guide

## 🚨 WARNING: This will delete ALL data in your database!

## Method 1: Using the New REST API (Easiest)

### Start the application:
```bash
cd /Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation
mvn spring-boot:run
```

### Clean the database via API:
```bash
# Clean all tables
curl -X POST http://localhost:8080/api/system/cleanup-database

# Verify cleanup
curl -X GET http://localhost:8080/api/system/verify-cleanup

# Check worker_payments schema (to see new file_id column)
curl -X GET http://localhost:8080/api/system/schema/worker-payments
```

### Or use Swagger UI:
1. Open http://localhost:8080/swagger-ui.html
2. Navigate to "System Management" section
3. Execute "Clean database for testing" endpoint

## Method 2: Using MySQL Client (if available)

### If you have MySQL command line:
```bash
mysql -u root -p paymentreconciliation_dev < cleanup_database.sql
```

### Or connect and run manually:
```sql
mysql -u root -p
USE paymentreconciliation_dev;
source /Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/cleanup_database.sql
```

## Method 3: Using Database GUI Tools

1. **MySQL Workbench / phpMyAdmin / DBeaver**
2. Connect to your database server
3. Select `paymentreconciliation_dev` database
4. Copy and paste the contents of `cleanup_database.sql` and execute

## Method 4: Docker MySQL (if applicable)

```bash
# Find MySQL container
docker ps | grep mysql

# Execute cleanup
docker exec -i <container-name> mysql -u root -p paymentreconciliation_dev < cleanup_database.sql
```

## What Gets Cleaned:

### Tables truncated (data deleted, structure preserved):
- ✅ `worker_payments` - All payment records
- ✅ `uploaded_files` - All file upload records
- ✅ `worker_payment_receipts` - All worker receipts
- ✅ `employer_payment_receipts` - All employer receipts  
- ✅ `board_reconciliation_receipts` - All board reconciliation receipts

### Auto-increment counters reset to 1

## After Cleanup - Test the New Features:

### 1. Upload a file:
```bash
curl -X POST -F "file=@test_upload.txt" http://localhost:8080/api/worker-payments/file/upload
```

**Expected Response:**
```json
{
  "status": "success",
  "fileId": "1",
  "message": "File uploaded and parsed. 3 records loaded. Proceed to validation.",
  "recordCount": 3
}
```

### 2. Test the NEW paginated validation API:
```bash
# Get all records for file (paginated)
curl "http://localhost:8080/api/worker-payments/file/validate/1?page=0&size=10"

# Filter by status
curl "http://localhost:8080/api/worker-payments/file/validate/1?page=0&size=10&status=UPLOADED"
```

**Expected Response:**
```json
{
  "content": [
    {
      "id": 1,
      "fileId": "1",           // ← NEW: Direct file linkage
      "workerRef": "101",
      "regId": "...",
      "name": "...",
      "status": "UPLOADED",
      "validationStatus": "Pending validation"
    }
  ],
  "totalElements": 3,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 10,
  "hasNext": false,
  "hasPrevious": false,
  "fileId": "1"
}
```

### 3. Validate the file:
```bash
curl -X POST http://localhost:8080/api/worker-payments/file/validate/1
```

### 4. Test pagination again with VALIDATED records:
```bash
curl "http://localhost:8080/api/worker-payments/file/validate/1?status=VALIDATED"
```

## Key Improvements Verified:

✅ **Direct fileId linkage** - worker_payments.file_id column  
✅ **Paginated validation API** - Better performance for large files  
✅ **Enhanced validation status** - Clear status descriptions  
✅ **Backward compatibility** - Old APIs still work  

## Database Schema Changes:

The cleanup will show that `worker_payments` table now has:
```sql
file_id varchar(20) NULL  -- NEW COLUMN for direct linkage
```

This eliminates the need for expensive `LIKE 'REQ_%'` queries and provides direct O(1) lookup by fileId.

---

**Choose Method 1 (REST API) for the easiest cleanup!**
