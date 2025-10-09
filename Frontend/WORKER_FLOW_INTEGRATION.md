# Worker Flow Integration - Implementation Guide

## 🎯 Overview

This guide documents the complete Worker Flow integration following the capability-based permission system. All worker operations are now integrated with proper API calls, capability checks, and error handling.

---

## 📁 Files Created/Modified

### ✅ New Files Created

1. **`src/api/workerApi.js`**
   - Complete Worker API service
   - All CRUD operations for workers
   - File upload/validation operations
   - Payment generation operations
   - Receipt management operations

2. **`src/components/worker/WorkerList.jsx`**
   - Worker list with search and pagination
   - Create/Edit/Delete worker operations
   - Modal-based worker form
   - Full capability integration

### ✅ Files Modified

1. **`src/components/worker/WorkerUpload.jsx`**
   - Integrated with WorkerApi
   - File upload with progress tracking
   - Auto-validation after upload
   - Template download functionality
   - Upload history management

2. **`src/components/worker/index.js`**
   - Added WorkerList export

---

## 🔄 Worker Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         WORKER FLOW                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  1. WORKER LIST (/workers/list)                                      │
│     ├─ View all workers          → WORKER.LIST                       │
│     ├─ Search/Filter workers     → WORKER.LIST                       │
│     ├─ View worker details       → WORKER.READ                       │
│     ├─ Create new worker         → WORKER.CREATE                     │
│     ├─ Edit existing worker      → WORKER.UPDATE                     │
│     └─ Delete worker             → WORKER.DELETE                     │
│                                                                        │
│  2. UPLOAD WORKERS (/workers/upload)                                 │
│     ├─ Download template         → WORKER.DOWNLOAD                   │
│     ├─ Upload CSV/Excel file     → WORKER.CREATE                     │
│     ├─ Validate uploaded file    → WORKER.VALIDATE                   │
│     ├─ View upload history       → WORKER.LIST                       │
│     ├─ View file details         → WORKER.READ                       │
│     └─ Delete uploaded file      → WORKER.DELETE                     │
│                                                                        │
│  3. GENERATE PAYMENTS                                                 │
│     ├─ Generate payment request  → WORKER.GENERATE_PAYMENTS          │
│     ├─ View payment requests     → PAYMENT.LIST                      │
│     └─ View payment details      → PAYMENT.READ                      │
│                                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints Mapping

### Worker CRUD Operations

| Operation | Capability | Endpoint | Method | File |
|-----------|-----------|----------|--------|------|
| List workers | `WORKER.LIST` | `/api/v1/worker/list` | GET | WorkerApi.listWorkers() |
| Get worker details | `WORKER.READ` | `/api/v1/worker/{id}` | GET | WorkerApi.getWorkerById() |
| Create worker | `WORKER.CREATE` | `/api/v1/worker/create` | POST | WorkerApi.createWorker() |
| Update worker | `WORKER.UPDATE` | `/api/v1/worker/{id}` | PUT | WorkerApi.updateWorker() |
| Delete worker | `WORKER.DELETE` | `/api/v1/worker/{id}` | DELETE | WorkerApi.deleteWorker() |

### Worker Upload Operations

| Operation | Capability | Endpoint | Method | File |
|-----------|-----------|----------|--------|------|
| Upload file | `WORKER.CREATE` | `/api/worker/uploaded-data/upload` | POST | WorkerApi.uploadWorkerFile() |
| Validate file | `WORKER.VALIDATE` | `/api/worker/uploaded-data/file/{fileId}/validate` | POST | WorkerApi.validateWorkerFile() |
| Get file summary | `WORKER.READ` | `/api/worker/uploaded-data/file/{fileId}/summary` | GET | WorkerApi.getFileSummary() |
| List files | `WORKER.LIST` | `/api/worker/uploaded-data/files/summaries` | GET | WorkerApi.getFilesSummaries() |
| Download template | `WORKER.DOWNLOAD` | `/api/v1/worker/template` | GET | WorkerApi.downloadTemplate() |
| Delete file | `WORKER.DELETE` | `/api/worker/uploaded-data/file/{fileId}` | DELETE | WorkerApi.deleteUploadedFile() |

### Worker Payment Operations

| Operation | Capability | Endpoint | Method | File |
|-----------|-----------|----------|--------|------|
| Generate payment | `WORKER.GENERATE_PAYMENTS` | `/api/worker/uploaded-data/file/{fileId}/generate-request` | POST | WorkerApi.generatePaymentRequest() |
| Get payments by file | `PAYMENT.LIST` | `/api/v1/worker-payments/by-uploaded-file-ref/{ref}` | GET | WorkerApi.getPaymentsByFileRef() |
| Get payment details | `PAYMENT.READ` | `/api/v1/worker-payments/{id}` | GET | WorkerApi.getPaymentById() |
| Get file requests | `WORKER.READ` | `/api/worker/uploaded-data/file/{fileId}/requests` | GET | WorkerApi.getFileRequests() |

### Worker Receipt Operations

| Operation | Capability | Endpoint | Method | File |
|-----------|-----------|----------|--------|------|
| List all receipts | `PAYMENT.LIST` | `/api/worker/receipts/all` | GET | WorkerApi.getAllReceipts() |
| Get receipts by status | `PAYMENT.LIST` | `/api/worker/receipts/status/{status}` | GET | WorkerApi.getReceiptsByStatus() |
| Get receipt details | `PAYMENT.READ` | `/api/worker/receipts/{receiptNumber}` | GET | WorkerApi.getReceiptByNumber() |
| Update receipt status | `PAYMENT.UPDATE` | `/api/worker/receipts/{receiptNumber}/status` | PUT | WorkerApi.updateReceiptStatus() |

---

## 💻 Component Integration

### WorkerList Component (`/workers/list`)

**Features:**
- ✅ Lists all workers with pagination
- ✅ Search functionality
- ✅ Create new worker (modal form)
- ✅ Edit worker (modal form)
- ✅ View worker details (modal)
- ✅ Delete worker with confirmation
- ✅ Capability-based button visibility
- ✅ Error handling and loading states

**Capability Checks:**
```javascript
// Module-level access
<ModulePermissionGate module="WORKER">
  {/* Component content */}
</ModulePermissionGate>

// Action-level access
<ActionGate permission="WORKER.CREATE">
  <button onClick={handleCreate}>Add Worker</button>
</ActionGate>

<ActionGate permission="WORKER.UPDATE">
  <button onClick={handleEdit}>Edit</button>
</ActionGate>

<ActionGate permission="WORKER.DELETE">
  <button onClick={handleDelete}>Delete</button>
</ActionGate>
```

**Usage Example:**
```javascript
import { WorkerList } from '../components/worker';

// In your routing
<Route path="/workers/list" element={<WorkerList />} />
```

---

### WorkerUpload Component (`/workers/upload`)

**Features:**
- ✅ File upload with drag-and-drop support
- ✅ File validation (type and size)
- ✅ Upload progress indicator
- ✅ Auto-validation after upload
- ✅ Download template functionality
- ✅ Upload history with status
- ✅ Statistics cards
- ✅ Capability-based visibility
- ✅ Error handling

**Capability Checks:**
```javascript
// Upload capability
<ActionGate permission="WORKER.CREATE">
  {/* File upload form */}
</ActionGate>

// Validate capability
{can['WORKER.VALIDATE'] && (
  <button onClick={handleValidate}>Validate</button>
)}

// Download template
<ActionGate permission="WORKER.DOWNLOAD">
  <button onClick={handleDownloadTemplate}>Download Template</button>
</ActionGate>
```

**Usage Example:**
```javascript
import { WorkerUpload } from '../components/worker';

// In your routing
<Route path="/workers/upload" element={<WorkerUpload />} />
```

---

## 🎨 UI/UX Features

### Worker List Page

**Table Columns:**
- Worker ID
- Name
- Email
- Phone
- Status (badge)
- Actions (View, Edit, Delete icons)

**Search & Filter:**
- Real-time search by name/ID
- Refresh button
- Pagination controls

**Modal Forms:**
- Create Worker: Empty form with validation
- Edit Worker: Pre-filled form
- View Worker: Read-only form

### Worker Upload Page

**File Upload Area:**
- Drag-and-drop support
- File type validation (.csv, .xlsx, .xls)
- Size limit validation (10MB)
- Upload progress bar
- Selected file preview

**Upload History:**
- File name with icon (📄 or ✅)
- Uploaded by and timestamp
- Record count
- Validation status
- Status badge
- Action buttons (Validate, View, Delete)

**Statistics:**
- Total uploads count
- Validated files count
- Total records count

---

## 🔐 Security Implementation

### Frontend Capability Checks

```javascript
const { capabilities } = useAuth();
const can = capabilities?.can || {};

// Check before rendering
if (can['WORKER.CREATE']) {
  // Show create button
}

// Check before API call
if (!can['WORKER.UPDATE']) {
  throw new Error('You do not have permission to update workers');
}
```

### Backend Validation

```javascript
// Backend automatically validates via policies
@POST("/api/v1/worker/create")
@RequiresCapabilities(["WORKER.CREATE"])
async createWorker(req, res) {
  // Implementation
}
```

---

## 📝 API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "totalElements": 150,
  "totalPages": 8,
  "currentPage": 0,
  "pageSize": 20
}
```

---

## 🚀 How to Use

### 1. Import Worker Components

```javascript
import { WorkerList, WorkerUpload } from './components/worker';
```

### 2. Add Routes

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

<Router>
  <Routes>
    <Route path="/workers/list" element={<WorkerList />} />
    <Route path="/workers/upload" element={<WorkerUpload />} />
  </Routes>
</Router>
```

### 3. Use Worker API

```javascript
import WorkerApi from './api/workerApi';

// List workers
const workers = await WorkerApi.listWorkers({ page: 0, size: 20 });

// Create worker
const result = await WorkerApi.createWorker({
  workerId: 'W001',
  name: 'John Doe',
  email: 'john@example.com'
});

// Upload file
const file = document.getElementById('file-input').files[0];
const uploadResult = await WorkerApi.uploadWorkerFile(file);

// Validate file
const validationResult = await WorkerApi.validateWorkerFile(fileId);
```

---

## 🧪 Testing Checklist

### Worker List Component

- [ ] Page loads with worker list
- [ ] Search filters workers correctly
- [ ] Pagination works properly
- [ ] Create worker modal opens
- [ ] Worker form validation works
- [ ] Worker is created successfully
- [ ] Edit worker modal opens with data
- [ ] Worker is updated successfully
- [ ] View worker modal shows details
- [ ] Delete confirmation appears
- [ ] Worker is deleted successfully
- [ ] Capabilities hide/show buttons correctly
- [ ] Error messages display properly
- [ ] Loading states work

### Worker Upload Component

- [ ] Page loads with upload form
- [ ] File type validation works
- [ ] File size validation works
- [ ] File upload shows progress
- [ ] File uploads successfully
- [ ] Auto-validation triggers
- [ ] Template downloads correctly
- [ ] Upload history displays
- [ ] Statistics update correctly
- [ ] File validation works
- [ ] File deletion works
- [ ] Capabilities control visibility
- [ ] Error handling works

---

## 🐛 Common Issues & Solutions

### Issue 1: "No authentication token found"
**Solution:** Ensure user is logged in and token exists in localStorage

### Issue 2: "Access Denied" on page load
**Solution:** Check user has required module capability (e.g., WORKER.LIST)

### Issue 3: File upload fails
**Solution:** 
- Check file size (max 10MB)
- Check file type (.csv, .xlsx, .xls only)
- Check backend endpoint is running
- Check FormData is properly constructed

### Issue 4: Capabilities not working
**Solution:**
- Verify `/api/me/authorizations` returns `can` object
- Check AuthContext is properly set up
- Ensure components use `capabilities?.can` safely

### Issue 5: Pagination not working
**Solution:**
- Verify backend supports pagination parameters
- Check page/size parameters are passed correctly
- Ensure totalPages/totalElements are returned

---

## 🔄 Next Steps

### Immediate Tasks
1. ✅ Worker List component - COMPLETED
2. ✅ Worker Upload component - COMPLETED
3. ✅ Worker API service - COMPLETED
4. ⏳ Test all worker operations
5. ⏳ Add routing to App.jsx
6. ⏳ Update navigation menu

### Future Enhancements
1. ⏳ Worker Details page
2. ⏳ Worker Payment History page
3. ⏳ Bulk worker import with preview
4. ⏳ Export workers to Excel
5. ⏳ Advanced filters (department, status, etc.)
6. ⏳ Worker analytics dashboard

### Additional Modules
1. ⏳ Employer flow integration
2. ⏳ Board flow integration
3. ⏳ Payment flow integration
4. ⏳ Reconciliation flow integration
5. ⏳ Reports flow integration
6. ⏳ Audit flow integration

---

## 📚 Related Documentation

- [CAPABILITY_FLOW_MAPPING.md](./CAPABILITY_FLOW_MAPPING.md) - Complete flow mapping
- [CAPABILITY_SYSTEM_IMPLEMENTATION.md](./CAPABILITY_SYSTEM_IMPLEMENTATION.md) - System overview
- [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md) - Permission details
- [QUICK_REFERENCE_GUIDE.md](./QUICK_REFERENCE_GUIDE.md) - Quick reference

---

## 🎓 Code Examples

### Example 1: Custom Worker Operation

```javascript
// In your component
const handleCustomOperation = async (workerId) => {
  try {
    // Check capability
    if (!can['WORKER.UPDATE']) {
      throw new Error('You do not have permission to perform this action');
    }
    
    setLoading(true);
    setError(null);
    
    // Call API
    const response = await WorkerApi.updateWorker(workerId, {
      status: 'ACTIVE'
    });
    
    if (response.success) {
      console.log('✅ Operation successful');
      // Refresh data
      loadWorkers();
    }
  } catch (err) {
    console.error('❌ Operation failed:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Example 2: Custom API Method

```javascript
// In workerApi.js

/**
 * Custom method: Bulk activate workers
 * Capability: WORKER.UPDATE
 * Endpoint: POST /api/v1/worker/bulk-activate
 */
static async bulkActivateWorkers(workerIds) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiClient.post(
      '/api/v1/worker/bulk-activate',
      { workerIds },
      token
    );
    
    return {
      success: true,
      message: `${response.count} workers activated`,
      data: response
    };
  } catch (error) {
    console.error('❌ Error activating workers:', error);
    throw error;
  }
}
```

---

## 📞 Support

For questions or issues:
1. Check this documentation first
2. Review CAPABILITY_FLOW_MAPPING.md
3. Check browser console for errors
4. Verify API endpoints are correct
5. Test with Postman/curl directly
6. Check backend logs

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Status:** ✅ Complete and Ready for Testing
