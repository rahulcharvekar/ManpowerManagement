# Complete Authorization System Setup Guide

## Overview

This guide provides step-by-step instructions for setting up a comprehensive authorization system using the **Capability + Policy + Service Catalog + UI Navigation** model. The system includes:

- **Users** - System users with authentication
- **Roles** - Groups of users with similar permissions
- **Capabilities** - Granular permissions (WHAT can be done)
- **Policies** - Authorization rules (WHO can do WHAT)
- **Endpoints** - API endpoints protected by policies
- **UI Pages** - Frontend pages with navigation structure
- **Page Actions** - UI buttons/actions tied to capabilities

## Authorization Flow

```
User Login → Get User Roles → Evaluate Policies → Grant Capabilities → Filter UI Pages → Show Actions
     ↓              ↓              ↓              ↓              ↓              ↓
  Authenticate   UserRoleAssignment  Policy Expression  Policy→Capability  Page→Capability  Action→Capability
```

## Database Relationships

```
User ↔ Role (many-to-many via user_roles)
Policy → Capability (many-to-many via policy_capabilities)
Endpoint → Policy (many-to-many via endpoint_policies)
UIPage → PageAction (one-to-many)
PageAction → Capability (many-to-one)
PageAction → Endpoint (many-to-one, optional)
```

## Step-by-Step Setup Instructions

### Step 1: Create Capabilities
Capabilities define WHAT actions can be performed.

**API Endpoint:** `POST /api/admin/capabilities`

```json
// Worker capabilities
{
  "name": "WORKER_READ",
  "description": "Read worker data",
  "module": "WORKER",
  "action": "READ",
  "resource": "WORKER"
}
{
  "name": "WORKER_CREATE",
  "description": "Create worker data",
  "module": "WORKER",
  "action": "CREATE",
  "resource": "WORKER"
}
{
  "name": "WORKER_UPDATE",
  "description": "Update worker data",
  "module": "WORKER",
  "action": "UPDATE",
  "resource": "WORKER"
}
{
  "name": "WORKER_VALIDATE",
  "description": "Validate worker data",
  "module": "WORKER",
  "action": "VALIDATE",
  "resource": "WORKER"
}

// Payment capabilities
{
  "name": "PAYMENT_READ",
  "description": "Read payment data",
  "module": "PAYMENT",
  "action": "READ",
  "resource": "PAYMENT"
}
{
  "name": "PAYMENT_PROCESS",
  "description": "Process payments",
  "module": "PAYMENT",
  "action": "PROCESS",
  "resource": "PAYMENT"
}
{
  "name": "PAYMENT_APPROVE",
  "description": "Approve payments",
  "module": "PAYMENT",
  "action": "APPROVE",
  "resource": "PAYMENT"
}

// User Management capabilities
{
  "name": "USER_MANAGE",
  "description": "Manage users",
  "module": "USER_MANAGEMENT",
  "action": "MANAGE",
  "resource": "USER"
}
{
  "name": "ROLE_MANAGE",
  "description": "Manage roles",
  "module": "ROLE_MANAGEMENT",
  "action": "MANAGE",
  "resource": "ROLE"
}

// System capabilities
{
  "name": "SYSTEM_MAINTENANCE",
  "description": "System maintenance",
  "module": "SYSTEM",
  "action": "MAINTENANCE",
  "resource": "SYSTEM"
}
```

### Step 2: Create Policies
Policies define WHO can perform actions via JSON expressions.

**API Endpoint:** `POST /api/admin/policies`

```json
// Admin policy - Full access
{
  "name": "policy.admin.full_access",
  "description": "Admin role has full access to all capabilities", "RBAC",
  "expression": "{\"roles\": [\"ADMIN\"]}",
  "type":
  "capabilityIds": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] // All capabilities
}

// Worker policies
{
  "name": "policy.worker.full",
  "description": "Full worker data access",
  "type": "RBAC",
  "expression": "{\"roles\": [\"WORKER\", \"RECONCILIATION_OFFICER\"]}",
  "capabilityIds": [1, 2, 3, 4] // WORKER_READ, WORKER_CREATE, WORKER_UPDATE, WORKER_VALIDATE
}

// Payment policies
{
  "name": "policy.payment.full",
  "description": "Full payment access",
  "type": "RBAC",
  "expression": "{\"roles\": [\"RECONCILIATION_OFFICER\"]}",
  "capabilityIds": [5, 6, 7] // PAYMENT_READ, PAYMENT_PROCESS, PAYMENT_APPROVE
}

// User management policies
{
  "name": "policy.user_management",
  "description": "User and role management",
  "type": "RBAC",
  "expression": "{\"roles\": [\"ADMIN\"]}",
  "capabilityIds": [8, 9] // USER_MANAGE, ROLE_MANAGE
}

// Auth policies (common for all authenticated users)
{
  "name": "policy.auth.common",
  "description": "Basic auth operations for all users",
  "type": "RBAC",
  "expression": "{\"roles\": [\"ADMIN\", \"RECONCILIATION_OFFICER\", \"WORKER\", \"EMPLOYER\", \"BOARD\"]}",
  "capabilityIds": [] // No specific capabilities, just for auth endpoints
}
```

### Step 3: Create Endpoints
Endpoints represent API endpoints protected by policies.

**API Endpoint:** `POST /api/admin/endpoints`

```json
// Worker endpoints
{
  "service": "worker",
  "version": "v1",
  "method": "GET",
  "path": "/api/worker/data",
  "description": "Retrieve worker data",
  "policyIds": [2] // policy.worker.full
}
{
  "service": "worker",
  "version": "v1",
  "method": "POST",
  "path": "/api/worker/upload",
  "description": "Upload worker data",
  "policyIds": [2] // policy.worker.full
}
{
  "service": "worker",
  "version": "v1",
  "method": "POST",
  "path": "/api/worker/validate",
  "description": "Validate worker data",
  "policyIds": [2] // policy.worker.full
}

// Payment endpoints
{
  "service": "payment",
  "version": "v1",
  "method": "GET",
  "path": "/api/payment/list",
  "description": "Get payment list",
  "policyIds": [3] // policy.payment.full
}
{
  "service": "payment",
  "version": "v1",
  "method": "POST",
  "path": "/api/payment/process",
  "description": "Process payments",
  "policyIds": [3] // policy.payment.full
}

// User management endpoints
{
  "service": "admin",
  "version": "v1",
  "method": "GET",
  "path": "/api/admin/users",
  "description": "Get users",
  "policyIds": [4] // policy.user_management
}
{
  "service": "admin",
  "version": "v1",
  "method": "POST",
  "path": "/api/admin/users",
  "description": "Create user",
  "policyIds": [4] // policy.user_management
}

// Auth endpoints (accessible by all authenticated users)
{
  "service": "auth",
  "version": "v1",
  "method": "GET",
  "path": "/api/auth/profile",
  "description": "Get user profile",
  "policyIds": [5] // policy.auth.common
}
```

### Step 4: Create UI Pages
UI Pages define the frontend navigation structure.

**API Endpoint:** `POST /api/admin/ui-pages`

```json
// Top-level menu items
{
  "key": "DASHBOARD",
  "label": "Dashboard",
  "route": "/dashboard",
  "module": "DASHBOARD",
  "icon": "dashboard",
  "displayOrder": 1,
  "isMenuItem": true,
  "requiredCapability": null
}
{
  "key": "WORKER",
  "label": "Workers",
  "route": "/workers",
  "module": "WORKER",
  "icon": "people",
  "displayOrder": 2,
  "isMenuItem": true,
  "requiredCapability": "WORKER_READ"
}
{
  "key": "PAYMENT",
  "label": "Payments",
  "route": "/payments",
  "module": "PAYMENT",
  "icon": "payments",
  "displayOrder": 3,
  "isMenuItem": true,
  "requiredCapability": "PAYMENT_READ"
}
{
  "key": "ADMIN",
  "label": "Administration",
  "route": "/admin",
  "module": "SYSTEM",
  "icon": "settings",
  "displayOrder": 4,
  "isMenuItem": true,
  "requiredCapability": "USER_MANAGE"
}

// Sub-pages (get parent IDs after creating parents)
{
  "key": "WORKER_LIST",
  "label": "Worker List",
  "route": "/workers/list",
  "module": "WORKER",
  "parentId": 2, // ID of WORKER page
  "icon": "list",
  "displayOrder": 1,
  "isMenuItem": true,
  "requiredCapability": "WORKER_READ"
}
{
  "key": "WORKER_UPLOAD",
  "label": "Upload Workers",
  "route": "/workers/upload",
  "module": "WORKER",
  "parentId": 2, // ID of WORKER page
  "icon": "upload",
  "displayOrder": 2,
  "isMenuItem": true,
  "requiredCapability": "WORKER_CREATE"
}
{
  "key": "ADMIN_USERS",
  "label": "User Management",
  "route": "/admin/users",
  "module": "USER_MANAGEMENT",
  "parentId": 4, // ID of ADMIN page
  "icon": "people",
  "displayOrder": 1,
  "isMenuItem": true,
  "requiredCapability": "USER_MANAGE"
}
```

### Step 5: Create Page Actions
Page Actions define buttons/actions available on UI pages.

**API Endpoint:** `POST /api/admin/page-actions`

```json
// Worker Upload page actions
{
  "pageId": 6, // ID of WORKER_UPLOAD page
  "label": "Upload File",
  "action": "upload",
  "icon": "upload",
  "variant": "primary",
  "capabilityId": 2, // WORKER_CREATE capability ID
  "endpointId": 2, // /api/worker/upload endpoint ID
  "displayOrder": 1
}
{
  "pageId": 6, // ID of WORKER_UPLOAD page
  "label": "Validate Data",
  "action": "validate",
  "icon": "check",
  "variant": "secondary",
  "capabilityId": 4, // WORKER_VALIDATE capability ID
  "endpointId": 3, // /api/worker/validate endpoint ID
  "displayOrder": 2
}

// Payment Process page actions
{
  "pageId": 7, // ID of PAYMENT_PROCESS page (assuming created)
  "label": "Process Payments",
  "action": "process",
  "icon": "play",
  "variant": "primary",
  "capabilityId": 6, // PAYMENT_PROCESS capability ID
  "endpointId": 5, // /api/payment/process endpoint ID
  "displayOrder": 1
}
{
  "pageId": 7, // ID of PAYMENT_PROCESS page
  "label": "Approve Payments",
  "action": "approve",
  "icon": "check",
  "variant": "success",
  "capabilityId": 7, // PAYMENT_APPROVE capability ID
  "endpointId": 5, // /api/payment/process endpoint ID
  "displayOrder": 2
}

// User Management page actions
{
  "pageId": 8, // ID of ADMIN_USERS page
  "label": "Create User",
  "action": "create",
  "icon": "plus",
  "variant": "primary",
  "capabilityId": 8, // USER_MANAGE capability ID
  "endpointId": 7, // /api/admin/users POST endpoint ID
  "displayOrder": 1
}
{
  "pageId": 8, // ID of ADMIN_USERS page
  "label": "Edit User",
  "action": "edit",
  "icon": "edit",
  "variant": "secondary",
  "capabilityId": 8, // USER_MANAGE capability ID
  "endpointId": null, // No specific endpoint
  "displayOrder": 2
}
```

### Step 6: Create Roles
Roles group users with similar permissions.

**API Endpoint:** `POST /api/admin/roles`

```json
{
  "name": "ADMIN",
  "description": "System administrator with full access"
}
{
  "name": "RECONCILIATION_OFFICER",
  "description": "Payment reconciliation officer"
}
{
  "name": "WORKER",
  "description": "Standard worker user"
}
{
  "name": "EMPLOYER",
  "description": "Employer user"
}
{
  "name": "BOARD",
  "description": "Board member"
}
```

### Step 7: Create Users
Users are created through registration.

**API Endpoint:** `POST /api/auth/register`

```json
// Admin user
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "fullName": "System Admin",
  "role": "ADMIN"
}

// Worker user
{
  "username": "worker_user",
  "email": "worker@example.com",
  "password": "WorkerPass123!",
  "fullName": "John Worker",
  "role": "WORKER"
}

// Reconciliation officer
{
  "username": "recon_user",
  "email": "recon@example.com",
  "password": "ReconPass123!",
  "fullName": "Jane Recon",
  "role": "RECONCILIATION_OFFICER"
}
```

### Step 8: Assign Additional Roles to Users (Optional)
Assign multiple roles to users as needed.

**API Endpoint:** `POST /api/admin/roles/assign`

```json
// Assign RECONCILIATION_OFFICER role to a worker (if needed)
{
  "userId": 2, // worker_user ID
  "roleId": 2  // RECONCILIATION_OFFICER role ID
}
```

## Complete Authorization Flow

### 1. User Authentication
- User logs in via `POST /api/auth/login`
- JWT token issued with user info

### 2. Authorization Data Retrieval
- Frontend calls `GET /api/auth/authorization` or similar endpoint
- Backend returns:
  ```json
  {
    "userId": 1,
    "username": "admin_user",
    "roles": ["ADMIN"],
    "can": {
      "WORKER_READ": true,
      "WORKER_CREATE": true,
      "PAYMENT_READ": true,
      // ... all capabilities
    },
    "pages": [
      {
        "id": 1,
        "name": "Dashboard",
        "path": "/dashboard",
        "icon": "dashboard",
        "actions": []
      },
      {
        "id": 2,
        "name": "Workers",
        "path": "/workers",
        "icon": "people",
        "actions": [],
        "children": [
          {
            "id": 6,
            "name": "Upload Workers",
            "path": "/workers/upload",
            "icon": "upload",
            "actions": [
              {
                "name": "upload",
                "label": "Upload File",
                "capability": "WORKER_CREATE",
                "icon": "upload",
                "variant": "primary"
              },
              {
                "name": "validate",
                "label": "Validate Data",
                "capability": "WORKER_VALIDATE",
                "icon": "check",
                "variant": "secondary"
              }
            ]
          }
        ]
      }
    ]
  }
  ```

### 3. UI Rendering
- Frontend builds navigation menu from `pages` array
- Shows only pages where user has required capabilities
- Displays actions on pages based on user's capabilities
- Hides/shows UI elements based on `can` object

### 4. API Access Control
- When user accesses API endpoints, system:
  1. Finds policies linked to endpoint
  2. Evaluates policy expressions against user's roles
  3. Grants/denies access

### 5. Page Action Execution
- When user clicks action button:
  1. Frontend checks if user has required capability
  2. Calls associated endpoint (if specified)
  3. Backend validates endpoint access via policies

## Key Concepts

### Capability-Based Access Control
- **Capabilities** define WHAT can be done (fine-grained permissions)
- **Policies** define WHO can do WHAT (role-based rules)
- **UI Pages** organize functionality into navigable sections
- **Page Actions** provide specific operations tied to capabilities

### Hierarchical Navigation
- Pages can have parent-child relationships
- Parent pages shown if user can access any child pages
- Actions filtered based on user's capabilities

### Policy Expressions
- JSON-based expressions for complex authorization logic
- Currently supports RBAC (Role-Based Access Control)
- Extensible for ABAC (Attribute-Based Access Control)

### Dynamic UI Generation
- Navigation menu built dynamically based on user permissions
- Actions shown/hidden based on capabilities
- No hardcoded permission checks in frontend

## API Endpoints Summary

| Component | Create | Read | Update | Delete |
|-----------|--------|------|--------|--------|
| Capabilities | `POST /api/admin/capabilities` | `GET /api/admin/capabilities` | `PUT /api/admin/capabilities/{id}` | `DELETE /api/admin/capabilities/{id}` |
| Policies | `POST /api/admin/policies` | `GET /api/admin/policies` | `PUT /api/admin/policies/{id}` | `DELETE /api/admin/policies/{id}` |
| Endpoints | `POST /api/admin/endpoints` | `GET /api/admin/endpoints` | `PUT /api/admin/endpoints/{id}` | `DELETE /api/admin/endpoints/{id}` |
| UI Pages | `POST /api/admin/ui-pages` | `GET /api/admin/ui-pages` | `PUT /api/admin/ui-pages/{id}` | `DELETE /api/admin/ui-pages/{id}` |
| Page Actions | `POST /api/admin/page-actions` | `GET /api/admin/page-actions` | `PUT /api/admin/page-actions/{id}` | `DELETE /api/admin/page-actions/{id}` |
| Roles | `POST /api/admin/roles` | `GET /api/admin/roles` | `PUT /api/admin/roles/{id}` | `DELETE /api/admin/roles/{id}` |
| Users | `POST /api/auth/register` | `GET /api/auth/users` | `PUT /api/auth/users/{id}` | `DELETE /api/auth/users/{id}` |
| Role Assignment | `POST /api/admin/roles/assign` | - | - | `POST /api/admin/roles/revoke` |

## Testing the Setup

1. **Login** as different users and verify navigation menus
2. **Check API access** - ensure endpoints respect policies
3. **Verify UI actions** - confirm buttons appear based on capabilities
4. **Test role changes** - assign/revoke roles and verify permission updates

This comprehensive system provides fine-grained access control with a clean separation between authentication (users), authorization (capabilities/policies), and presentation (UI pages/actions).</content>
<parameter name="filePath">/Users/rahulcharvekar/Documents/Repos/ManpowerManagement/PaymentReconciliation/AUTHORIZATION_SETUP_GUIDE.md
