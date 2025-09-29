# Uploaded Files By Date API Documentation

## Endpoint: `/api/uploaded-files/by-date`

### Overview
The `/api/uploaded-files/by-date` endpoint allows you to retrieve uploaded files based on flexible date criteria. You can query by a single date, date range, or open-ended ranges.

### HTTP Method
`GET`

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `singleDate` | String | No | Single date in YYYY-MM-DD format | `2025-09-29` |
| `startDate` | String | No | Start date in YYYY-MM-DD format | `2025-09-01` |
| `endDate` | String | No | End date in YYYY-MM-DD format | `2025-09-30` |

### Usage Examples

#### 1. Single Date Query
Get all files uploaded on a specific date:
```http
GET /api/uploaded-files/by-date?singleDate=2025-09-29
```

#### 2. Date Range Query
Get all files uploaded between two dates (inclusive):
```http
GET /api/uploaded-files/by-date?startDate=2025-09-01&endDate=2025-09-30
```

#### 3. From Date Onwards
Get all files uploaded from a specific date onwards:
```http
GET /api/uploaded-files/by-date?startDate=2025-09-01
```

#### 4. Up to Date
Get all files uploaded up to a specific date:
```http
GET /api/uploaded-files/by-date?endDate=2025-09-30
```

#### 5. No Date Criteria
Get all files (when no date parameters are provided):
```http
GET /api/uploaded-files/by-date
```

### Response Format

#### Success Response (200 OK)
```json
{
  "success": true,
  "totalCount": 5,
  "queryDescription": "Files uploaded on 2025-09-29",
  "files": [
    {
      "id": 1,
      "filename": "worker_payments_202509.csv",
      "fileType": "workerpayments",
      "uploadDate": "2025-09-29T10:30:45",
      "status": "PROCESSED",
      "totalRecords": 100,
      "successCount": 95,
      "failureCount": 5,
      "uploadedBy": null,
      "fileHash": "a1b2c3d4e5f6..."
    },
    {
      "id": 2,
      "filename": "employer_data_202509.xlsx",
      "fileType": "employerdata",
      "uploadDate": "2025-09-29T14:20:15",
      "status": "VALIDATED",
      "totalRecords": 50,
      "successCount": 50,
      "failureCount": 0,
      "uploadedBy": null,
      "fileHash": "f6e5d4c3b2a1..."
    }
  ]
}
```

#### Error Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Invalid date format. Please use YYYY-MM-DD format.",
  "details": "Text '2025-13-45' could not be parsed: Invalid value for MonthOfYear (valid values 1 - 12): 13"
}
```

### Response Fields

#### Root Level
- `success` (boolean): Indicates if the request was successful
- `totalCount` (integer): Total number of files found
- `queryDescription` (string): Human-readable description of the query performed
- `files` (array): Array of file objects

#### File Object Fields
- `id` (long): Unique identifier for the uploaded file
- `filename` (string): Original filename when uploaded
- `fileType` (string): Category/type of the file (e.g., "workerpayments", "employerdata")
- `uploadDate` (string): ISO datetime when the file was uploaded
- `status` (string): Current processing status (UPLOADED, PARSED, VALIDATED, PROCESSED, etc.)
- `totalRecords` (integer): Total number of records in the file
- `successCount` (integer): Number of successfully processed records
- `failureCount` (integer): Number of failed records
- `uploadedBy` (string): Username who uploaded the file (nullable)
- `fileHash` (string): SHA-256 hash of the file content

### Date Format Requirements

- **Format**: `YYYY-MM-DD` (ISO 8601 date format)
- **Examples**: 
  - ✅ `2025-09-29`
  - ✅ `2025-01-01`
  - ✅ `2025-12-31`
- **Invalid Examples**:
  - ❌ `29-09-2025`
  - ❌ `09/29/2025`
  - ❌ `2025-9-29`
  - ❌ `2025-13-01` (invalid month)

### Query Logic Priority

1. If `singleDate` is provided, it takes precedence over start/end dates
2. If both `startDate` and `endDate` are provided, queries for date range
3. If only `startDate` is provided, queries from that date onwards
4. If only `endDate` is provided, queries up to that date
5. If no dates are provided, returns all files

### Time Considerations

- **Single Date**: Matches the entire day (00:00:00 to 23:59:59)
- **Start Date**: Includes from 00:00:00 of the start date
- **End Date**: Includes up to 23:59:59 of the end date
- **Date Range**: Inclusive of both start and end dates

### Related Endpoints

- `GET /api/uploaded-files` - Get all uploaded files
- `GET /api/uploaded-files/{id}` - Get specific file by ID
- `GET /api/uploaded-files/by-type/{fileType}` - Get files by type
- `GET /api/uploaded-files/by-status/{status}` - Get files by status

### Curl Examples

```bash
# Single date
curl "http://localhost:8080/api/uploaded-files/by-date?singleDate=2025-09-29"

# Date range
curl "http://localhost:8080/api/uploaded-files/by-date?startDate=2025-09-01&endDate=2025-09-30"

# From date onwards
curl "http://localhost:8080/api/uploaded-files/by-date?startDate=2025-09-01"

# Up to date
curl "http://localhost:8080/api/uploaded-files/by-date?endDate=2025-09-30"

# All files
curl "http://localhost:8080/api/uploaded-files/by-date"
```

### Error Handling

The API handles the following error scenarios:

1. **Invalid Date Format**: Returns 400 with detailed error message
2. **Database Errors**: Returns 500 with generic error message
3. **No Results**: Returns 200 with empty files array
4. **Invalid Date Values**: Returns 400 (e.g., month 13, day 32)

### Performance Notes

- Results are ordered by upload date in descending order (newest first)
- For large datasets, consider implementing pagination in future versions
- Date queries use database indexes on the `upload_date` column for optimal performance
