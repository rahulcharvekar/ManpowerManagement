# Capability Flow Mapping

## Overview
This document maps the complete flow from UI pages → Actions → Capabilities → Backend API endpoints in the Manpower Management System.

---

## 🔄 Complete Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────────┤
│  • User navigates to a page                                          │
│  • Page checks: can[action] from capability response                │
│  • Buttons/Actions rendered based on permissions                     │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        CAPABILITY LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│  GET /api/auth/ui-config                                            │
│  Returns:                                                            │
│  • can: { "WORKER.CREATE": true, "WORKER.UPDATE": true, ... }      │
│  • pages: [ { path, name, actions: ["WORKER.CREATE", ...] } ]      │
│  • endpoints: [ { path, method, service, ... } ]                    │
│  • roles: ["ADMIN"]                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND API LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│  • API endpoints protected by policies                               │
│  • Policies grant capabilities based on user roles                   │
│  • Backend validates: Does user have required capability?           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Page → Actions → Capabilities → API Mapping

### 1️⃣ WORKERS MODULE

#### **Page: Workers (/workers)**
- **Type**: Parent Menu Item
- **Icon**: people
- **Display Order**: 2
- **Page ID**: 2
- **Actions**: None (parent page)

---

#### **Page: Worker List (/workers/list)**
- **Type**: Menu Item
- **Icon**: list
- **Display Order**: 1
- **Page ID**: 8
- **Parent**: Workers (/workers)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["WORKER.CREATE"]) {
  // Show "Add Worker" button
}
if (can["WORKER.UPDATE"]) {
  // Show "Edit" button for each worker
}
if (can["WORKER.DELETE"]) {
  // Show "Delete" button for each worker
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View worker list | `WORKER.LIST` | `/api/v1/worker/list` | GET | TBD |
| Read worker details | `WORKER.READ` | `/api/v1/worker/{id}` | GET | TBD |
| Add new worker | `WORKER.CREATE` | `/api/v1/worker/create` | POST | TBD |
| Edit worker | `WORKER.UPDATE` | `/api/v1/worker/{id}` | PUT | TBD |
| Delete worker | `WORKER.DELETE` | `/api/v1/worker/{id}` | DELETE | TBD |

**Capabilities Available for ADMIN:**
- ✅ `WORKER.CREATE`: true
- ✅ `WORKER.UPDATE`: true
- ✅ `WORKER.DELETE`: true
- ✅ `WORKER.READ`: true
- ✅ `WORKER.LIST`: true

---

#### **Page: Upload Workers (/workers/upload)**
- **Type**: Menu Item
- **Icon**: upload
- **Display Order**: 2
- **Page ID**: 9
- **Parent**: Workers (/workers)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["WORKER.CREATE"] && can["WORKER.VALIDATE"]) {
  // Show upload form
}
if (can["WORKER.DOWNLOAD"]) {
  // Show download template button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| Upload worker file | `WORKER.CREATE` | `/api/v1/worker/upload` | POST | TBD |
| Validate workers | `WORKER.VALIDATE` | `/api/v1/worker/validate` | POST | TBD |
| Download template | `WORKER.DOWNLOAD` | `/api/v1/worker/template` | GET | TBD |

**Capabilities Available for ADMIN:**
- ✅ `WORKER.CREATE`: true
- ✅ `WORKER.VALIDATE`: true
- ✅ `WORKER.DOWNLOAD`: true

---

### 2️⃣ PAYMENTS MODULE

#### **Page: Payments (/payments)**
- **Type**: Parent Menu Item
- **Icon**: payments
- **Display Order**: 3
- **Page ID**: 3
- **Actions**: None (parent page)

---

#### **Page: Payment List (/payments/list)**
- **Type**: Menu Item
- **Icon**: list
- **Display Order**: 1
- **Page ID**: 11
- **Parent**: Payments (/payments)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["PAYMENT.CREATE"]) {
  // Show "Create Payment" button
}
if (can["PAYMENT.APPROVE"]) {
  // Show "Approve" button
}
if (can["PAYMENT.REJECT"]) {
  // Show "Reject" button
}
if (can["PAYMENT.PROCESS"]) {
  // Show "Process" button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View payment list | `PAYMENT.LIST` | `/api/v1/payment/list` | GET | TBD |
| View payment details | `PAYMENT.READ` | `/api/v1/payment/{id}` | GET | TBD |
| Create payment | `PAYMENT.CREATE` | `/api/v1/payment/create` | POST | TBD |
| Update payment | `PAYMENT.UPDATE` | `/api/v1/payment/{id}` | PUT | TBD |
| Delete payment | `PAYMENT.DELETE` | `/api/v1/payment/{id}` | DELETE | TBD |
| Approve payment | `PAYMENT.APPROVE` | `/api/v1/payment/{id}/approve` | POST | TBD |
| Reject payment | `PAYMENT.REJECT` | `/api/v1/payment/{id}/reject` | POST | TBD |
| Process payment | `PAYMENT.PROCESS` | `/api/v1/payment/{id}/process` | POST | TBD |
| Generate reports | `PAYMENT.GENERATE_REPORTS` | `/api/v1/payment/reports` | GET | TBD |

**Capabilities Available for ADMIN:**
- ✅ `PAYMENT.CREATE`: true
- ✅ `PAYMENT.APPROVE`: true
- ✅ `PAYMENT.REJECT`: true
- ✅ `PAYMENT.PROCESS`: true
- ✅ `PAYMENT.UPDATE`: true
- ✅ `PAYMENT.DELETE`: true
- ✅ `PAYMENT.READ`: true
- ✅ `PAYMENT.LIST`: true
- ✅ `PAYMENT.GENERATE_REPORTS`: true

---

### 3️⃣ ADMINISTRATION MODULE

#### **Page: Administration (/admin)**
- **Type**: Parent Menu Item
- **Icon**: settings
- **Display Order**: 7
- **Page ID**: 7
- **Actions**: None (parent page)

---

#### **Page: User Management (/admin/users)**
- **Type**: Menu Item
- **Icon**: people
- **Display Order**: 1
- **Page ID**: 14
- **Parent**: Administration (/admin)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["USER_MANAGEMENT.CREATE"]) {
  // Show "Add User" button
}
if (can["USER_MANAGEMENT.UPDATE"]) {
  // Show "Edit" button
}
if (can["USER_MANAGEMENT.DELETE"]) {
  // Show "Delete" button
}
if (can["USER_MANAGEMENT.ACTIVATE"]) {
  // Show "Activate/Deactivate" toggle
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View user list | `USER_MANAGEMENT.LIST` | `/api/auth/users` | GET | 8 |
| View user details | `USER_MANAGEMENT.READ` | `/api/auth/users/{id}` | GET | 9 |
| Create user | `USER_MANAGEMENT.CREATE` | `/api/auth/register` | POST | 10 |
| Update user | `USER_MANAGEMENT.UPDATE` | `/api/auth/users/{id}` | PUT | 11 |
| Delete user | `USER_MANAGEMENT.DELETE` | `/api/auth/users/{id}` | DELETE | 12 |
| Activate user | `USER_MANAGEMENT.ACTIVATE` | `/api/auth/users/{id}/activate` | PATCH | 13 |
| Deactivate user | `USER_MANAGEMENT.ACTIVATE` | `/api/auth/users/{id}/deactivate` | PATCH | 14 |

**Capabilities Available for ADMIN:**
- ✅ `USER_MANAGEMENT.CREATE`: true
- ✅ `USER_MANAGEMENT.UPDATE`: true
- ✅ `USER_MANAGEMENT.DELETE`: true
- ✅ `USER_MANAGEMENT.READ`: true
- ✅ `USER_MANAGEMENT.LIST`: true
- ✅ `USER_MANAGEMENT.ACTIVATE`: true

---

### 4️⃣ ROLE MANAGEMENT (Admin Submodule)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["ROLE_MANAGEMENT.CREATE"]) {
  // Show "Create Role" button
}
if (can["ROLE_MANAGEMENT.UPDATE"]) {
  // Show "Edit Role" button
}
if (can["ROLE_MANAGEMENT.DELETE"]) {
  // Show "Delete Role" button
}
if (can["ROLE_MANAGEMENT.ASSIGN_USERS"]) {
  // Show "Assign Users" button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View role list | `ROLE_MANAGEMENT.LIST` | `/api/admin/roles` | GET | 15 |
| View role details | `ROLE_MANAGEMENT.READ` | `/api/admin/roles/{id}` | GET | 16 |
| Create role | `ROLE_MANAGEMENT.CREATE` | `/api/admin/roles` | POST | 17 |
| Update role | `ROLE_MANAGEMENT.UPDATE` | `/api/admin/roles/{id}` | PUT | 18 |
| Delete role | `ROLE_MANAGEMENT.DELETE` | `/api/admin/roles/{id}` | DELETE | 19 |
| View users in role | `ROLE_MANAGEMENT.ASSIGN_USERS` | `/api/admin/roles/{id}/users` | GET | 20 |
| Assign user to role | `ROLE_MANAGEMENT.ASSIGN_USERS` | `/api/admin/roles/{roleId}/users/{userId}` | POST | 21 |
| Remove user from role | `ROLE_MANAGEMENT.ASSIGN_USERS` | `/api/admin/roles/{roleId}/users/{userId}` | DELETE | 22 |

**Capabilities Available for ADMIN:**
- ✅ `ROLE_MANAGEMENT.CREATE`: true
- ✅ `ROLE_MANAGEMENT.UPDATE`: true
- ✅ `ROLE_MANAGEMENT.DELETE`: true
- ✅ `ROLE_MANAGEMENT.READ`: true
- ✅ `ROLE_MANAGEMENT.LIST`: true
- ✅ `ROLE_MANAGEMENT.ASSIGN_USERS`: true

---

### 5️⃣ EMPLOYER MODULE

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["EMPLOYER.CREATE"]) {
  // Show "Add Employer" button
}
if (can["EMPLOYER.UPDATE"]) {
  // Show "Edit" button
}
if (can["EMPLOYER.DELETE"]) {
  // Show "Delete" button
}
if (can["EMPLOYER.SEND_TO_BOARD"]) {
  // Show "Send to Board" button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View employer list | `EMPLOYER.LIST` | `/api/v1/employer/list` | GET | TBD |
| View employer details | `EMPLOYER.READ` | `/api/v1/employer/{id}` | GET | TBD |
| Create employer | `EMPLOYER.CREATE` | `/api/v1/employer/create` | POST | TBD |
| Update employer | `EMPLOYER.UPDATE` | `/api/v1/employer/{id}` | PUT | TBD |
| Delete employer | `EMPLOYER.DELETE` | `/api/v1/employer/{id}` | DELETE | TBD |
| View receipts | `EMPLOYER.VIEW_RECEIPTS` | `/api/v1/employer/{id}/receipts` | GET | TBD |
| Validate receipts | `EMPLOYER.VALIDATE_RECEIPTS` | `/api/v1/employer/{id}/validate` | POST | TBD |
| Send to board | `EMPLOYER.SEND_TO_BOARD` | `/api/v1/employer/{id}/send-to-board` | POST | TBD |

**Capabilities Available for ADMIN:**
- ✅ `EMPLOYER.CREATE`: true
- ✅ `EMPLOYER.UPDATE`: true
- ✅ `EMPLOYER.DELETE`: true
- ✅ `EMPLOYER.READ`: true
- ✅ `EMPLOYER.LIST`: true
- ✅ `EMPLOYER.VIEW_RECEIPTS`: true
- ✅ `EMPLOYER.VALIDATE_RECEIPTS`: true
- ✅ `EMPLOYER.SEND_TO_BOARD`: true

---

### 6️⃣ BOARD MODULE

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["BOARD.APPROVE"]) {
  // Show "Approve" button
}
if (can["BOARD.REJECT"]) {
  // Show "Reject" button
}
if (can["BOARD.GENERATE_REPORTS"]) {
  // Show "Generate Report" button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View board list | `BOARD.LIST` | `/api/v1/board/list` | GET | TBD |
| View board details | `BOARD.READ` | `/api/v1/board/{id}` | GET | TBD |
| Approve board item | `BOARD.APPROVE` | `/api/v1/board/{id}/approve` | POST | TBD |
| Reject board item | `BOARD.REJECT` | `/api/v1/board/{id}/reject` | POST | TBD |
| View receipts | `BOARD.VIEW_RECEIPTS` | `/api/v1/board/{id}/receipts` | GET | TBD |
| Generate reports | `BOARD.GENERATE_REPORTS` | `/api/v1/board/reports` | GET | TBD |

**Capabilities Available for ADMIN:**
- ✅ `BOARD.READ`: true
- ✅ `BOARD.LIST`: true
- ✅ `BOARD.APPROVE`: true
- ✅ `BOARD.REJECT`: true
- ✅ `BOARD.VIEW_RECEIPTS`: true
- ✅ `BOARD.GENERATE_REPORTS`: true

---

### 7️⃣ RECONCILIATION MODULE

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["RECONCILIATION.PERFORM"]) {
  // Show "Perform Reconciliation" button
}
if (can["RECONCILIATION.GENERATE_REPORTS"]) {
  // Show "Generate Report" button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View reconciliation list | `RECONCILIATION.LIST` | `/api/v1/reconciliation/list` | GET | TBD |
| View reconciliation details | `RECONCILIATION.READ` | `/api/v1/reconciliation/{id}` | GET | TBD |
| Perform reconciliation | `RECONCILIATION.PERFORM` | `/api/v1/reconciliation/perform` | POST | TBD |
| Generate reports | `RECONCILIATION.GENERATE_REPORTS` | `/api/v1/reconciliation/reports` | GET | TBD |

**Capabilities Available for ADMIN:**
- ✅ `RECONCILIATION.PERFORM`: true
- ✅ `RECONCILIATION.READ`: true
- ✅ `RECONCILIATION.LIST`: true
- ✅ `RECONCILIATION.GENERATE_REPORTS`: true

---

### 8️⃣ DASHBOARD MODULE

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["DASHBOARD.VIEW"]) {
  // Show dashboard
}
if (can["DASHBOARD.VIEW_STATS"]) {
  // Show statistics cards
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View dashboard | `DASHBOARD.VIEW` | `/api/dashboard` | GET | 57 |
| View statistics | `DASHBOARD.VIEW_STATS` | `/api/dashboard/stats` | GET | 58 |

**Capabilities Available for ADMIN:**
- ✅ `DASHBOARD.VIEW`: true
- ✅ `DASHBOARD.VIEW_STATS`: true

---

### 9️⃣ AUDIT MODULE

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["AUDIT.VIEW_LOGS"]) {
  // Show audit logs
}
if (can["AUDIT.VIEW_AUTH_LOGS"]) {
  // Show auth logs
}
if (can["AUDIT.EXPORT"]) {
  // Show export button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View audit logs | `AUDIT.VIEW_LOGS` | `/api/audit/logs` | GET | 59 |
| View auth logs | `AUDIT.VIEW_AUTH_LOGS` | `/api/audit/auth-logs` | GET | 60 |
| Export logs | `AUDIT.EXPORT` | `/api/audit/export` | GET | 61 |

**Capabilities Available for ADMIN:**
- ✅ `AUDIT.VIEW_LOGS`: true
- ✅ `AUDIT.VIEW_AUTH_LOGS`: true
- ✅ `AUDIT.EXPORT`: true

---

### 🔟 SYSTEM MODULE

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["SYSTEM.VIEW_CONFIG"]) {
  // Show system configuration
}
if (can["SYSTEM.UPDATE_CONFIG"]) {
  // Show "Edit Configuration" button
}
if (can["SYSTEM.MAINTENANCE"]) {
  // Show "Maintenance Mode" toggle
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View system config | `SYSTEM.VIEW_CONFIG` | `/api/v1/system/config` | GET | TBD |
| Update system config | `SYSTEM.UPDATE_CONFIG` | `/api/v1/system/config` | PUT | TBD |
| Enable maintenance | `SYSTEM.MAINTENANCE` | `/api/v1/system/maintenance` | POST | TBD |
| Database cleanup | `SYSTEM.DATABASE_CLEANUP` | `/api/v1/system/cleanup` | POST | TBD |

**Capabilities Available for ADMIN:**
- ✅ `SYSTEM.VIEW_CONFIG`: true
- ✅ `SYSTEM.UPDATE_CONFIG`: true
- ✅ `SYSTEM.MAINTENANCE`: true
- ✅ `SYSTEM.DATABASE_CLEANUP`: true

---

### 1️⃣1️⃣ PERMISSION MANAGEMENT (Admin Submodule)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check
if (can["PERMISSION_MANAGEMENT.CREATE"]) {
  // Show "Create Permission" button
}
if (can["PERMISSION_MANAGEMENT.UPDATE"]) {
  // Show "Edit" button
}
if (can["PERMISSION_MANAGEMENT.DELETE"]) {
  // Show "Delete" button
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| View permission list | `PERMISSION_MANAGEMENT.LIST` | `/api/v1/permissions/list` | GET | TBD |
| View permission details | `PERMISSION_MANAGEMENT.READ` | `/api/v1/permissions/{id}` | GET | TBD |
| Create permission | `PERMISSION_MANAGEMENT.CREATE` | `/api/v1/permissions/create` | POST | TBD |
| Update permission | `PERMISSION_MANAGEMENT.UPDATE` | `/api/v1/permissions/{id}` | PUT | TBD |
| Delete permission | `PERMISSION_MANAGEMENT.DELETE` | `/api/v1/permissions/{id}` | DELETE | TBD |

**Capabilities Available for ADMIN:**
- ✅ `PERMISSION_MANAGEMENT.CREATE`: true
- ✅ `PERMISSION_MANAGEMENT.UPDATE`: true
- ✅ `PERMISSION_MANAGEMENT.DELETE`: true
- ✅ `PERMISSION_MANAGEMENT.READ`: true
- ✅ `PERMISSION_MANAGEMENT.LIST`: true

---

### 1️⃣2️⃣ AUTHENTICATION (Self-Service)

**UI Actions & Capabilities Required:**

```javascript
// Frontend Check (All users have these)
if (can["AUTH.VIEW_PROFILE"]) {
  // Show profile link
}
if (can["AUTH.UPDATE_PROFILE"]) {
  // Show "Edit Profile" button
}
if (can["AUTH.CHANGE_PASSWORD"]) {
  // Show "Change Password" link
}
```

| UI Action | Required Capability | Backend API Endpoint | HTTP Method | Endpoint ID |
|-----------|-------------------|---------------------|-------------|-------------|
| Login | `AUTH.LOGIN` | `/api/auth/login` | POST | 1 |
| Logout | `AUTH.LOGOUT` | `/api/auth/logout` | POST | 2 |
| Refresh token | `AUTH.REFRESH_TOKEN` | `/api/auth/refresh` | POST | 3 |
| View profile | `AUTH.VIEW_PROFILE` | `/api/auth/me` | GET | 4 |
| Update profile | `AUTH.UPDATE_PROFILE` | `/api/auth/me` | PUT | 5 |
| Change password | `AUTH.CHANGE_PASSWORD` | `/api/auth/change-password` | PUT | 6 |
| Get UI config | N/A (always allowed) | `/api/auth/ui-config` | GET | 7 |

**Capabilities Available for ADMIN:**
- ✅ `AUTH.LOGIN`: true
- ✅ `AUTH.LOGOUT`: true
- ✅ `AUTH.REFRESH_TOKEN`: true
- ✅ `AUTH.VIEW_PROFILE`: true
- ✅ `AUTH.UPDATE_PROFILE`: true
- ✅ `AUTH.CHANGE_PASSWORD`: true

---

## 🎯 Implementation Pattern

### Frontend Usage Pattern

```javascript
// 1. Load capabilities on app initialization
const { capabilities } = useAuth(); // From AuthContext
const { can, pages, endpoints } = capabilities;

// 2. Conditionally render UI elements
function WorkerListPage() {
  return (
    <div>
      {can["WORKER.CREATE"] && (
        <button onClick={createWorker}>Add Worker</button>
      )}
      
      {can["WORKER.UPDATE"] && (
        <button onClick={editWorker}>Edit</button>
      )}
      
      {can["WORKER.DELETE"] && (
        <button onClick={deleteWorker}>Delete</button>
      )}
    </div>
  );
}

// 3. Dynamic navigation rendering
function Navigation() {
  return (
    <nav>
      {pages
        .filter(page => page.isMenuItem)
        .map(page => (
          <NavLink key={page.id} to={page.path}>
            {page.name}
          </NavLink>
        ))}
    </nav>
  );
}

// 4. Using PermissionGate component
<PermissionGate requiredCapabilities={["WORKER.CREATE"]}>
  <button onClick={createWorker}>Add Worker</button>
</PermissionGate>
```

### Backend Policy Pattern

```javascript
// Example Policy Definition (Backend)
{
  name: "Worker Management",
  capabilities: [
    "WORKER.CREATE",
    "WORKER.UPDATE",
    "WORKER.DELETE",
    "WORKER.READ",
    "WORKER.LIST",
    "WORKER.VALIDATE",
    "WORKER.DOWNLOAD"
  ],
  roles: ["ADMIN", "WORKER_MANAGER"]
}

// Endpoint Protection (Backend)
@POST("/api/v1/worker/create")
@RequiresCapabilities(["WORKER.CREATE"])
async createWorker(req, res) {
  // Middleware validates user has WORKER.CREATE capability
  // Implementation...
}
```

---

## 📋 Complete Capability List (ADMIN Role)

The ADMIN role has **ALL** 69 capabilities:

### Authentication (6)
- AUTH.LOGIN
- AUTH.LOGOUT
- AUTH.REFRESH_TOKEN
- AUTH.VIEW_PROFILE
- AUTH.UPDATE_PROFILE
- AUTH.CHANGE_PASSWORD

### User Management (5)
- USER_MANAGEMENT.CREATE
- USER_MANAGEMENT.READ
- USER_MANAGEMENT.UPDATE
- USER_MANAGEMENT.DELETE
- USER_MANAGEMENT.LIST
- USER_MANAGEMENT.ACTIVATE

### Role Management (6)
- ROLE_MANAGEMENT.CREATE
- ROLE_MANAGEMENT.READ
- ROLE_MANAGEMENT.UPDATE
- ROLE_MANAGEMENT.DELETE
- ROLE_MANAGEMENT.LIST
- ROLE_MANAGEMENT.ASSIGN_USERS

### Permission Management (5)
- PERMISSION_MANAGEMENT.CREATE
- PERMISSION_MANAGEMENT.READ
- PERMISSION_MANAGEMENT.UPDATE
- PERMISSION_MANAGEMENT.DELETE
- PERMISSION_MANAGEMENT.LIST

### Worker Management (7)
- WORKER.CREATE
- WORKER.READ
- WORKER.UPDATE
- WORKER.DELETE
- WORKER.LIST
- WORKER.VALIDATE
- WORKER.DOWNLOAD
- WORKER.GENERATE_PAYMENTS

### Employer Management (8)
- EMPLOYER.CREATE
- EMPLOYER.READ
- EMPLOYER.UPDATE
- EMPLOYER.DELETE
- EMPLOYER.LIST
- EMPLOYER.VIEW_RECEIPTS
- EMPLOYER.VALIDATE_RECEIPTS
- EMPLOYER.SEND_TO_BOARD

### Board Management (6)
- BOARD.READ
- BOARD.LIST
- BOARD.APPROVE
- BOARD.REJECT
- BOARD.VIEW_RECEIPTS
- BOARD.GENERATE_REPORTS

### Payment Management (9)
- PAYMENT.CREATE
- PAYMENT.READ
- PAYMENT.UPDATE
- PAYMENT.DELETE
- PAYMENT.LIST
- PAYMENT.APPROVE
- PAYMENT.REJECT
- PAYMENT.PROCESS
- PAYMENT.GENERATE_REPORTS

### Reconciliation (4)
- RECONCILIATION.READ
- RECONCILIATION.LIST
- RECONCILIATION.PERFORM
- RECONCILIATION.GENERATE_REPORTS

### Dashboard (2)
- DASHBOARD.VIEW
- DASHBOARD.VIEW_STATS

### Audit (3)
- AUDIT.VIEW_LOGS
- AUDIT.VIEW_AUTH_LOGS
- AUDIT.EXPORT

### System (4)
- SYSTEM.VIEW_CONFIG
- SYSTEM.UPDATE_CONFIG
- SYSTEM.MAINTENANCE
- SYSTEM.DATABASE_CLEANUP

---

## 🔐 Security Flow

```
┌────────────────────────────────────────────────────────────┐
│ 1. User Authentication                                      │
│    POST /api/auth/login                                     │
│    • Returns JWT token                                      │
│    • Token contains: userId, roles                         │
└──────────────────────┬─────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────────┐
│ 2. Fetch UI Configuration                                   │
│    GET /api/auth/ui-config                                 │
│    • Backend resolves capabilities based on user roles     │
│    • Returns: { can, pages, endpoints, roles }            │
└──────────────────────┬─────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────────┐
│ 3. Frontend Stores Capabilities                            │
│    • Store in AuthContext/State                            │
│    • Available globally via useAuth() hook                 │
└──────────────────────┬─────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────────┐
│ 4. User Interacts with UI                                  │
│    • Page/Button checks: can["WORKER.CREATE"]             │
│    • If true: Show UI element                              │
│    • If false: Hide UI element                             │
└──────────────────────┬─────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────────┐
│ 5. API Call to Backend                                     │
│    POST /api/v1/worker/create                              │
│    • JWT token sent in Authorization header                │
└──────────────────────┬─────────────────────────────────────┘
                       ↓
┌────────────────────────────────────────────────────────────┐
│ 6. Backend Validates Request                               │
│    • Verify JWT token                                      │
│    • Extract user roles from token                         │
│    • Check: Does user have "WORKER.CREATE" capability?    │
│    • If yes: Process request                               │
│    • If no: Return 403 Forbidden                           │
└────────────────────────────────────────────────────────────┘
```

---

## 🎨 Real-World Example: Worker List Page

### Complete Flow

```javascript
// 1. Page Component
function WorkerListPage() {
  const { capabilities } = useAuth();
  const { can } = capabilities;
  const [workers, setWorkers] = useState([]);

  // Load workers on mount
  useEffect(() => {
    if (can["WORKER.LIST"]) {
      fetchWorkers();
    }
  }, []);

  const fetchWorkers = async () => {
    // API call to GET /api/v1/worker/list
    const response = await apiService.get('/worker/list');
    setWorkers(response.data);
  };

  const handleCreate = async (workerData) => {
    // API call to POST /api/v1/worker/create
    await apiService.post('/worker/create', workerData);
    fetchWorkers(); // Refresh list
  };

  const handleUpdate = async (id, workerData) => {
    // API call to PUT /api/v1/worker/{id}
    await apiService.put(`/worker/${id}`, workerData);
    fetchWorkers(); // Refresh list
  };

  const handleDelete = async (id) => {
    // API call to DELETE /api/v1/worker/{id}
    await apiService.delete(`/worker/${id}`);
    fetchWorkers(); // Refresh list
  };

  return (
    <div>
      <h1>Worker List</h1>
      
      {/* Conditional rendering based on capabilities */}
      {can["WORKER.CREATE"] && (
        <button onClick={() => setShowCreateModal(true)}>
          Add Worker
        </button>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workers.map(worker => (
            <tr key={worker.id}>
              <td>{worker.name}</td>
              <td>{worker.email}</td>
              <td>
                {can["WORKER.UPDATE"] && (
                  <button onClick={() => handleUpdate(worker.id)}>
                    Edit
                  </button>
                )}
                {can["WORKER.DELETE"] && (
                  <button onClick={() => handleDelete(worker.id)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 2. Backend API Endpoint
@GET("/api/v1/worker/list")
@RequiresCapabilities(["WORKER.LIST"])
async listWorkers(req, res) {
  // Policy middleware validates user has WORKER.LIST capability
  const workers = await Worker.findAll();
  res.json(workers);
}

@POST("/api/v1/worker/create")
@RequiresCapabilities(["WORKER.CREATE"])
async createWorker(req, res) {
  // Policy middleware validates user has WORKER.CREATE capability
  const worker = await Worker.create(req.body);
  res.json(worker);
}

// 3. Policy Definition (Backend)
{
  name: "Worker Management Policy",
  capabilities: [
    "WORKER.LIST",
    "WORKER.CREATE",
    "WORKER.UPDATE",
    "WORKER.DELETE"
  ],
  roles: ["ADMIN", "WORKER_MANAGER"],
  description: "Allows full worker management operations"
}
```

---

## 📊 Summary Statistics

- **Total Pages Defined**: 7 pages
  - 3 parent pages (Workers, Payments, Admin)
  - 4 child pages (Worker List, Upload Workers, Payment List, User Management)
  
- **Total Capabilities**: 69 capabilities across 12 modules

- **Total API Endpoints Mapped**: 22 endpoints (from provided data)
  - Auth: 7 endpoints
  - User: 7 endpoints
  - Role: 8 endpoints
  - Audit: 3 endpoints
  - Dashboard: 2 endpoints

- **Pending API Endpoints**: ~40+ endpoints (Worker, Employer, Board, Payment, etc.)

- **Roles Defined**: 1 role (ADMIN with full access)

---

## 🎯 Next Steps

1. **Backend Team**: Define missing API endpoints for:
   - Worker module (7 endpoints)
   - Employer module (8 endpoints)
   - Board module (6 endpoints)
   - Payment module (9 endpoints)
   - Reconciliation module (4 endpoints)
   - System module (4 endpoints)
   - Permission module (5 endpoints)

2. **Create Additional Roles**:
   - WORKER_MANAGER (limited worker operations)
   - PAYMENT_PROCESSOR (payment operations only)
   - BOARD_MEMBER (board approval operations)
   - AUDITOR (read-only access to logs)

3. **Define Additional Policies**:
   - Map specific capabilities to each role
   - Create granular permission sets

4. **Frontend Implementation**:
   - Use this mapping to implement permission checks
   - Follow the patterns shown in examples
   - Use PermissionGate components consistently

---

## 📞 Support

For questions about capability mapping or implementation:
- Review CAPABILITY_SYSTEM_IMPLEMENTATION.md
- Check PERMISSION_SYSTEM.md
- Refer to QUICK_REFERENCE_GUIDE.md
