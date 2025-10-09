# Worker Flow Implementation Guide

## 🎯 Overview

This guide demonstrates the **complete worker flow** implementation following the capability-based architecture:

```
UI Component → Capability Check → API Call → Backend Endpoint
```

---

## 📋 Worker Flow Capabilities

### Required Capabilities

| Capability | UI Action | API Endpoint | HTTP Method |
|------------|-----------|--------------|-------------|
| `WORKER.LIST` | View worker list | `/api/v1/worker/list` | GET |
| `WORKER.READ` | View worker details | `/api/v1/worker/{id}` | GET |
| `WORKER.CREATE` | Create new worker / Upload file | `/api/v1/worker/create` | POST |
| `WORKER.UPDATE` | Edit worker | `/api/v1/worker/{id}` | PUT |
| `WORKER.DELETE` | Delete worker | `/api/v1/worker/{id}` | DELETE |
| `WORKER.VALIDATE` | Validate uploaded file | `/api/worker/uploaded-data/file/{fileId}/validate` | POST |
| `WORKER.DOWNLOAD` | Download template | `/api/v1/worker/template` | GET |
| `WORKER.GENERATE_PAYMENTS` | Generate payments from file | `/api/worker/uploaded-data/file/{fileId}/generate-request` | POST |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Worker Components (UI)                                       │
│     • WorkerList.jsx     - List and manage workers              │
│     • WorkerUpload.jsx   - Upload worker files                  │
│     • WorkerDashboard.jsx - Worker overview                     │
│                                                                   │
│  2. Capability Checks (Permission Gates)                        │
│     • useAuth() hook - Get capabilities                         │
│     • can["WORKER.CREATE"] - Check permissions                  │
│     • <ActionGate> - Conditional rendering                      │
│                                                                   │
│  3. API Service Layer                                            │
│     • workerApi.js - All worker API calls                       │
│     • apiClient - HTTP client with auth                         │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. API Endpoints                                                │
│     • WorkerController - /api/v1/worker/*                       │
│     • WorkerUploadController - /api/worker/uploaded-data/*      │
│                                                                   │
│  2. Security/Authorization                                       │
│     • JWT Token validation                                       │
│     • Capability-based access control                           │
│     • Role → Policy → Capability mapping                        │
│                                                                   │
│  3. Business Logic                                               │
│     • Worker CRUD operations                                     │
│     • File upload & validation                                   │
│     • Payment generation                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Worker Flow Examples

### 1️⃣ Worker List Page Flow

#### **Step 1: Component Implementation**

**File: `src/components/worker/WorkerList.jsx`**

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkerApi from '../../api/workerApi';
import { ActionGate } from '../core';

const WorkerList = () => {
  const { capabilities } = useAuth();
  const can = capabilities?.can || {};
  
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Load workers on mount (requires WORKER.LIST capability)
  useEffect(() => {
    if (can['WORKER.LIST']) {
      loadWorkers();
    }
  }, [can]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await WorkerApi.listWorkers({
        page: 0,
        size: 20
      });
      
      if (response.success) {
        setWorkers(response.data);
      }
    } catch (err) {
      setError('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create worker (requires WORKER.CREATE capability)
  const handleCreate = async (workerData) => {
    try {
      const response = await WorkerApi.createWorker(workerData);
      if (response.success) {
        loadWorkers(); // Refresh list
      }
    } catch (err) {
      setError('Failed to create worker');
    }
  };

  // ✅ Update worker (requires WORKER.UPDATE capability)
  const handleUpdate = async (id, workerData) => {
    try {
      const response = await WorkerApi.updateWorker(id, workerData);
      if (response.success) {
        loadWorkers(); // Refresh list
      }
    } catch (err) {
      setError('Failed to update worker');
    }
  };

  // ✅ Delete worker (requires WORKER.DELETE capability)
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this worker?')) return;
    
    try {
      const response = await WorkerApi.deleteWorker(id);
      if (response.success) {
        loadWorkers(); // Refresh list
      }
    } catch (err) {
      setError('Failed to delete worker');
    }
  };

  return (
    <div className="worker-list-container">
      <h1>Worker Management</h1>
      
      {/* ✅ Conditional rendering based on capability */}
      <ActionGate requiredCapabilities={['WORKER.CREATE']}>
        <button onClick={() => setShowCreateModal(true)}>
          Add New Worker
        </button>
      </ActionGate>

      {loading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map(worker => (
            <tr key={worker.id}>
              <td>{worker.name}</td>
              <td>{worker.email}</td>
              <td>{worker.department}</td>
              <td>
                {/* ✅ Show edit button only if user has WORKER.UPDATE */}
                <ActionGate requiredCapabilities={['WORKER.UPDATE']}>
                  <button onClick={() => handleUpdate(worker.id)}>
                    Edit
                  </button>
                </ActionGate>
                
                {/* ✅ Show delete button only if user has WORKER.DELETE */}
                <ActionGate requiredCapabilities={['WORKER.DELETE']}>
                  <button onClick={() => handleDelete(worker.id)}>
                    Delete
                  </button>
                </ActionGate>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WorkerList;
```

#### **Step 2: API Service**

**File: `src/api/workerApi.js`**

```javascript
export class WorkerApi {
  /**
   * List workers with pagination
   * Capability: WORKER.LIST
   */
  static async listWorkers(params = {}) {
    const token = localStorage.getItem('authToken');
    const { page = 0, size = 20, search } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search })
    });
    
    const response = await apiClient.get(
      `/api/v1/worker/list?${queryParams}`,
      token
    );
    
    return {
      success: true,
      data: response.content || response.data,
      totalElements: response.totalElements || 0,
      totalPages: response.totalPages || 0
    };
  }

  /**
   * Create new worker
   * Capability: WORKER.CREATE
   */
  static async createWorker(workerData) {
    const token = localStorage.getItem('authToken');
    
    const response = await apiClient.post(
      '/api/v1/worker/create',
      workerData,
      token
    );
    
    return {
      success: true,
      message: 'Worker created successfully',
      data: response
    };
  }
}
```

#### **Step 3: Backend Endpoint (Expected)**

```java
@RestController
@RequestMapping("/api/v1/worker")
public class WorkerController {
  
  /**
   * List workers
   * Required Capability: WORKER.LIST
   */
  @GetMapping("/list")
  @RequiresCapabilities({"WORKER.LIST"})
  public ResponseEntity<Page<Worker>> listWorkers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) String search
  ) {
    // Implementation
    return ResponseEntity.ok(workerService.listWorkers(page, size, search));
  }
  
  /**
   * Create worker
   * Required Capability: WORKER.CREATE
   */
  @PostMapping("/create")
  @RequiresCapabilities({"WORKER.CREATE"})
  public ResponseEntity<Worker> createWorker(@RequestBody WorkerDTO workerDTO) {
    // Implementation
    return ResponseEntity.ok(workerService.createWorker(workerDTO));
  }
}
```

---

### 2️⃣ Worker Upload Flow

#### **Step 1: Upload Component**

**File: `src/components/worker/WorkerUpload.jsx`**

```javascript
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkerApi from '../../api/workerApi';
import { ActionGate } from '../core';

const WorkerUpload = () => {
  const { capabilities } = useAuth();
  const can = capabilities?.can || {};
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // ✅ Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(ext)) {
      alert('Invalid file type. Please upload CSV or Excel files.');
      return;
    }
    
    setSelectedFile(file);
  };

  // ✅ Upload file (requires WORKER.CREATE capability)
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      
      const response = await WorkerApi.uploadWorkerFile(selectedFile, {
        description: 'Worker data upload',
        uploadType: 'WORKER_BULK'
      });
      
      if (response.success) {
        setUploadResult(response.data);
        alert('File uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // ✅ Validate uploaded file (requires WORKER.VALIDATE capability)
  const handleValidate = async (fileId) => {
    try {
      const response = await WorkerApi.validateWorkerFile(fileId);
      
      if (response.success) {
        alert(`Validation complete: ${response.data.validRecords} valid, ${response.data.invalidRecords} invalid`);
      }
    } catch (err) {
      alert('Failed to validate file');
    }
  };

  // ✅ Download template (requires WORKER.DOWNLOAD capability)
  const handleDownloadTemplate = async () => {
    try {
      await WorkerApi.downloadTemplate();
    } catch (err) {
      alert('Failed to download template');
    }
  };

  return (
    <div className="worker-upload-container">
      <h1>Upload Workers</h1>
      
      {/* ✅ Download template button (requires WORKER.DOWNLOAD) */}
      <ActionGate requiredCapabilities={['WORKER.DOWNLOAD']}>
        <button onClick={handleDownloadTemplate}>
          Download Template
        </button>
      </ActionGate>

      {/* ✅ File upload (requires WORKER.CREATE) */}
      <ActionGate requiredCapabilities={['WORKER.CREATE']}>
        <div className="upload-section">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </ActionGate>

      {/* ✅ Show validation button after upload (requires WORKER.VALIDATE) */}
      {uploadResult && (
        <ActionGate requiredCapabilities={['WORKER.VALIDATE']}>
          <div className="validation-section">
            <p>File uploaded: {uploadResult.fileName}</p>
            <p>Total records: {uploadResult.totalRecords}</p>
            
            <button onClick={() => handleValidate(uploadResult.fileId)}>
              Validate File
            </button>
          </div>
        </ActionGate>
      )}
    </div>
  );
};

export default WorkerUpload;
```

#### **Step 2: Upload API Methods**

**File: `src/api/workerApi.js`**

```javascript
export class WorkerApi {
  /**
   * Upload worker file
   * Capability: WORKER.CREATE
   */
  static async uploadWorkerFile(file, metadata = {}) {
    const token = localStorage.getItem('authToken');
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    const response = await apiClient.post(
      '/api/worker/uploaded-data/upload',
      formData,
      token,
      { 'Content-Type': 'multipart/form-data' }
    );
    
    return {
      success: true,
      data: {
        fileId: response.fileId || response.id,
        fileName: response.fileName || file.name,
        totalRecords: response.totalRecords || 0
      }
    };
  }

  /**
   * Validate uploaded file
   * Capability: WORKER.VALIDATE
   */
  static async validateWorkerFile(fileId) {
    const token = localStorage.getItem('authToken');
    
    const response = await apiClient.post(
      `/api/worker/uploaded-data/file/${fileId}/validate`,
      {},
      token
    );
    
    return {
      success: true,
      data: {
        fileId: response.fileId,
        validRecords: response.validRecords || 0,
        invalidRecords: response.invalidRecords || 0,
        errors: response.errors || []
      }
    };
  }

  /**
   * Download worker template
   * Capability: WORKER.DOWNLOAD
   */
  static async downloadTemplate() {
    const token = localStorage.getItem('authToken');
    
    const response = await apiClient.get(
      '/api/v1/worker/template',
      token,
      { responseType: 'blob' }
    );
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'worker_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true };
  }
}
```

---

## 🔒 Security Flow

### Frontend Security Checks

```javascript
// 1. Check capability before rendering UI
const { capabilities } = useAuth();
const can = capabilities?.can || {};

if (can['WORKER.CREATE']) {
  // Show "Add Worker" button
}

// 2. Check capability before API call
const handleCreate = async (workerData) => {
  // Even though UI check exists, API will also validate
  const response = await WorkerApi.createWorker(workerData);
};
```

### Backend Security Validation

```java
@PostMapping("/create")
@RequiresCapabilities({"WORKER.CREATE"})
public ResponseEntity<Worker> createWorker(@RequestBody WorkerDTO dto) {
  // 1. JWT token validation (automatic)
  // 2. Extract user roles from token
  // 3. Check: Does user have WORKER.CREATE capability?
  //    - User has role: ADMIN
  //    - ADMIN role has policy: "Worker Management"
  //    - Policy grants capability: WORKER.CREATE
  //    - ✅ Access granted
  // 4. Process request
  
  return ResponseEntity.ok(workerService.createWorker(dto));
}
```

---

## 📊 Capability Mapping Summary

### Worker List Page (`/workers/list`)

| UI Element | Capability | API Endpoint |
|------------|-----------|--------------|
| View list | `WORKER.LIST` | `GET /api/v1/worker/list` |
| Add button | `WORKER.CREATE` | `POST /api/v1/worker/create` |
| Edit button | `WORKER.UPDATE` | `PUT /api/v1/worker/{id}` |
| Delete button | `WORKER.DELETE` | `DELETE /api/v1/worker/{id}` |
| View details | `WORKER.READ` | `GET /api/v1/worker/{id}` |

### Worker Upload Page (`/workers/upload`)

| UI Element | Capability | API Endpoint |
|------------|-----------|--------------|
| Upload file | `WORKER.CREATE` | `POST /api/worker/uploaded-data/upload` |
| Validate file | `WORKER.VALIDATE` | `POST /api/worker/uploaded-data/file/{id}/validate` |
| Download template | `WORKER.DOWNLOAD` | `GET /api/v1/worker/template` |
| Generate payments | `WORKER.GENERATE_PAYMENTS` | `POST /api/worker/uploaded-data/file/{id}/generate-request` |

---

## 🚀 Implementation Checklist

### Frontend Tasks

- [x] Create `WorkerApi` service with all CRUD operations
- [x] Implement `WorkerList` component with capability checks
- [x] Implement `WorkerUpload` component with file handling
- [x] Add `ActionGate` components for conditional rendering
- [x] Integrate with `useAuth()` hook for capabilities
- [x] Handle loading, error, and success states
- [x] Add proper TypeScript/JSDoc types
- [ ] Add unit tests for components
- [ ] Add integration tests for API calls

### Backend Tasks

- [ ] Create `WorkerController` with endpoints:
  - [ ] `GET /api/v1/worker/list` (WORKER.LIST)
  - [ ] `GET /api/v1/worker/{id}` (WORKER.READ)
  - [ ] `POST /api/v1/worker/create` (WORKER.CREATE)
  - [ ] `PUT /api/v1/worker/{id}` (WORKER.UPDATE)
  - [ ] `DELETE /api/v1/worker/{id}` (WORKER.DELETE)
  - [ ] `GET /api/v1/worker/template` (WORKER.DOWNLOAD)
- [ ] Create `WorkerUploadController` with endpoints:
  - [ ] `POST /api/worker/uploaded-data/upload` (WORKER.CREATE)
  - [ ] `POST /api/worker/uploaded-data/file/{id}/validate` (WORKER.VALIDATE)
  - [ ] `POST /api/worker/uploaded-data/file/{id}/generate-request` (WORKER.GENERATE_PAYMENTS)
- [ ] Add `@RequiresCapabilities` annotations to all endpoints
- [ ] Implement business logic in services
- [ ] Add validation and error handling
- [ ] Add audit logging
- [ ] Write unit and integration tests

### Routing Configuration

```javascript
// App.jsx or Router configuration
import { WorkerList, WorkerUpload } from './components/worker';

const routes = [
  {
    path: '/workers/list',
    element: <WorkerList />,
    // Page capability check happens in component
  },
  {
    path: '/workers/upload',
    element: <WorkerUpload />,
    // Page capability check happens in component
  }
];
```

---

## 🧪 Testing Examples

### Frontend Component Test

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkerList } from './WorkerList';
import { AuthContext } from '../../contexts/AuthContext';

test('shows Add Worker button when user has WORKER.CREATE capability', () => {
  const mockCapabilities = {
    can: {
      'WORKER.CREATE': true,
      'WORKER.LIST': true
    }
  };
  
  render(
    <AuthContext.Provider value={{ capabilities: mockCapabilities }}>
      <WorkerList />
    </AuthContext.Provider>
  );
  
  const addButton = screen.getByText('Add New Worker');
  expect(addButton).toBeInTheDocument();
});

test('hides Add Worker button when user lacks WORKER.CREATE capability', () => {
  const mockCapabilities = {
    can: {
      'WORKER.LIST': true
      // No WORKER.CREATE
    }
  };
  
  render(
    <AuthContext.Provider value={{ capabilities: mockCapabilities }}>
      <WorkerList />
    </AuthContext.Provider>
  );
  
  const addButton = screen.queryByText('Add New Worker');
  expect(addButton).not.toBeInTheDocument();
});
```

### API Integration Test

```javascript
import WorkerApi from './workerApi';
import { apiClient } from './apiConfig';

jest.mock('./apiConfig');

test('listWorkers calls correct endpoint with parameters', async () => {
  const mockResponse = {
    content: [{ id: 1, name: 'John Doe' }],
    totalElements: 1,
    totalPages: 1
  };
  
  apiClient.get.mockResolvedValue(mockResponse);
  
  const result = await WorkerApi.listWorkers({ page: 0, size: 20 });
  
  expect(apiClient.get).toHaveBeenCalledWith(
    '/api/v1/worker/list?page=0&size=20',
    expect.any(String) // token
  );
  
  expect(result.success).toBe(true);
  expect(result.data).toEqual(mockResponse.content);
});
```

---

## 📝 Notes

1. **Always check capabilities** before showing UI elements
2. **Backend validates** even if frontend checks pass
3. **Handle errors gracefully** with user-friendly messages
4. **Log all operations** for debugging and audit trails
5. **Use TypeScript/JSDoc** for better type safety
6. **Test both positive and negative** scenarios
7. **Follow consistent patterns** across all modules

---

## 🔗 Related Documentation

- [CAPABILITY_FLOW_MAPPING.md](./CAPABILITY_FLOW_MAPPING.md) - Complete system mapping
- [CAPABILITY_SYSTEM_IMPLEMENTATION.md](./CAPABILITY_SYSTEM_IMPLEMENTATION.md) - Architecture details
- [PERMISSION_SYSTEM.md](./PERMISSION_SYSTEM.md) - Permission system overview
- [QUICK_REFERENCE_GUIDE.md](./QUICK_REFERENCE_GUIDE.md) - Quick reference

---

**Last Updated**: October 9, 2025
**Status**: ✅ Frontend Implementation Complete | ⏳ Backend Pending
