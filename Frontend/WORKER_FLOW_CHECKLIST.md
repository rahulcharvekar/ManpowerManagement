# Worker Flow - Integration Checklist

## ✅ Frontend Implementation Status

### API Layer
- [x] **workerApi.js** - Worker API service
  - [x] `listWorkers()` - GET /api/v1/worker/list
  - [x] `getWorkerById()` - GET /api/v1/worker/{id}
  - [x] `createWorker()` - POST /api/v1/worker/create
  - [x] `updateWorker()` - PUT /api/v1/worker/{id}
  - [x] `deleteWorker()` - DELETE /api/v1/worker/{id}
  - [x] `uploadWorkerFile()` - POST /api/worker/uploaded-data/upload
  - [x] `validateWorkerFile()` - POST /api/worker/uploaded-data/file/{id}/validate
  - [x] `downloadTemplate()` - GET /api/v1/worker/template
  - [x] JSDoc documentation
  - [x] Error handling
  - [x] Console logging for debugging

### Components
- [x] **WorkerList.jsx**
  - [x] Integrated with `useAuth()` hook
  - [x] Capability checks for all actions
  - [x] API calls to WorkerApi
  - [x] Loading states
  - [x] Error handling
  - [x] Pagination support

- [x] **WorkerUpload.jsx**
  - [x] Integrated with `useAuth()` hook
  - [x] Capability checks for upload/validate
  - [x] File type validation
  - [x] Upload progress handling
  - [x] API calls to WorkerApi

- [x] **index.js**
  - [x] Exports configured for all worker components

### Routing
- [x] **App.jsx**
  - [x] WorkerList imported
  - [x] Route `/workers/list` → WorkerList (componentKey="8")
  - [x] Route `/workers/upload` → WorkerUpload (componentKey="9")
  - [x] Protected with `<ProtectedRoute>`
  - [x] No TypeScript/ESLint errors

### Documentation
- [x] **CAPABILITY_FLOW_MAPPING.md** - System-wide capability mapping
- [x] **WORKER_FLOW_IMPLEMENTATION.md** - Detailed implementation guide
- [x] **WORKER_FLOW_VISUAL_GUIDE.md** - Visual diagrams and flows
- [x] **WORKER_FLOW_COMPLETE.md** - Implementation summary

---

## ⏳ Backend Implementation Status (Pending)

### Controllers

#### WorkerController (`/api/v1/worker/*`)
- [ ] **GET /api/v1/worker/list**
  - [ ] @RequiresCapabilities({"WORKER.LIST"})
  - [ ] Pagination support (page, size, search)
  - [ ] Returns Page<Worker>
  
- [ ] **GET /api/v1/worker/{id}**
  - [ ] @RequiresCapabilities({"WORKER.READ"})
  - [ ] Returns Worker entity
  - [ ] 404 handling for not found
  
- [ ] **POST /api/v1/worker/create**
  - [ ] @RequiresCapabilities({"WORKER.CREATE"})
  - [ ] Request body validation
  - [ ] Returns created Worker
  
- [ ] **PUT /api/v1/worker/{id}**
  - [ ] @RequiresCapabilities({"WORKER.UPDATE"})
  - [ ] Request body validation
  - [ ] Returns updated Worker
  
- [ ] **DELETE /api/v1/worker/{id}**
  - [ ] @RequiresCapabilities({"WORKER.DELETE"})
  - [ ] Cascade delete handling
  - [ ] Returns 204 No Content
  
- [ ] **GET /api/v1/worker/template**
  - [ ] @RequiresCapabilities({"WORKER.DOWNLOAD"})
  - [ ] Returns Excel file download
  - [ ] Content-Type: application/vnd.ms-excel

#### WorkerUploadController (`/api/worker/uploaded-data/*`)
- [ ] **POST /api/worker/uploaded-data/upload**
  - [ ] @RequiresCapabilities({"WORKER.CREATE"})
  - [ ] Multipart file handling
  - [ ] File type validation (.csv, .xlsx, .xls)
  - [ ] Returns upload metadata with fileId
  
- [ ] **POST /api/worker/uploaded-data/file/{fileId}/validate**
  - [ ] @RequiresCapabilities({"WORKER.VALIDATE"})
  - [ ] Validation logic
  - [ ] Returns validation results (valid/invalid counts)
  
- [ ] **POST /api/worker/uploaded-data/file/{fileId}/generate-request**
  - [ ] @RequiresCapabilities({"WORKER.GENERATE_PAYMENTS"})
  - [ ] Payment generation logic
  - [ ] Returns generation status

- [ ] **GET /api/worker/uploaded-data/files/summaries**
  - [ ] @RequiresCapabilities({"WORKER.LIST"})
  - [ ] Returns list of uploaded files
  - [ ] Pagination support

### Services
- [ ] **WorkerService**
  - [ ] listWorkers(page, size, search)
  - [ ] getWorkerById(id)
  - [ ] createWorker(workerDTO)
  - [ ] updateWorker(id, workerDTO)
  - [ ] deleteWorker(id)
  - [ ] generateTemplate()
  
- [ ] **WorkerUploadService**
  - [ ] uploadFile(file, metadata)
  - [ ] validateFile(fileId)
  - [ ] generatePaymentRequests(fileId)
  - [ ] getUploadedFilesSummaries(page, size)

### Database
- [ ] **Worker Entity**
  - [ ] Table: workers
  - [ ] Fields: id, name, email, phone, employeeId, department, createdAt, updatedAt
  - [ ] Indexes on frequently queried fields
  
- [ ] **WorkerUploadedFile Entity**
  - [ ] Table: worker_uploaded_files
  - [ ] Fields: id, fileName, fileSize, uploadedBy, uploadedAt, status, totalRecords
  
- [ ] **WorkerRepository**
  - [ ] findAll with pagination
  - [ ] findById
  - [ ] save
  - [ ] deleteById
  - [ ] searchByName, email, employeeId

### Security/Policies
- [ ] **Worker Management Policy**
  - [ ] Capabilities: WORKER.LIST, WORKER.READ, WORKER.CREATE, WORKER.UPDATE, WORKER.DELETE
  - [ ] Assigned to roles: ADMIN, WORKER_MANAGER
  
- [ ] **Worker Upload Policy**
  - [ ] Capabilities: WORKER.VALIDATE, WORKER.DOWNLOAD, WORKER.GENERATE_PAYMENTS
  - [ ] Assigned to roles: ADMIN, WORKER_MANAGER

### Testing
- [ ] **Unit Tests**
  - [ ] WorkerController tests
  - [ ] WorkerService tests
  - [ ] WorkerUploadService tests
  
- [ ] **Integration Tests**
  - [ ] End-to-end API tests with JWT
  - [ ] Capability validation tests
  - [ ] File upload tests
  - [ ] Error scenario tests

---

## 🧪 Testing Checklist

### Manual Testing (Frontend)

#### Worker List Page
- [ ] Navigate to `/workers/list`
- [ ] Page loads without errors
- [ ] "Add Worker" button visible (WORKER.CREATE)
- [ ] Click "Add Worker" - modal opens
- [ ] Fill form and submit - API call logged in console
- [ ] "Edit" buttons visible on each row (WORKER.UPDATE)
- [ ] "Delete" buttons visible on each row (WORKER.DELETE)
- [ ] Search functionality works
- [ ] Pagination works

#### Worker Upload Page
- [ ] Navigate to `/workers/upload`
- [ ] Page loads without errors
- [ ] "Download Template" button visible (WORKER.DOWNLOAD)
- [ ] Click "Download Template" - API call logged
- [ ] File input visible
- [ ] Select invalid file type - validation error shown
- [ ] Select valid file (.csv/.xlsx) - file accepted
- [ ] Click "Upload" - upload progress shown
- [ ] After upload - "Validate" button appears
- [ ] Click "Validate" - validation results shown

#### Console Logs
- [ ] API calls logged with 🔍 emoji
- [ ] Success responses logged with ✅ emoji
- [ ] Errors logged with ❌ emoji
- [ ] Request/response data visible in logs

### Integration Testing (Backend)

#### Authentication
- [ ] Endpoints require JWT token
- [ ] Invalid token returns 401 Unauthorized
- [ ] Missing token returns 401 Unauthorized
- [ ] Valid token allows access

#### Authorization
- [ ] User without WORKER.LIST cannot access list endpoint
- [ ] User without WORKER.CREATE cannot create workers
- [ ] User without WORKER.UPDATE cannot update workers
- [ ] User without WORKER.DELETE cannot delete workers
- [ ] Proper 403 Forbidden responses

#### CRUD Operations
- [ ] Create worker - returns 201 Created
- [ ] Get worker - returns 200 OK with data
- [ ] Update worker - returns 200 OK with updated data
- [ ] Delete worker - returns 204 No Content
- [ ] List workers - returns paginated results

#### File Upload
- [ ] Upload CSV file - returns fileId
- [ ] Upload Excel file - returns fileId
- [ ] Upload invalid file type - returns 400 Bad Request
- [ ] Validate file - returns validation results
- [ ] Generate payments - creates payment requests

---

## 📊 Capability Mapping Verification

### Page: /workers/list (Component ID: 8)

| UI Element | Capability Required | API Endpoint | Status |
|------------|-------------------|--------------|--------|
| View list | WORKER.LIST | GET /api/v1/worker/list | ✅ Frontend / ⏳ Backend |
| Add button | WORKER.CREATE | POST /api/v1/worker/create | ✅ Frontend / ⏳ Backend |
| Edit button | WORKER.UPDATE | PUT /api/v1/worker/{id} | ✅ Frontend / ⏳ Backend |
| Delete button | WORKER.DELETE | DELETE /api/v1/worker/{id} | ✅ Frontend / ⏳ Backend |
| View details | WORKER.READ | GET /api/v1/worker/{id} | ✅ Frontend / ⏳ Backend |

### Page: /workers/upload (Component ID: 9)

| UI Element | Capability Required | API Endpoint | Status |
|------------|-------------------|--------------|--------|
| Upload file | WORKER.CREATE | POST /api/worker/uploaded-data/upload | ✅ Frontend / ⏳ Backend |
| Validate | WORKER.VALIDATE | POST /api/worker/uploaded-data/file/{id}/validate | ✅ Frontend / ⏳ Backend |
| Download template | WORKER.DOWNLOAD | GET /api/v1/worker/template | ✅ Frontend / ⏳ Backend |

---

## 🚀 Deployment Checklist

### Frontend
- [x] Code committed to repository
- [ ] Build for production: `npm run build`
- [ ] No build errors
- [ ] Environment variables configured
- [ ] API base URL set correctly
- [ ] Deploy to server/CDN

### Backend
- [ ] Code committed to repository
- [ ] Unit tests passing: `./mvnw test`
- [ ] Integration tests passing
- [ ] Database migrations created
- [ ] Environment variables configured
- [ ] Build for production: `./mvnw clean package`
- [ ] Deploy to server
- [ ] Database migrations applied

---

## 📝 Notes

### For Developers
1. **Frontend is 100% complete** and ready for testing once backend is deployed
2. **All console logs** use emojis for easy identification (🔍 🔄 ✅ ❌)
3. **Error handling** is comprehensive with user-friendly messages
4. **TypeScript/JSDoc** documentation is complete for all methods

### For Backend Team
1. Follow the **exact endpoint paths** specified in workerApi.js
2. Use **@RequiresCapabilities** annotation on all endpoints
3. Return **consistent response format**:
   ```json
   {
     "content": [...],
     "totalElements": 100,
     "totalPages": 5,
     "number": 0,
     "size": 20
   }
   ```
4. Implement **proper error responses**:
   - 400 Bad Request - Validation errors
   - 401 Unauthorized - Missing/invalid token
   - 403 Forbidden - Insufficient capabilities
   - 404 Not Found - Resource not found
   - 500 Internal Server Error - Server errors

---

## ✅ Sign-Off

- [ ] **Frontend Lead** - Code review complete
- [ ] **Backend Lead** - Requirements understood
- [ ] **QA Lead** - Test plan created
- [ ] **Product Owner** - Acceptance criteria verified

---

**Last Updated**: October 9, 2025  
**Version**: 1.0  
**Status**: ✅ Frontend Complete | ⏳ Backend In Progress
