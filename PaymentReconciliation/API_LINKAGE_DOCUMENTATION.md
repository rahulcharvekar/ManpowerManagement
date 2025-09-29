# Worker Payment Upload Linkage & Validation API Documentation

## File Upload to Worker Payment Linkage

### How the Linkage Works

1. **File Upload Process**:
   - File is uploaded via `/api/worker-payments/file/upload`
   - System creates an `UploadedFile` record with auto-generated `fileId`
   - File is parsed and worker payment records are created

2. **Direct Linkage Fields**:
   - **NEW**: `WorkerPayment.fileId` - Direct reference to uploaded file ID
   - **Existing**: `WorkerPayment.requestReferenceNumber` - Pattern: `"REQ_" + fileId + "_" + randomUUID`

3. **Database Schema Changes**:
   ```sql
   ALTER TABLE worker_payments ADD COLUMN file_id VARCHAR(20);
   ```

### Repository Methods Available

```java
// Direct fileId lookup (NEW - Better Performance)
List<WorkerPayment> findByFileId(String fileId);
List<WorkerPayment> findByFileIdAndStatus(String fileId, WorkerPaymentStatus status);
Page<WorkerPayment> findByFileId(String fileId, Pageable pageable);
Page<WorkerPayment> findByFileIdAndStatus(String fileId, WorkerPaymentStatus status, Pageable pageable);

// Legacy prefix lookup (Still Available)
List<WorkerPayment> findByRequestReferenceNumberStartingWith(String prefix);
List<WorkerPayment> findByRequestReferenceNumberStartingWithAndStatus(String prefix, WorkerPaymentStatus status);
```

## Enhanced Validation API

### New Paginated Validation Endpoint

**GET** `/api/worker-payments/file/validate/{fileId}`

#### Query Parameters:
- `page` (optional, default: 0) - Page number (0-based)
- `size` (optional, default: 20) - Page size
- `status` (optional) - Filter by status: UPLOADED, VALIDATED, FAILED, PROCESSED, ERROR

#### Example Request:
```http
GET /api/worker-payments/file/validate/123?page=0&size=10&status=VALIDATED
```

#### Example Response:
```json
{
  "content": [
    {
      "id": 1,
      "fileId": "123",
      "workerRef": "WRK001",
      "regId": "REG123",
      "name": "John Doe",
      "toli": "TOLI001",
      "aadhar": "123456789012",
      "pan": "ABCDE1234F",
      "paymentAmount": 15000.00,
      "bankAccount": "1234567890123456",
      "requestRefNumber": "REQ_123_a1b2c3d4",
      "status": "VALIDATED",
      "validationStatus": "Validation passed",
      "receiptNumber": null
    }
  ],
  "totalElements": 50,
  "totalPages": 5,
  "currentPage": 0,
  "pageSize": 10,
  "hasNext": true,
  "hasPrevious": false,
  "fileId": "123"
}
```

### Validation Status Details

The `validationStatus` field provides human-readable status descriptions:

- **UPLOADED**: "Pending validation"
- **VALIDATED**: "Validation passed"
- **FAILED**: "Validation failed - check required fields"
- **PROCESSED**: "Successfully processed"
- **ERROR**: "Error during processing"

## Complete API Workflow

### 1. File Upload
```http
POST /api/worker-payments/file/upload
Content-Type: multipart/form-data
```

**Response:**
```json
{
  "status": "success",
  "fileId": "123",
  "message": "File uploaded and parsed. 50 records loaded. Proceed to validation.",
  "recordCount": 50
}
```

### 2. Trigger Validation
```http
POST /api/worker-payments/file/validate/123
```

### 3. View Paginated Validation Results
```http
GET /api/worker-payments/file/validate/123?page=0&size=20&status=VALIDATED
```

### 4. Process Valid Records
```http
POST /api/worker-payments/file/process/123
```

### 5. Check Status Summary
```http
GET /api/worker-payments/file/status/123
```

### 6. Get Receipt Details
```http
GET /api/worker-payments/file/receipt/123
```

## Performance Improvements

1. **Direct FileId Lookup**: New queries use `WHERE file_id = ?` instead of `WHERE request_reference_number LIKE 'REQ_%'`
2. **Pagination Support**: Large result sets are now paginated to improve response times
3. **Index Recommendations**:
   ```sql
   CREATE INDEX idx_worker_payments_file_id ON worker_payments(file_id);
   CREATE INDEX idx_worker_payments_file_id_status ON worker_payments(file_id, status);
   ```

## Migration Notes

- **Backward Compatibility**: All existing APIs continue to work
- **New fileId Field**: Automatically populated for new uploads
- **Legacy Data**: Existing records without fileId can be updated using the requestReferenceNumber pattern
- **Performance**: New direct lookups are significantly faster than prefix matching

## Status Flow

```
UPLOADED → (validation) → VALIDATED/FAILED → (processing) → PROCESSED
                     ↓
                   ERROR (if processing fails)
```

Each worker payment record maintains its individual status, allowing for granular tracking and filtering.
