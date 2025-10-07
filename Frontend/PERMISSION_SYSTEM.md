# Permission-Based UI System

This document explains the enhanced permission-based UI system that implements the permission matrix from the database structure.

## Overview

The system now uses the actual permissions returned from `/api/auth/me` endpoint to control UI access. The API returns:

```json
{
  "legacyRole": "ADMIN",
  "roles": ["ADMIN"],
  "email": "admin@example.com", 
  "id": 3,
  "fullName": "Administrator",
  "username": "admin",
  "permissions": [
    "MANAGE_ROLES",
    "READ_EMPLOYER_RECEIPTS",
    "GENERATE_WORKER_PAYMENTS",
    // ... more permissions
  ],
  "enabled": true
}
```

## Database Permissions Structure

The system is organized into 6 modules with 25 total permissions:

### Modules and Their Permissions

| Module | Permissions |
|--------|-------------|
| **WORKER** | `READ_WORKER_DATA`, `UPLOAD_WORKER_DATA`, `VALIDATE_WORKER_DATA`, `GENERATE_WORKER_PAYMENTS`, `DELETE_WORKER_DATA` |
| **PAYMENT** | `READ_PAYMENTS`, `PROCESS_PAYMENTS`, `APPROVE_PAYMENTS`, `REJECT_PAYMENTS`, `GENERATE_PAYMENT_REPORTS` |
| **EMPLOYER** | `READ_EMPLOYER_RECEIPTS`, `VALIDATE_EMPLOYER_RECEIPTS`, `SEND_TO_BOARD` |
| **BOARD** | `READ_BOARD_RECEIPTS`, `APPROVE_BOARD_RECEIPTS`, `REJECT_BOARD_RECEIPTS`, `GENERATE_BOARD_REPORTS` |
| **RECONCILIATION** | `READ_RECONCILIATIONS`, `PERFORM_RECONCILIATION`, `GENERATE_RECONCILIATION_REPORTS` |
| **SYSTEM** | `MANAGE_USERS`, `MANAGE_ROLES`, `VIEW_SYSTEM_LOGS`, `SYSTEM_MAINTENANCE`, `DATABASE_CLEANUP` |

## UI Components

### 1. PermissionButton

Button component with built-in permission checking.

```jsx
import { PermissionButton } from '../components/core';

// Single permission
<PermissionButton 
  permission="UPLOAD_WORKER_DATA" 
  onClick={handleUpload}
>
  Upload Data
</PermissionButton>

// Multiple permissions (OR logic)
<PermissionButton 
  permissions={["READ_PAYMENTS", "PROCESS_PAYMENTS"]} 
  onClick={handleProcess}
>
  Process Payments
</PermissionButton>

// Role-based
<PermissionButton 
  roles={["ADMIN"]} 
  onClick={handleAdmin}
>
  Admin Action
</PermissionButton>

// Module-based
<PermissionButton 
  module="WORKER" 
  onClick={handleWorker}
>
  Worker Actions
</PermissionButton>

// Hide vs Disable
<PermissionButton 
  permission="DELETE_WORKER_DATA"
  hideIfNoPermission={false}  // Shows disabled button instead of hiding
  onClick={handleDelete}
>
  Delete Data
</PermissionButton>
```

### 2. ActionGate

Conditional rendering based on permissions.

```jsx
import { ActionGate } from '../components/core';

// Single permission
<ActionGate 
  permission="READ_WORKER_DATA"
  fallback={<div>Access denied</div>}
>
  <WorkerDataComponent />
</ActionGate>

// Multiple permissions  
<ActionGate 
  permissions={["APPROVE_PAYMENTS", "REJECT_PAYMENTS"]}
  requireAll={false}  // OR logic (default)
  fallback={<div>Payment approval access required</div>}
>
  <PaymentApprovalComponent />
</ActionGate>

// Module access
<ActionGate 
  module="SYSTEM"
  fallback={<div>System admin access required</div>}
>
  <SystemAdminPanel />
</ActionGate>

// Role-based
<ActionGate 
  roles={["ADMIN", "RECONCILIATION_OFFICER"]}
  fallback={<div>Administrative access required</div>}
>
  <AdminComponent />
</ActionGate>
```

### 3. ModulePermissionGate

Module-level access control.

```jsx
import { ModulePermissionGate } from '../components/core';

// Basic module access
<ModulePermissionGate 
  module="WORKER"
  fallback={<div>Worker module access required</div>}
>
  <WorkerDashboard />
</ModulePermissionGate>

// Module + specific permission
<ModulePermissionGate 
  module="PAYMENT"
  permission="PROCESS_PAYMENTS"
  fallback={<div>Payment processing access required</div>}
>
  <PaymentProcessor />
</ModulePermissionGate>

// Module + multiple permissions
<ModulePermissionGate 
  module="SYSTEM"
  permissions={["MANAGE_USERS", "MANAGE_ROLES"]}
  requireAll={true}  // AND logic
  fallback={<div>Full system management access required</div>}
>
  <SystemManagement />
</ModulePermissionGate>
```

### 4. PermissionRenderer

Advanced conditional rendering with rule-based system.

```jsx
import { PermissionRenderer } from '../components/core';

// Rule-based rendering
<PermissionRenderer
  rules={[
    {
      roles: ["ADMIN"],
      component: <AdminDashboard />
    },
    {
      roles: ["WORKER"],
      component: <WorkerDashboard />
    },
    {
      roles: ["EMPLOYER"],
      component: <EmployerDashboard />
    }
  ]}
  fallback={<div>Please contact admin for access</div>}
/>

// Permission-based rules
<PermissionRenderer
  rules={[
    {
      permissions: ["MANAGE_USERS"],
      component: <AdminUserManagement />
    },
    {
      permissions: ["READ_USERS"],
      component: <ReadOnlyUserList />
    }
  ]}
  fallback={<div>No user access permissions</div>}
/>

// Module-based rules
<PermissionRenderer
  rules={[
    {
      module: "SYSTEM",
      component: <SystemSettings />
    },
    {
      module: "PAYMENT", 
      component: <PaymentDashboard />
    }
  ]}
/>
```

### 5. PermissionSwitch

Simple conditional rendering helper.

```jsx
import { PermissionSwitch } from '../components/core';

// Show/hide based on permission
<PermissionSwitch permission="MANAGE_USERS">
  <div>You can manage users</div>
</PermissionSwitch>

// Inverse logic (show when permission NOT present)
<PermissionSwitch 
  permission="MANAGE_USERS" 
  inverse={true}
>
  <div>You cannot manage users</div>
</PermissionSwitch>

// Multiple permissions
<PermissionSwitch 
  permissions={["UPLOAD_WORKER_DATA", "DELETE_WORKER_DATA"]}
  requireAll={true}
>
  <div>You have full worker data permissions</div>
</PermissionSwitch>
```

## Permission Context Hook

```jsx
import { usePermissions } from '../contexts/PermissionContext';

const MyComponent = () => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasModuleAccess,
    user,
    loading
  } = usePermissions();

  // Check single permission
  const canUpload = hasPermission('UPLOAD_WORKER_DATA');

  // Check multiple permissions (OR logic)
  const canManagePayments = hasAnyPermission(['APPROVE_PAYMENTS', 'REJECT_PAYMENTS']);

  // Check multiple permissions (AND logic)
  const canFullyManageUsers = hasAllPermissions(['MANAGE_USERS', 'MANAGE_ROLES']);

  // Check role
  const isAdmin = hasRole('ADMIN');

  // Check multiple roles
  const isAdminOrOfficer = hasAnyRole(['ADMIN', 'RECONCILIATION_OFFICER']);

  // Check module access
  const canAccessWorkerModule = hasModuleAccess('WORKER');

  return (
    <div>
      {/* Use the permission checks */}
    </div>
  );
};
```

## Utility Functions

```jsx
import { 
  getPermissionsForModule,
  getAPIEndpointsForPermission,
  hasRequiredPermissionForAPI,
  getNavigationConfig
} from '../utils/permissionMapping';

// Get all permissions for a module
const workerPermissions = getPermissionsForModule('WORKER');

// Get API endpoints that require a specific permission
const endpoints = getAPIEndpointsForPermission('READ_PAYMENTS');

// Check if user can access a specific API endpoint
const canAccessAPI = hasRequiredPermissionForAPI(
  user.permissions, 
  '/api/v1/worker-payments'
);

// Generate navigation based on user permissions
const navigation = getNavigationConfig(user.permissions);
```

## Permission Matrix

### Role to Permission Mapping

| Role | Typical Permissions |
|------|-------------------|
| **ADMIN** | All permissions (full system access) |
| **RECONCILIATION_OFFICER** | Worker data validation, payment processing, reconciliation |
| **WORKER** | Worker data upload/read, payment viewing |
| **EMPLOYER** | Employer receipts, payment viewing |
| **BOARD** | Board receipt approval/rejection, board reports |

### API Endpoint Protection

Each permission maps to specific API endpoints:

```javascript
const PERMISSION_API_MAP = {
  READ_WORKER_DATA: [
    '/api/v1/worker-payments',
    '/api/worker/uploaded-data/files/summaries'
  ],
  UPLOAD_WORKER_DATA: [
    '/api/worker/uploaded-data/upload'
  ],
  // ... more mappings
};
```

## Best Practices

1. **Use the most specific permission check** - Prefer `permission` over `module` over `role`
2. **Provide meaningful fallbacks** - Always include user-friendly error messages
3. **Use OR logic by default** - Most UI elements should use `hasAnyPermission` 
4. **Module gates for major sections** - Use `ModulePermissionGate` for entire dashboard sections
5. **Button-level permissions** - Use `PermissionButton` for all action buttons
6. **Loading states** - All components handle loading states automatically

## Migration Guide

### Updating Existing Components

1. Replace hardcoded role checks with permission checks
2. Use `PermissionButton` instead of regular buttons
3. Wrap sections with `ActionGate` or `ModulePermissionGate`
4. Use `PermissionRenderer` for complex conditional logic

### Before (Role-based)
```jsx
// Old way - role-based
{user?.role === 'ADMIN' && (
  <button onClick={handleDelete}>Delete</button>
)}
```

### After (Permission-based)
```jsx
// New way - permission-based
<PermissionButton 
  permission="DELETE_WORKER_DATA"
  onClick={handleDelete}
>
  Delete
</PermissionButton>
```

## Examples

See `ExampleDashboard.jsx` and `WorkerDashboard.jsx` for complete implementation examples.
