# UI Developer Guide: Component-Based Permission System

## 🎯 **For UI Developers: Understanding the Permission Structure**

This guide explains how to build a React frontend that integrates with our component-based permission system. Think of it as a **blueprint for creating permission-aware UI components**.

---

## 📱 **Core Concept for UI Development**

### **What You Need to Know:**
1. **UI Components** = Actual screens/pages in your app
2. **Actions** = What users can do on each screen (view, create, edit, delete, etc.)
3. **Permissions** = Component + Action combinations (e.g., "user-management + EDIT")
4. **Navigation** = Auto-generated based on what user can VIEW

---

## 🏗️ **Frontend Architecture Overview**

```
Frontend App
├── Authentication Layer (JWT tokens)
├── Permission Provider (fetches user permissions once)
├── Route Protection (checks component VIEW permission)
├── Component Gates (checks specific actions)
└── Navigation Menu (auto-generated from permissions)
```

---

## 📋 **Available UI Components & Their Routes**

Here's what you need to build as UI components:

| Component Key | Display Name | Route | Category | Icon | Actions Available |
|---------------|--------------|-------|----------|------|-------------------|
| `dashboard` | Dashboard | `/dashboard` | General | 🏠 | VIEW, ANALYTICS |
| `user-management` | User Management | `/admin/users` | Administration | 👥 | VIEW, CREATE, EDIT, DELETE, MANAGE |
| `system-settings` | System Settings | `/admin/settings` | Administration | ⚙️ | VIEW, CREATE, EDIT, MANAGE |
| `system-logs` | System Logs | `/admin/logs` | Administration | 📋 | VIEW, DELETE, EXPORT |
| `payment-processing` | Payment Processing | `/payments` | Reconciliation | 💳 | VIEW, CREATE, EDIT, APPROVE, REJECT |
| `reconciliation-dashboard` | Reconciliation Dashboard | `/reconciliation` | Reconciliation | 📊 | VIEW, EXPORT, ANALYTICS |
| `worker-payments` | Worker Payments | `/worker/payments` | Worker | 💵 | VIEW, EDIT, EXPORT |
| `worker-upload` | Worker Data Upload | `/worker/upload` | Worker | 📁 | VIEW, UPLOAD |
| `employer-receipts` | Employer Receipts | `/employer/receipts` | Employer | 🧾 | VIEW, EDIT, APPROVE, REJECT, EXPORT |
| `board-receipts` | Board Receipts | `/board/receipts` | Board | 📄 | VIEW, APPROVE, REJECT, EXPORT |
| `reports` | Reports | `/reports` | Reporting | 📈 | VIEW, EXPORT, ANALYTICS |

---

## 🎨 **Frontend Implementation Guide**

### **1. Permission Context Setup**

```jsx
// src/contexts/PermissionContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/components/ui-config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // API Response Structure:
      // {
      //   userId: 123,
      //   username: "john.doe", 
      //   fullName: "John Doe Smith",
      //   roles: ["ADMIN", "RECONCILIATION_OFFICER"],
      //   componentPermissions: {
      //     "user-management": ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"],
      //     "payment-processing": ["VIEW", "APPROVE", "REJECT"],
      //     "dashboard": ["VIEW", "ANALYTICS"]
      //   },
      //   navigation: [
      //     { id: "dashboard", name: "Dashboard", path: "/dashboard", icon: "🏠", category: "General" },
      //     { id: "user-management", name: "User Management", path: "/admin/users", icon: "👥", category: "Administration" }
      //   ],
      //   uiConfig: { behavior: { defaultRoute: "/dashboard" }, components: {...} }
      // }
      
      setPermissions(response.data);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const canAccessComponent = (componentKey) => {
    return permissions?.componentPermissions?.[componentKey]?.includes('VIEW') || false;
  };

  const canPerformAction = (componentKey, action) => {
    return permissions?.componentPermissions?.[componentKey]?.includes(action) || false;
  };

  const getNavigationItems = () => {
    return permissions?.navigation || [];
  };

  return (
    <PermissionContext.Provider value={{
      permissions,
      loading,
      canAccessComponent,
      canPerformAction,
      getNavigationItems,
      refetch: fetchPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};
```

### **2. Protected Route Component**

```jsx
// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

const ProtectedRoute = ({ children, componentKey, fallback = null }) => {
  const { canAccessComponent, loading } = usePermissions();

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!canAccessComponent(componentKey)) {
    return fallback || <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
```

### **3. Action Gate Component**

```jsx
// src/components/ActionGate.js
import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';

const ActionGate = ({ 
  componentKey, 
  action, 
  children, 
  fallback = null,
  showLoading = false 
}) => {
  const { canPerformAction, loading } = usePermissions();

  if (loading && showLoading) {
    return <div>Loading...</div>;
  }

  if (!canPerformAction(componentKey, action)) {
    return fallback;
  }

  return children;
};

export default ActionGate;
```

### **4. Navigation Component**

```jsx
// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

const Navigation = () => {
  const { getNavigationItems, loading } = usePermissions();
  const location = useLocation();

  if (loading) return <div>Loading navigation...</div>;

  const navigationItems = getNavigationItems();

  const renderNavItem = (item) => (
    <li key={item.id} className={`nav-item nav-${item.category.toLowerCase()}`}>
      <Link 
        to={item.path} 
        className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
      >
        <span className="nav-icon">{item.icon}</span>
        <span className="nav-text">{item.name}</span>
      </Link>
      
      {item.children && (
        <ul className="nav-children">
          {item.children.map(renderNavItem)}
        </ul>
      )}
    </li>
  );

  // Group items by category
  const groupedItems = navigationItems.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <nav className="sidebar-navigation">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="nav-category">
          <h3 className="nav-category-title">{category}</h3>
          <ul className="nav-list">
            {items.map(renderNavItem)}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default Navigation;
```

---

## 🛠️ **Building Individual Components**

### **Example: User Management Component**

```jsx
// src/components/UserManagement.js
import React, { useState } from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import ActionGate from './ActionGate';

const UserManagement = () => {
  const { canPerformAction } = usePermissions();
  const [users, setUsers] = useState([]);

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h1>👥 User Management</h1>
        
        {/* CREATE Action */}
        <ActionGate componentKey="user-management" action="CREATE">
          <button className="btn btn-primary" onClick={() => console.log('Create user')}>
            + Add New User
          </button>
        </ActionGate>
      </div>

      <div className="page-content">
        {/* User List Table */}
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.roles.join(', ')}</td>
                <td className="user-actions">
                  
                  {/* EDIT Action */}
                  <ActionGate componentKey="user-management" action="EDIT">
                    <button className="btn btn-sm btn-secondary">Edit</button>
                  </ActionGate>
                  
                  {/* DELETE Action */}
                  <ActionGate componentKey="user-management" action="DELETE">
                    <button className="btn btn-sm btn-danger">Delete</button>
                  </ActionGate>
                  
                  {/* MANAGE Action (Admin functions) */}
                  <ActionGate componentKey="user-management" action="MANAGE">
                    <button className="btn btn-sm btn-warning">Manage Roles</button>
                  </ActionGate>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
```

### **Example: Payment Processing Component**

```jsx
// src/components/PaymentProcessing.js
import React, { useState } from 'react';
import ActionGate from './ActionGate';

const PaymentProcessing = () => {
  const [payments, setPayments] = useState([]);

  return (
    <div className="payment-processing-page">
      <div className="page-header">
        <h1>💳 Payment Processing</h1>
        
        <div className="header-actions">
          <ActionGate componentKey="payment-processing" action="CREATE">
            <button className="btn btn-primary">+ New Payment</button>
          </ActionGate>
        </div>
      </div>

      <div className="payment-filters">
        {/* Filters here */}
      </div>

      <div className="payments-list">
        {payments.map(payment => (
          <div key={payment.id} className="payment-card">
            <div className="payment-info">
              <h3>{payment.reference}</h3>
              <p>Amount: ${payment.amount}</p>
              <p>Status: {payment.status}</p>
            </div>
            
            <div className="payment-actions">
              <ActionGate componentKey="payment-processing" action="EDIT">
                <button className="btn btn-sm btn-secondary">Edit</button>
              </ActionGate>
              
              <ActionGate componentKey="payment-processing" action="APPROVE">
                <button className="btn btn-sm btn-success">Approve</button>
              </ActionGate>
              
              <ActionGate componentKey="payment-processing" action="REJECT">
                <button className="btn btn-sm btn-danger">Reject</button>
              </ActionGate>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentProcessing;
```

---

## 🛣️ **App Router Setup**

```jsx
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PermissionProvider } from './contexts/PermissionContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';

// Import all your components
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import SystemSettings from './components/SystemSettings';
import PaymentProcessing from './components/PaymentProcessing';
import ReconciliationDashboard from './components/ReconciliationDashboard';
import WorkerPayments from './components/WorkerPayments';
import WorkerUpload from './components/WorkerUpload';
import EmployerReceipts from './components/EmployerReceipts';
import BoardReceipts from './components/BoardReceipts';
import Reports from './components/Reports';

function App() {
  return (
    <PermissionProvider>
      <Router>
        <div className="app">
          <aside className="sidebar">
            <Navigation />
          </aside>
          
          <main className="main-content">
            <Routes>
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute componentKey="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute componentKey="user-management">
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/settings" element={
                <ProtectedRoute componentKey="system-settings">
                  <SystemSettings />
                </ProtectedRoute>
              } />
              
              <Route path="/payments" element={
                <ProtectedRoute componentKey="payment-processing">
                  <PaymentProcessing />
                </ProtectedRoute>
              } />
              
              <Route path="/reconciliation" element={
                <ProtectedRoute componentKey="reconciliation-dashboard">
                  <ReconciliationDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/worker/payments" element={
                <ProtectedRoute componentKey="worker-payments">
                  <WorkerPayments />
                </ProtectedRoute>
              } />
              
              <Route path="/worker/upload" element={
                <ProtectedRoute componentKey="worker-upload">
                  <WorkerUpload />
                </ProtectedRoute>
              } />
              
              <Route path="/employer/receipts" element={
                <ProtectedRoute componentKey="employer-receipts">
                  <EmployerReceipts />
                </ProtectedRoute>
              } />
              
              <Route path="/board/receipts" element={
                <ProtectedRoute componentKey="board-receipts">
                  <BoardReceipts />
                </ProtectedRoute>
              } />
              
              <Route path="/reports" element={
                <ProtectedRoute componentKey="reports">
                  <Reports />
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Error pages */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </PermissionProvider>
  );
}

export default App;
```

---

## 🎨 **CSS Structure Recommendations**

```css
/* Navigation Styles */
.nav-category {
  margin-bottom: 2rem;
}

.nav-category-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #374151;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.nav-link:hover,
.nav-link.active {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

/* Component Page Styles */
.page-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.page-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
}

/* Action Button Styles */
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-success { background: #10b981; color: white; }
.btn-danger { background: #ef4444; color: white; }
.btn-warning { background: #f59e0b; color: white; }

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

---

## ✅ **Development Checklist for UI Developer**

### **Phase 1: Setup**
- [ ] Set up permission context and provider
- [ ] Create ProtectedRoute component
- [ ] Create ActionGate component
- [ ] Set up navigation component

### **Phase 2: Core Components**
- [ ] Dashboard component (VIEW, ANALYTICS actions)
- [ ] User Management (VIEW, CREATE, EDIT, DELETE, MANAGE actions)
- [ ] System Settings (VIEW, CREATE, EDIT, MANAGE actions)
- [ ] Payment Processing (VIEW, CREATE, EDIT, APPROVE, REJECT actions)

### **Phase 3: Domain Components**
- [ ] Worker Payments (VIEW, EDIT, EXPORT actions)
- [ ] Worker Upload (VIEW, UPLOAD actions)
- [ ] Employer Receipts (VIEW, EDIT, APPROVE, REJECT, EXPORT actions)
- [ ] Board Receipts (VIEW, APPROVE, REJECT, EXPORT actions)
- [ ] Reports (VIEW, EXPORT, ANALYTICS actions)

### **Phase 4: Polish**
- [ ] Error handling for unauthorized access
- [ ] Loading states
- [ ] Responsive design
- [ ] Accessibility features

---

## 🔧 **Testing Your Implementation**

1. **Login as different users** with different roles
2. **Check navigation** - should show only allowed components
3. **Test action buttons** - should appear/disappear based on permissions
4. **Try accessing routes directly** - should redirect if no permission

---

## 📞 **API Integration Notes**

- **Authentication**: Include JWT token in all requests
- **Permission Check**: `GET /api/components/ui-config` returns complete config
- **Real-time Check**: `GET /api/components/check-permission?componentKey=user-management&action=EDIT`
- **Component Access**: `GET /api/components/check-access?componentKey=payment-processing`

This structure gives you a **clean, maintainable, and secure** frontend that automatically adapts to user permissions! 🎉
