# Authorization Management API Documentation

## Base URL
All endpoints are prefixed with: `/api/admin`

## Authentication
All endpoints require:
- Valid JWT token
- ADMIN role

## Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Capability Management

### List All Capabilities
```http
GET /api/admin/capabilities
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "WORKER.CREATE",
    "description": "Create worker records",
    "module": "WORKER",
    "action": "CREATE",
    "resource": "worker",
    "isActive": true,
    "createdAt": "2025-10-09T10:00:00",
    "updatedAt": "2025-10-09T10:00:00"
  }
]
```

### Get Capability by ID
```http
GET /api/admin/capabilities/{id}
```

### Create Capability
```http
POST /api/admin/capabilities
```

**Request Body:**
```json
{
  "name": "PAYMENT.APPROVE",
  "description": "Approve payment records",
  "module": "PAYMENT",
  "action": "APPROVE",
  "resource": "payment",
  "isActive": true
}
```

### Update Capability
```http
PUT /api/admin/capabilities/{id}
```

### Delete Capability
```http
DELETE /api/admin/capabilities/{id}
```

### Toggle Active Status
```http
PATCH /api/admin/capabilities/{id}/toggle-active
```

---

## 2. Policy Management

### List All Policies
```http
GET /api/admin/policies
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "policy.admin.full_access",
    "description": "Full admin access",
    "type": "ROLE_BASED",
    "expression": "{\"roles\": [\"ADMIN\"], \"conditions\": []}",
    "isActive": true,
    "capabilities": [
      {
        "id": 1,
        "name": "WORKER.CREATE",
        "description": "Create worker records"
      }
    ],
    "createdAt": "2025-10-09T10:00:00",
    "updatedAt": "2025-10-09T10:00:00"
  }
]
```

### Get Policy by ID
```http
GET /api/admin/policies/{id}
```

### Create Policy
```http
POST /api/admin/policies
```

**Request Body:**
```json
{
  "name": "policy.worker.read_only",
  "description": "Worker read-only access",
  "type": "ROLE_BASED",
  "expression": "{\"roles\": [\"WORKER\"], \"conditions\": []}",
  "isActive": true,
  "capabilityIds": [1, 2, 3]
}
```

### Update Policy
```http
PUT /api/admin/policies/{id}
```

### Delete Policy
```http
DELETE /api/admin/policies/{id}
```

### Toggle Active Status
```http
PATCH /api/admin/policies/{id}/toggle-active
```

### Get Policy Capabilities
```http
GET /api/admin/policies/{id}/capabilities
```

### Assign Capabilities to Policy
```http
POST /api/admin/policies/{id}/capabilities
```

**Request Body:**
```json
{
  "capabilityIds": [1, 2, 3]
}
```

### Remove Capability from Policy
```http
DELETE /api/admin/policies/{id}/capabilities/{capabilityId}
```

---

## 3. Endpoint Management

### List All Endpoints
```http
GET /api/admin/endpoints
```

**Response:**
```json
[
  {
    "id": 1,
    "service": "worker",
    "version": "v1",
    "method": "POST",
    "path": "/api/workers",
    "description": "Create worker",
    "isActive": true,
    "policies": [
      {
        "id": 1,
        "name": "policy.worker.full",
        "description": "Full worker access"
      }
    ],
    "createdAt": "2025-10-09T10:00:00",
    "updatedAt": "2025-10-09T10:00:00"
  }
]
```

### Get Endpoint by ID
```http
GET /api/admin/endpoints/{id}
```

### Create Endpoint
```http
POST /api/admin/endpoints
```

**Request Body:**
```json
{
  "service": "payment",
  "version": "v1",
  "method": "POST",
  "path": "/api/payments",
  "description": "Create payment record",
  "isActive": true,
  "policyIds": [1, 2]
}
```

### Update Endpoint
```http
PUT /api/admin/endpoints/{id}
```

### Delete Endpoint
```http
DELETE /api/admin/endpoints/{id}
```

### Toggle Active Status
```http
PATCH /api/admin/endpoints/{id}/toggle-active
```

### Get Endpoint Policies
```http
GET /api/admin/endpoints/{id}/policies
```

### Assign Policies to Endpoint
```http
POST /api/admin/endpoints/{id}/policies
```

**Request Body:**
```json
{
  "policyIds": [1, 2]
}
```

### Remove Policy from Endpoint
```http
DELETE /api/admin/endpoints/{id}/policies/{policyId}
```

---

## 4. UI Page Management

### List All Pages with Hierarchy
```http
GET /api/admin/ui-pages
```

**Response:**
```json
{
  "pages": [
    {
      "id": 1,
      "label": "Workers",
      "route": "/workers",
      "icon": "people",
      "parentId": null,
      "displayOrder": 1,
      "isMenuItem": true,
      "isActive": true,
      "actionCount": 0,
      "createdAt": "2025-10-09T10:00:00",
      "updatedAt": "2025-10-09T10:00:00"
    }
  ],
  "tree": [
    {
      "id": 1,
      "label": "Workers",
      "route": "/workers",
      "icon": "people",
      "children": [
        {
          "id": 2,
          "label": "Worker List",
          "route": "/workers/list",
          "icon": "list",
          "parentId": 1
        }
      ]
    }
  ]
}
```

### List All Pages (Including Inactive)
```http
GET /api/admin/ui-pages/all
```

### Get Page by ID
```http
GET /api/admin/ui-pages/{id}
```

### Get Child Pages
```http
GET /api/admin/ui-pages/{id}/children
```

### Create Page
```http
POST /api/admin/ui-pages
```

**Request Body:**
```json
{
  "label": "Worker Management",
  "route": "/workers/manage",
  "icon": "manage",
  "parentId": 1,
  "displayOrder": 2,
  "isMenuItem": true,
  "isActive": true
}
```

### Update Page
```http
PUT /api/admin/ui-pages/{id}
```

### Delete Page
```http
DELETE /api/admin/ui-pages/{id}
```
**Note:** Cannot delete pages with children

### Toggle Active Status
```http
PATCH /api/admin/ui-pages/{id}/toggle-active
```

### Reorder Page
```http
PATCH /api/admin/ui-pages/{id}/reorder
```

**Request Body:**
```json
{
  "newDisplayOrder": 5
}
```

---

## 5. Page Action Management

### List All Page Actions
```http
GET /api/admin/page-actions
```

**Response:**
```json
[
  {
    "id": 1,
    "label": "Add Worker",
    "action": "CREATE",
    "icon": "add",
    "variant": "primary",
    "displayOrder": 1,
    "isActive": true,
    "page": {
      "id": 2,
      "label": "Worker List",
      "route": "/workers/list"
    },
    "capability": {
      "id": 1,
      "name": "WORKER.CREATE",
      "description": "Create worker records"
    },
    "endpoint": {
      "id": 1,
      "method": "POST",
      "path": "/api/workers"
    },
    "createdAt": "2025-10-09T10:00:00",
    "updatedAt": "2025-10-09T10:00:00"
  }
]
```

### Get Page Action by ID
```http
GET /api/admin/page-actions/{id}
```

### Get Actions for a Page
```http
GET /api/admin/page-actions/page/{pageId}
```

### Create Page Action
```http
POST /api/admin/page-actions
```

**Request Body:**
```json
{
  "pageId": 2,
  "capabilityId": 1,
  "endpointId": 1,
  "label": "Add Worker",
  "action": "CREATE",
  "icon": "add",
  "variant": "primary",
  "displayOrder": 1,
  "isActive": true
}
```

### Update Page Action
```http
PUT /api/admin/page-actions/{id}
```

### Delete Page Action
```http
DELETE /api/admin/page-actions/{id}
```

### Toggle Active Status
```http
PATCH /api/admin/page-actions/{id}/toggle-active
```

### Reorder Page Action
```http
PATCH /api/admin/page-actions/{id}/reorder
```

**Request Body:**
```json
{
  "newDisplayOrder": 3
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "timestamp": "2025-10-09T10:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2025-10-09T10:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2025-10-09T10:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied. ADMIN role required"
}
```

### 404 Not Found
```json
{
  "timestamp": "2025-10-09T10:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2025-10-09T10:00:00",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Testing with curl

### Example: Create Capability
```bash
curl -X POST http://localhost:8080/api/admin/capabilities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PAYMENT.APPROVE",
    "description": "Approve payment records",
    "module": "PAYMENT",
    "action": "APPROVE",
    "resource": "payment",
    "isActive": true
  }'
```

### Example: Get All Policies
```bash
curl -X GET http://localhost:8080/api/admin/policies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Assign Capabilities to Policy
```bash
curl -X POST http://localhost:8080/api/admin/policies/1/capabilities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "capabilityIds": [1, 2, 3]
  }'
```
