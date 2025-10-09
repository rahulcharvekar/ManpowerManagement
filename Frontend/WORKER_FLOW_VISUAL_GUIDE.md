# Worker Flow Integration - Visual Reference

## 🎯 Complete Worker Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER JOURNEY                                      │
└─────────────────────────────────────────────────────────────────────────────┘

   User Login
      ↓
   GET /api/auth/ui-config  ← Fetch capabilities
      ↓
   Store in AuthContext
      ↓
   Navigate to Workers Module
      ↓
┌──────────────────────────────────────────────────────────────────────────────┐
│  Worker Module (/workers)                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────┐              ┌────────────────────┐                 │
│  │  Worker List       │              │  Worker Upload     │                 │
│  │  /workers/list     │              │  /workers/upload   │                 │
│  │  (Page ID: 8)      │              │  (Page ID: 9)      │                 │
│  └────────────────────┘              └────────────────────┘                 │
│           ↓                                     ↓                             │
│  Required Capabilities:            Required Capabilities:                    │
│  • WORKER.LIST        ✅           • WORKER.CREATE    ✅                    │
│  • WORKER.CREATE      ✅           • WORKER.VALIDATE  ✅                    │
│  • WORKER.UPDATE      ✅                                                     │
│  • WORKER.DELETE      ✅                                                     │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Worker List Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER LANDS ON /workers/list                                  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. COMPONENT INITIALIZATION                                      │
│    • WorkerList.jsx loads                                       │
│    • useAuth() hook provides capabilities                       │
│    • can = capabilities.can                                     │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. PERMISSION CHECK (Frontend)                                   │
│    if (can['WORKER.LIST']) {                                    │
│      loadWorkers(); // Proceed to API call                      │
│    } else {                                                      │
│      // Show "No Permission" message                            │
│    }                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. API CALL                                                      │
│    WorkerApi.listWorkers({ page: 0, size: 20 })                │
│    ↓                                                             │
│    GET /api/v1/worker/list?page=0&size=20                       │
│    Headers: { Authorization: Bearer <JWT_TOKEN> }              │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. BACKEND PROCESSING                                            │
│    • Validate JWT token                                          │
│    • Extract user roles: ["ADMIN"]                              │
│    • Check capability: WORKER.LIST                              │
│      - ADMIN role → Worker Management Policy                    │
│      - Policy grants: WORKER.LIST ✅                            │
│    • Fetch workers from database                                │
│    • Return paginated response                                   │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. RESPONSE RECEIVED                                             │
│    {                                                             │
│      success: true,                                              │
│      data: [                                                     │
│        { id: 1, name: "John Doe", email: "john@..." },         │
│        { id: 2, name: "Jane Smith", email: "jane@..." }        │
│      ],                                                          │
│      totalElements: 50,                                          │
│      totalPages: 3                                               │
│    }                                                             │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. UI RENDERING                                                  │
│    • Display workers in table                                    │
│    • Conditionally show action buttons:                         │
│                                                                   │
│    {can['WORKER.CREATE'] && <AddButton />}                      │
│    {can['WORKER.UPDATE'] && <EditButton />}                     │
│    {can['WORKER.DELETE'] && <DeleteButton />}                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📤 Worker Upload Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER LANDS ON /workers/upload                                │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. COMPONENT INITIALIZATION                                      │
│    • WorkerUpload.jsx loads                                     │
│    • Check capabilities:                                         │
│      - WORKER.CREATE    ✅ (show upload section)                │
│      - WORKER.VALIDATE  ✅ (show validate button)               │
│      - WORKER.DOWNLOAD  ✅ (show template button)               │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. USER ACTIONS                                                  │
│                                                                   │
│    ACTION 1: Download Template                                   │
│    ────────────────────────────────────────────────────────────│
│    if (can['WORKER.DOWNLOAD']) {                                │
│      WorkerApi.downloadTemplate()                               │
│      → GET /api/v1/worker/template                              │
│      → Download Excel file                                       │
│    }                                                             │
│                                                                   │
│    ACTION 2: Select File                                         │
│    ────────────────────────────────────────────────────────────│
│    • User selects CSV/Excel file                                │
│    • Frontend validates file type (.csv, .xlsx, .xls)          │
│    • Store in state: setSelectedFile(file)                      │
│                                                                   │
│    ACTION 3: Upload File                                         │
│    ────────────────────────────────────────────────────────────│
│    if (can['WORKER.CREATE']) {                                  │
│      WorkerApi.uploadWorkerFile(file, metadata)                 │
│      → POST /api/worker/uploaded-data/upload                    │
│      → FormData with file attachment                            │
│    }                                                             │
│                                                                   │
│    ACTION 4: Validate File                                       │
│    ────────────────────────────────────────────────────────────│
│    if (can['WORKER.VALIDATE']) {                                │
│      WorkerApi.validateWorkerFile(fileId)                       │
│      → POST /api/worker/uploaded-data/file/{id}/validate        │
│      → Returns validation results                                │
│    }                                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Flow at Each Layer

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Layer 1: UI Component Level                                         │
│  ────────────────────────────────────────────────────────────────── │
│  const { capabilities } = useAuth();                                 │
│  const can = capabilities?.can || {};                                │
│                                                                       │
│  if (can['WORKER.CREATE']) {                                         │
│    // Show button                                                    │
│  } else {                                                             │
│    // Hide button                                                    │
│  }                                                                    │
│                                                                       │
│  ✅ Result: User only sees actions they're allowed to perform       │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Layer 2: React Router Level                                         │
│  ────────────────────────────────────────────────────────────────── │
│  <Route path="workers/list" element={                                │
│    <ProtectedRoute componentKey="8">                                 │
│      <WorkerList />                                                  │
│    </ProtectedRoute>                                                 │
│  } />                                                                 │
│                                                                       │
│  ✅ Result: Page access controlled by component permissions          │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Layer 3: API Call Level (Frontend)                                  │
│  ────────────────────────────────────────────────────────────────── │
│  const token = localStorage.getItem('authToken');                    │
│                                                                       │
│  await apiClient.get('/api/v1/worker/list', token);                  │
│  // Token sent in Authorization header                               │
│                                                                       │
│  ✅ Result: All API calls authenticated                              │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Layer 4: Backend API Level                                          │
│  ────────────────────────────────────────────────────────────────── │
│  @GetMapping("/list")                                                │
│  @RequiresCapabilities({"WORKER.LIST"})                             │
│  public ResponseEntity<Page<Worker>> listWorkers() {                │
│    // 1. JWT validation (automatic via Spring Security)             │
│    // 2. Extract user & roles from token                            │
│    // 3. Check capabilities:                                         │
│    //    User has role: ADMIN                                        │
│    //    ADMIN → "Worker Management" Policy                         │
│    //    Policy grants: WORKER.LIST                                 │
│    //    ✅ Access granted                                           │
│    // 4. Execute business logic                                      │
│    return ResponseEntity.ok(workers);                                │
│  }                                                                    │
│                                                                       │
│  ✅ Result: Backend validates ALL requests independently             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

🔒 Defense in Depth: Multiple security layers ensure:
   1. UI only shows allowed actions (UX)
   2. Router protects page access
   3. API calls require authentication
   4. Backend validates EVERY request (primary security)
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CREATE WORKER EXAMPLE                             │
└─────────────────────────────────────────────────────────────────────┘

  User clicks "Add Worker" button
           ↓
  ┌─────────────────────────────┐
  │ Frontend: WorkerList.jsx    │
  │ ─────────────────────────   │
  │ handleCreate(workerData)    │
  │   ↓                          │
  │ Check: can['WORKER.CREATE'] │
  │   ↓ YES                      │
  │ Call API                     │
  └──────────────┬──────────────┘
                 ↓
  ┌─────────────────────────────┐
  │ API Layer: workerApi.js     │
  │ ─────────────────────────   │
  │ WorkerApi.createWorker()    │
  │   ↓                          │
  │ POST /api/v1/worker/create  │
  │ Body: {                      │
  │   name: "John Doe",         │
  │   email: "john@email.com",  │
  │   employeeId: "EMP001"      │
  │ }                            │
  │ Headers: {                   │
  │   Authorization: Bearer...  │
  │ }                            │
  └──────────────┬──────────────┘
                 ↓
  ┌─────────────────────────────────┐
  │ Backend: WorkerController       │
  │ ─────────────────────────────── │
  │ @RequiresCapabilities([         │
  │   "WORKER.CREATE"               │
  │ ])                               │
  │   ↓                              │
  │ Validate JWT                     │
  │   ↓                              │
  │ Check capability                 │
  │   ↓ GRANTED                      │
  │ workerService.create()           │
  │   ↓                              │
  │ Save to database                 │
  │   ↓                              │
  │ Return: Worker { id: 123, ... } │
  └──────────────┬──────────────────┘
                 ↓
  ┌─────────────────────────────┐
  │ Response to Frontend        │
  │ ─────────────────────────   │
  │ {                            │
  │   success: true,            │
  │   message: "Worker created",│
  │   data: { id: 123, ... }   │
  │ }                            │
  └──────────────┬──────────────┘
                 ↓
  ┌─────────────────────────────┐
  │ Frontend: WorkerList.jsx    │
  │ ─────────────────────────   │
  │ Show success message        │
  │   ↓                          │
  │ Refresh worker list         │
  │   ↓                          │
  │ Display updated data        │
  └─────────────────────────────┘
```

---

## 🗂️ File Structure

```
Frontend/
├── src/
│   ├── api/
│   │   ├── workerApi.js          ← All worker API calls
│   │   ├── apiConfig.js          ← API endpoints & config
│   │   └── apiService.js         ← Common API utilities
│   │
│   ├── components/
│   │   ├── worker/
│   │   │   ├── WorkerList.jsx    ← Worker list page (/workers/list)
│   │   │   ├── WorkerUpload.jsx  ← Worker upload page (/workers/upload)
│   │   │   ├── index.js          ← Export all worker components
│   │   │   └── ...
│   │   │
│   │   └── core/
│   │       ├── ProtectedRoute.jsx ← Route-level protection
│   │       ├── ActionGate.jsx     ← Capability-based rendering
│   │       └── ...
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx        ← Auth state & capabilities
│   │   └── PermissionContext.jsx  ← Permission utilities
│   │
│   └── App.jsx                     ← Route configuration
│
└── Documentation/
    ├── WORKER_FLOW_IMPLEMENTATION.md     ← Implementation guide
    ├── CAPABILITY_FLOW_MAPPING.md        ← Complete mapping
    └── ...
```

---

## 🎯 Quick Reference: API Endpoints

### Worker CRUD

| Operation | Capability | Endpoint | Method |
|-----------|-----------|----------|--------|
| List workers | `WORKER.LIST` | `/api/v1/worker/list` | GET |
| Get worker | `WORKER.READ` | `/api/v1/worker/{id}` | GET |
| Create worker | `WORKER.CREATE` | `/api/v1/worker/create` | POST |
| Update worker | `WORKER.UPDATE` | `/api/v1/worker/{id}` | PUT |
| Delete worker | `WORKER.DELETE` | `/api/v1/worker/{id}` | DELETE |

### Worker Upload

| Operation | Capability | Endpoint | Method |
|-----------|-----------|----------|--------|
| Upload file | `WORKER.CREATE` | `/api/worker/uploaded-data/upload` | POST |
| Validate file | `WORKER.VALIDATE` | `/api/worker/uploaded-data/file/{id}/validate` | POST |
| Download template | `WORKER.DOWNLOAD` | `/api/v1/worker/template` | GET |
| Generate payments | `WORKER.GENERATE_PAYMENTS` | `/api/worker/uploaded-data/file/{id}/generate-request` | POST |

---

## 🚀 Usage Examples

### Example 1: Render button based on capability

```javascript
import { useAuth } from '../../contexts/AuthContext';

const { capabilities } = useAuth();
const can = capabilities?.can || {};

{can['WORKER.CREATE'] && (
  <button onClick={handleCreate}>Add Worker</button>
)}
```

### Example 2: Using ActionGate component

```javascript
import { ActionGate } from '../core';

<ActionGate requiredCapabilities={['WORKER.CREATE']}>
  <button onClick={handleCreate}>Add Worker</button>
</ActionGate>
```

### Example 3: Making an API call

```javascript
import WorkerApi from '../../api/workerApi';

const handleCreate = async (workerData) => {
  try {
    const response = await WorkerApi.createWorker(workerData);
    
    if (response.success) {
      console.log('Worker created:', response.data);
      loadWorkers(); // Refresh list
    }
  } catch (error) {
    console.error('Error creating worker:', error);
  }
};
```

---

## ✅ Integration Checklist

### Frontend ✅ COMPLETE

- [x] Worker API service created (`workerApi.js`)
- [x] WorkerList component integrated with capabilities
- [x] WorkerUpload component integrated with capabilities
- [x] Routes configured in App.jsx
- [x] Components exported in index.js
- [x] Documentation created

### Backend ⏳ PENDING

- [ ] Create `WorkerController` with all CRUD endpoints
- [ ] Create `WorkerUploadController` with upload/validate endpoints
- [ ] Add `@RequiresCapabilities` annotations
- [ ] Implement business logic in services
- [ ] Add validation and error handling
- [ ] Write unit tests
- [ ] Write integration tests

---

**Last Updated**: October 9, 2025  
**Status**: Frontend Complete | Backend Integration Pending
