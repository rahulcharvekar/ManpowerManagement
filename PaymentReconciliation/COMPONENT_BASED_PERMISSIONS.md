# Component-Based Permission System

## 🎯 **Overview**

This is a **much simpler and more intuitive** permission system that defines UI permissions based on **components/forms** rather than abstract roles. It's structured, maintainable, and easy to understand.

## 📋 **Core Concept**

### **Structure:**
```
UI Component (e.g., "User Management Form")
  └─ Actions (VIEW, CREATE, EDIT, DELETE, APPROVE, etc.)
     └─ Assigned to Roles
        └─ Roles assigned to Users
```

### **Example:**
```
Component: "user-management"
├─ VIEW (Can see user list)
├─ CREATE (Can add new users) 
├─ EDIT (Can modify users)
├─ DELETE (Can remove users)
└─ MANAGE (Full admin access)

Role: "ADMIN"
├─ user-management: [VIEW, CREATE, EDIT, DELETE, MANAGE]
├─ system-settings: [VIEW, EDIT, MANAGE]
└─ payment-processing: [VIEW]

User: "john.doe" 
└─ Roles: ["ADMIN"] 
   └─ Gets all ADMIN permissions automatically
```

## 🏗️ **System Architecture**

### **Database Tables:**

1. **`ui_components`** - Define UI components/forms
   ```sql
   component_key: "user-management", "payment-processing" 
   display_name: "User Management", "Payment Processing"
   category: "Administration", "Reconciliation"
   route: "/admin/users", "/payments"
   icon: "👥", "💳"
   ```

2. **`component_permissions`** - Define actions for each component
   ```sql
   component_id + action: "user-management" + "VIEW"
   component_id + action: "user-management" + "CREATE" 
   component_id + action: "payment-processing" + "APPROVE"
   ```

3. **`role_component_permissions`** - Assign component+action to roles
   ```sql
   role_id + component_permission_id: ADMIN + (user-management:CREATE)
   role_id + component_permission_id: ADMIN + (user-management:EDIT)
   ```

### **API Endpoints:**

- **`GET /api/components/ui-config`** - Get complete UI config for current user
- **`GET /api/components/check-permission?componentKey=user-management&action=EDIT`** - Check specific permission
- **`GET /api/components/check-access?componentKey=payment-processing`** - Check component access

## 🎨 **Frontend Usage**

### **React Hook:**
```jsx
const { componentConfig } = useComponentPermissions();

// Check component access
const canAccessUserManagement = componentConfig.hasAccess('user-management');

// Check specific actions
const canEditUsers = componentConfig.canPerformAction('user-management', 'EDIT');
const canCreatePayments = componentConfig.canPerformAction('payment-processing', 'CREATE');

// Get all permissions for a component
const userMgmtPermissions = componentConfig.getComponentPermissions('user-management');
// Returns: ['VIEW', 'CREATE', 'EDIT', 'DELETE']
```

### **Component Protection:**
```jsx
// Wrap entire components
<ComponentGate component="user-management">
  <UserManagementPanel />
</ComponentGate>

// Wrap specific actions
<ActionGate component="user-management" action="CREATE">
  <button>Add User</button>
</ActionGate>

<ActionGate component="payment-processing" action="APPROVE">
  <button>Approve Payment</button>
</ActionGate>
```

### **Navigation Generation:**
```jsx
// Navigation automatically generated from components user can VIEW
const NavigationMenu = () => {
  const { navigation } = useComponentPermissions();
  
  return (
    <nav>
      {navigation.map(item => (
        <NavItem key={item.id} {...item} />
      ))}
    </nav>
  );
};
```

## 📝 **Defining Components**

### **Step 1: Define UI Component**
```java
// Components represent actual UI screens/forms
UIComponent userMgmt = new UIComponent(
    "user-management",           // Unique key
    "User Management",           // Display name
    "Administration",            // Category
    "/admin/users",             // Route
    "👥"                        // Icon
);
```

### **Step 2: Define Actions**
```java
// Actions are what users can DO with the component
ComponentPermission viewUsers = new ComponentPermission(userMgmt, ActionType.VIEW);
ComponentPermission createUsers = new ComponentPermission(userMgmt, ActionType.CREATE);
ComponentPermission editUsers = new ComponentPermission(userMgmt, ActionType.EDIT);
ComponentPermission deleteUsers = new ComponentPermission(userMgmt, ActionType.DELETE);
```

### **Step 3: Assign to Roles**
```java
// Roles get specific component+action combinations
RoleComponentPermission adminCanViewUsers = new RoleComponentPermission(adminRole, viewUsers);
RoleComponentPermission adminCanCreateUsers = new RoleComponentPermission(adminRole, createUsers);
RoleComponentPermission adminCanEditUsers = new RoleComponentPermission(adminRole, editUsers);
```

## 🔧 **Available Actions**

```java
public enum ActionType {
    // Basic CRUD
    VIEW,           // Can see the component
    CREATE,         // Can add new records
    EDIT,           // Can modify existing records  
    DELETE,         // Can remove records
    
    // Workflow
    APPROVE,        // Can approve items
    REJECT,         // Can reject items
    SUBMIT,         // Can submit for processing
    
    // File Operations
    UPLOAD,         // Can upload files
    DOWNLOAD,       // Can download files
    EXPORT,         // Can export data
    
    // Administrative
    CONFIGURE,      // Can change settings
    MANAGE,         // Full management access
    
    // Reporting
    REPORT,         // Can generate reports
    ANALYTICS       // Can view analytics
}
```

## 🌟 **Key Benefits**

### **1. Simple & Intuitive**
```
❌ Old: "Does ROLE_ADMIN have PERMISSION_MANAGE_USERS?"
✅ New: "Can this user EDIT the user-management component?"
```

### **2. UI-Centric**
```
❌ Old: Abstract permissions not tied to actual UI
✅ New: Permissions directly map to UI components/forms
```

### **3. Maintainable**
```
❌ Old: Add new permission → Update 10 different files
✅ New: Add new component → System handles everything
```

### **4. Granular Control**
```
❌ Old: "ADMIN" role → All permissions
✅ New: "ADMIN" role → user-management:[VIEW,EDIT] + payments:[VIEW]
```

### **5. Auto-Generated Navigation**
```
❌ Old: Hardcode navigation → Maintain in multiple places
✅ New: Navigation auto-generated from user's component permissions
```

## 📊 **Example Usage Scenarios**

### **Scenario 1: Admin User**
```json
{
  "roles": ["ADMIN"],
  "componentPermissions": {
    "user-management": ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"],
    "system-settings": ["VIEW", "EDIT", "CONFIGURE"],
    "payment-processing": ["VIEW"],
    "reconciliation-dashboard": ["VIEW", "EXPORT"]
  }
}
```

### **Scenario 2: Payment Processor**
```json
{
  "roles": ["RECONCILIATION_OFFICER"],
  "componentPermissions": {
    "payment-processing": ["VIEW", "CREATE", "EDIT", "APPROVE"],
    "reconciliation-dashboard": ["VIEW", "EXPORT", "ANALYTICS"],
    "worker-payments": ["VIEW"]
  }
}
```

### **Scenario 3: Data Entry Operator**
```json
{
  "roles": ["WORKER_DATA_OPERATOR"],
  "componentPermissions": {
    "worker-payments": ["VIEW", "EDIT"],
    "worker-upload": ["VIEW", "UPLOAD"],
    "reconciliation-dashboard": ["VIEW"]
  }
}
```

## 🚀 **Frontend Implementation**

### **Setup:**
```jsx
// App.jsx
import { ComponentPermissionProvider } from './hooks/useComponentPermissions';

function App() {
  return (
    <ComponentPermissionProvider>
      <Router>
        <Routes>
          {/* Routes automatically protected based on component access */}
        </Routes>
      </Router>
    </ComponentPermissionProvider>
  );
}
```

### **Usage in Components:**
```jsx
// UserManagement.jsx
import { useComponentPermissions, ActionGate } from '../hooks/useComponentPermissions';

const UserManagement = () => {
  const { canPerformAction } = useComponentPermissions();
  
  return (
    <div>
      <h2>User Management</h2>
      
      {/* Simple action checks */}
      {canPerformAction('user-management', 'CREATE') && (
        <button>Add User</button>
      )}
      
      {/* Component-based gates */}
      <ActionGate component="user-management" action="EDIT">
        <EditUserForm />
      </ActionGate>
      
      <ActionGate component="user-management" action="DELETE">
        <DeleteUserButton />
      </ActionGate>
    </div>
  );
};
```

## 🏁 **Migration Path**

### **From Old System:**
```jsx
// OLD - Complex role checking
const canEdit = user.roles.includes('ADMIN') || 
  (user.roles.includes('MANAGER') && user.permissions.includes('EDIT_USERS'));

// NEW - Simple component action check  
const canEdit = canPerformAction('user-management', 'EDIT');
```

### **Benefits:**
- **Clearer Intent**: "Can edit user management form" vs "Has admin role"
- **Better Maintenance**: Add component once, UI updates everywhere
- **Easier Testing**: Test component permissions instead of role combinations
- **UI-Focused**: Permissions directly related to what users see

This system is **much more intuitive** and **easier to maintain** than abstract role-based systems! 🎉
