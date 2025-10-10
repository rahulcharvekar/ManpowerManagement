# Authorization Management UI - Implementation Plan

## Overview
Build admin UI for super/admin users to manage the entire authorization system including policies, capabilities, endpoints, UI pages, and page actions.

---

## Phase 1: Backend REST APIs ✅ (IN PROGRESS)

### 1.1 Capability Management (✅ DONE)
**Endpoint**: `/api/admin/capabilities`
- `GET /api/admin/capabilities` - List all capabilities
- `GET /api/admin/capabilities/{id}` - Get capability by ID
- `POST /api/admin/capabilities` - Create capability
- `PUT /api/admin/capabilities/{id}` - Update capability
- `DELETE /api/admin/capabilities/{id}` - Delete capability
- `PATCH /api/admin/capabilities/{id}/toggle-active` - Activate/Deactivate

### 1.2 Policy Management (TODO)
**Endpoint**: `/api/admin/policies`
- `GET /api/admin/policies` - List all policies
- `GET /api/admin/policies/{id}` - Get policy details with capabilities
- `POST /api/admin/policies` - Create policy
- `PUT /api/admin/policies/{id}` - Update policy
- `DELETE /api/admin/policies/{id}` - Delete policy
- `POST /api/admin/policies/{id}/capabilities` - Assign capabilities to policy
- `DELETE /api/admin/policies/{id}/capabilities/{capabilityId}` - Remove capability

### 1.3 Endpoint Management (TODO)
**Endpoint**: `/api/admin/endpoints`
- `GET /api/admin/endpoints` - List all endpoints
- `GET /api/admin/endpoints/{id}` - Get endpoint details
- `POST /api/admin/endpoints` - Create endpoint
- `PUT /api/admin/endpoints/{id}` - Update endpoint
- `DELETE /api/admin/endpoints/{id}` - Delete endpoint
- `POST /api/admin/endpoints/{id}/policies` - Assign policies to endpoint
- `DELETE /api/admin/endpoints/{id}/policies/{policyId}` - Remove policy

### 1.4 UI Page Management (TODO)
**Endpoint**: `/api/admin/ui-pages`
- `GET /api/admin/ui-pages` - List all pages with hierarchy
- `GET /api/admin/ui-pages/{id}` - Get page details
- `POST /api/admin/ui-pages` - Create page
- `PUT /api/admin/ui-pages/{id}` - Update page
- `DELETE /api/admin/ui-pages/{id}` - Delete page
- `PATCH /api/admin/ui-pages/{id}/reorder` - Change display order

### 1.5 Page Action Management (TODO)
**Endpoint**: `/api/admin/page-actions`
- `GET /api/admin/page-actions` - List all page actions
- `GET /api/admin/pages/{pageId}/actions` - Get actions for a specific page
- `POST /api/admin/page-actions` - Create page action
- `PUT /api/admin/page-actions/{id}` - Update page action
- `DELETE /api/admin/page-actions/{id}` - Delete page action

### 1.6 Role-Capability Assignment (Enhancement)
**Endpoint**: `/api/admin/roles/{roleId}/capabilities`
- `GET /api/admin/roles/{roleId}/capabilities` - Get capabilities assigned to role
- `POST /api/admin/roles/{roleId}/capabilities` - Assign capability to role
- `DELETE /api/admin/roles/{roleId}/capabilities/{capabilityId}` - Remove capability

---

## Phase 2: Frontend React Components

### 2.1 Main Admin Dashboard
**Route**: `/admin/authorization`
```javascript
<AuthorizationDashboard>
  - Overview cards (total capabilities, policies, endpoints, pages)
  - Quick stats
  - Recent changes log
</AuthorizationDashboard>
```

### 2.2 Capability Management UI
**Route**: `/admin/authorization/capabilities`
```javascript
<CapabilityManagement>
  - DataGrid with search/filter
  - Create/Edit modal
  - Delete confirmation
  - Toggle active/inactive
  - Group by module
</CapabilityManagement>
```

**Fields**:
- Name (e.g., "WORKER.CREATE")
- Description
- Module (e.g., "WORKER", "PAYMENT")
- Action (e.g., "CREATE", "UPDATE", "DELETE")
- Resource (e.g., "worker", "payment")
- Active/Inactive toggle

### 2.3 Policy Management UI
**Route**: `/admin/authorization/policies`
```javascript
<PolicyManagement>
  - DataGrid with policies
  - Create/Edit modal with JSON editor for expression
  - Assign capabilities (multi-select)
  - Link endpoints
  - Preview affected users
</PolicyManagement>
```

**Features**:
- Visual policy builder (drag-drop roles)
- JSON expression editor with validation
- Capability assignment interface
- Test policy against sample user

### 2.4 Endpoint Management UI
**Route**: `/admin/authorization/endpoints`
```javascript
<EndpointManagement>
  - DataGrid grouped by service
  - Create/Edit modal
  - Assign policies
  - Test endpoint access for user/role
</EndpointManagement>
```

**Fields**:
- Service, Version, Method, Path
- Description
- Assigned policies (multi-select)
- Active/Inactive

### 2.5 UI Page Configuration
**Route**: `/admin/authorization/pages`
```javascript
<PageManagement>
  - Tree view of page hierarchy
  - Drag-drop to reorder
  - Create parent/child pages
  - Assign page actions
</PageManagement>
```

**Features**:
- Visual tree with expand/collapse
- Drag-drop reordering
- Parent-child relationship management
- Icon picker
- Route configuration

### 2.6 Page Actions Configuration
**Route**: `/admin/authorization/pages/{pageId}/actions`
```javascript
<PageActionManagement>
  - List of actions for page
  - Create button action
  - Link to capability
  - Link to endpoint
  - Configure UI properties (icon, label, variant)
</PageActionManagement>
```

---

## Phase 3: Advanced Features

### 3.1 Role Simulation
**Feature**: Test what a user with specific roles can see/do
- Select role(s)
- Preview `can` map
- Preview accessible pages
- Preview accessible endpoints

### 3.2 Audit & History
- Track who changed what and when
- Rollback capability
- Change comparison

### 3.3 Import/Export
- Export authorization config as JSON
- Import from JSON
- Migration between environments

### 3.4 Validation & Testing
- Policy syntax validation
- Circular dependency detection
- Orphaned capability detection
- Test user access scenarios

---

## Database Schema Enhancements (If Needed)

### Add audit fields to all tables:
```sql
ALTER TABLE capabilities ADD COLUMN created_by BIGINT;
ALTER TABLE capabilities ADD COLUMN updated_by BIGINT;
-- Repeat for other tables
```

### Add change log table:
```sql
CREATE TABLE authorization_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  action VARCHAR(20),
  changed_by BIGINT,
  changes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Security Considerations

1. **Only ADMIN role** can access these endpoints
2. Add `@PreAuthorize("hasRole('ADMIN')")` to all controller methods
3. Log all changes to audit table
4. Validate policy expressions before saving
5. Prevent deletion of system-critical capabilities

---

## Frontend Tech Stack Recommendations

```javascript
// UI Components
- Material-UI / Ant Design / Shadcn UI
- React Data Grid (AG-Grid or MUI DataGrid)
- React Hook Form (form management)
- Yup/Zod (validation)

// State Management
- TanStack Query (React Query) - API calls & caching
- Zustand/Context API - Local state

// Code Editor
- Monaco Editor / Ace Editor (for JSON policy expressions)

// Tree/Hierarchy
- react-arborist or react-sortable-tree (page hierarchy)
```

---

## Implementation Order

### Week 1: Backend APIs
1. ✅ Capability Controller (DONE)
2. Policy Controller
3. Endpoint Controller

### Week 2: Backend APIs (Continued)
4. UI Page Controller
5. Page Action Controller
6. Add security annotations

### Week 3: Frontend - Basic CRUD
7. Capability Management UI
8. Policy Management UI

### Week 4: Frontend - Advanced
9. Endpoint Management UI
10. Page Management UI
11. Page Action Management UI

### Week 5: Polish & Testing
12. Role simulation
13. Validation & error handling
14. Testing & bug fixes

---

## Sample React Component Structure

```
src/
  pages/
    admin/
      authorization/
        index.tsx                    # Dashboard
        capabilities/
          CapabilityList.tsx
          CapabilityForm.tsx
        policies/
          PolicyList.tsx
          PolicyForm.tsx
          PolicyBuilder.tsx          # Visual policy builder
        endpoints/
          EndpointList.tsx
          EndpointForm.tsx
        pages/
          PageTree.tsx
          PageForm.tsx
          PageActionForm.tsx
  hooks/
    useCapabilities.ts
    usePolicies.ts
    useEndpoints.ts
  api/
    authorization.ts                 # API client functions
```

---

## Next Steps

Would you like me to:
1. **Create the remaining backend controllers** (Policy, Endpoint, UIPage, PageAction)?
2. **Create a React component boilerplate** for one of the management UIs?
3. **Create SQL migration scripts** for any missing database enhancements?
4. **Create a Postman collection** for testing the APIs?

Let me know which direction you'd like to proceed!
