# Visual Component Structure for UI Developer

## 🎨 **Frontend Architecture Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                          React App                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Permission Provider                        │    │
│  │  • Fetches user permissions once on login              │    │
│  │  • Stores component permissions in context             │    │
│  │  • Provides helper functions to child components       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                │                                │
│  ┌─────────────────────────────▼────────────────────────────┐   │
│  │                 App Router                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │   Sidebar   │  │    Main     │  │   Header    │     │   │
│  │  │ Navigation  │  │   Content   │  │    Bar      │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 **Component Hierarchy & Permission Flow**

```
User Permissions (from API)
│
├── componentPermissions: {
│    "user-management": ["VIEW", "CREATE", "EDIT", "DELETE"],
│    "payment-processing": ["VIEW", "APPROVE", "REJECT"],
│    "worker-payments": ["VIEW", "EXPORT"]
│   }
│
└── navigation: [
     { id: "user-management", name: "User Management", path: "/admin/users" },
     { id: "payment-processing", name: "Payments", path: "/payments" }
    ]

        ↓ FLOWS TO ↓

┌─────────────────────────────────────────────────────────────────┐
│                      Navigation Menu                            │
│  • Auto-generated from components user can VIEW                │
│  • Grouped by category (Administration, Reconciliation, etc.)  │
│  • Only shows accessible routes                                │
└─────────────────────────────────────────────────────────────────┘

        ↓ USER CLICKS ↓

┌─────────────────────────────────────────────────────────────────┐
│                    Protected Route                              │
│  • Checks if user has VIEW permission for component            │
│  • Redirects to /unauthorized if no access                     │
│  • Renders component if access granted                         │
└─────────────────────────────────────────────────────────────────┘

        ↓ COMPONENT RENDERS ↓

┌─────────────────────────────────────────────────────────────────┐
│                  Individual Component                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Action Gates                            │   │
│  │  • CREATE action → Show "Add New" button               │   │
│  │  • EDIT action → Show "Edit" buttons                   │   │
│  │  • DELETE action → Show "Delete" buttons               │   │
│  │  • APPROVE action → Show "Approve" buttons             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ **Component Structure Example**

```
User Management Component (/admin/users)
│
├── Page Header
│   ├── Title: "👥 User Management"
│   └── <ActionGate component="user-management" action="CREATE">
│       └── [+ Add New User] Button
│
├── Filters Section
│   └── Search, Sort, Filter controls
│
├── Data Table
│   ├── User List (always visible if has VIEW)
│   └── Action Columns:
│       ├── <ActionGate component="user-management" action="EDIT">
│       │   └── [Edit] Button
│       ├── <ActionGate component="user-management" action="DELETE">
│       │   └── [Delete] Button
│       └── <ActionGate component="user-management" action="MANAGE">
│           └── [Manage Roles] Button
│
└── Bulk Actions (if applicable)
    ├── <ActionGate component="user-management" action="EDIT">
    │   └── [Bulk Edit] Button
    └── <ActionGate component="user-management" action="DELETE">
        └── [Bulk Delete] Button
```

## 🎯 **Permission Check Flow**

```
User tries to access /admin/users
          ↓
   ProtectedRoute checks:
   canAccessComponent("user-management")
          ↓
   ✅ Has VIEW permission?
          ↓ YES
   Render UserManagement component
          ↓
   Component renders with ActionGates:
   
   canPerformAction("user-management", "CREATE")
   ✅ YES → Show [+ Add User] button
   ❌ NO  → Hide button
   
   canPerformAction("user-management", "EDIT")  
   ✅ YES → Show [Edit] buttons in table
   ❌ NO  → Hide buttons
   
   canPerformAction("user-management", "DELETE")
   ✅ YES → Show [Delete] buttons  
   ❌ NO  → Hide buttons
```

## 📊 **Role-Based UI Examples**

### **ADMIN User Sees:**
```
Navigation:
├── 🏠 Dashboard
├── 👥 User Management          [VIEW, CREATE, EDIT, DELETE, MANAGE]
├── ⚙️  System Settings         [VIEW, CREATE, EDIT, MANAGE]  
├── 💳 Payment Processing       [VIEW, CREATE, EDIT, APPROVE, REJECT]
├── 📊 Reconciliation Dashboard [VIEW, EXPORT, ANALYTICS]
└── 📈 Reports                  [VIEW, EXPORT, ANALYTICS]

User Management Page:
├── [+ Add New User] ✅         (has CREATE)
├── User Table with:
│   ├── [Edit] buttons ✅       (has EDIT)
│   ├── [Delete] buttons ✅     (has DELETE)  
│   └── [Manage Roles] ✅       (has MANAGE)
```

### **RECONCILIATION_OFFICER User Sees:**
```
Navigation:
├── 🏠 Dashboard
├── 💳 Payment Processing       [VIEW, CREATE, EDIT, APPROVE, REJECT]
├── 📊 Reconciliation Dashboard [VIEW, EXPORT, ANALYTICS]
└── 📈 Reports                  [VIEW, EXPORT, ANALYTICS]

Payment Processing Page:
├── [+ New Payment] ✅          (has CREATE)
├── Payment List with:
│   ├── [Edit] buttons ✅       (has EDIT)
│   ├── [Approve] buttons ✅    (has APPROVE)
│   └── [Reject] buttons ✅     (has REJECT)
```

### **WORKER_DATA_OPERATOR User Sees:**
```
Navigation:
├── 🏠 Dashboard  
├── 💵 Worker Payments          [VIEW, EDIT, EXPORT]
└── 📁 Worker Upload            [VIEW, UPLOAD]

Worker Payments Page:
├── ❌ No [+ Add] button        (no CREATE permission)
├── Payment List with:
│   ├── [Edit] buttons ✅       (has EDIT)
│   ├── [Export] button ✅      (has EXPORT)
│   └── ❌ No [Delete] buttons  (no DELETE permission)
```

## 🔄 **State Management Flow**

```
1. User Login
   ↓
2. Fetch /api/components/ui-config
   ↓  
3. Store in PermissionContext:
   {
     userId: 123,
     username: "john.doe", 
     componentPermissions: {
       "user-management": ["VIEW", "CREATE", "EDIT"],
       "payment-processing": ["VIEW", "APPROVE"]
     },
     navigation: [...],
     uiConfig: {...}
   }
   ↓
4. All components use usePermissions() hook
   ↓
5. Navigation auto-generates from permissions
   ↓
6. Routes protect based on VIEW permission  
   ↓
7. ActionGates show/hide based on specific actions
```

## 🧩 **Reusable Component Patterns**

### **DataTable with Actions Pattern:**
```jsx
const DataTableWithActions = ({ 
  data, 
  componentKey, 
  onEdit, 
  onDelete,
  onApprove 
}) => {
  const { canPerformAction } = usePermissions();
  
  return (
    <table>
      <tbody>
        {data.map(item => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className="actions">
              <ActionGate componentKey={componentKey} action="EDIT">
                <button onClick={() => onEdit(item)}>Edit</button>
              </ActionGate>
              
              <ActionGate componentKey={componentKey} action="DELETE">
                <button onClick={() => onDelete(item)}>Delete</button>
              </ActionGate>
              
              <ActionGate componentKey={componentKey} action="APPROVE">
                <button onClick={() => onApprove(item)}>Approve</button>
              </ActionGate>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### **Page Header with Actions Pattern:**
```jsx
const PageHeader = ({ title, componentKey, children }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      <div className="header-actions">
        <ActionGate componentKey={componentKey} action="CREATE">
          <button className="btn-primary">+ Add New</button>
        </ActionGate>
        
        <ActionGate componentKey={componentKey} action="EXPORT">
          <button className="btn-secondary">📊 Export</button>
        </ActionGate>
        
        {children}
      </div>
    </div>
  );
};
```

This visual guide should help UI developers understand exactly how to structure their components and implement the permission system! 🎨
