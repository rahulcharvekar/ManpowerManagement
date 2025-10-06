import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PermissionProvider } from './contexts/PermissionContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import Login from './components/Login';

// Import all component pages
import Dashboard from './components/Dashboard';
import UserManagement from './components/UserManagement';
import PaymentProcessing from './components/PaymentProcessing';
import WorkerUpload from './components/WorkerUpload';

// Placeholder components for other pages
const SystemSettings = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        ⚙️ <span className="ml-3">System Settings</span>
      </h1>
      <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
    </div>
    <div className="card">
      <div className="card-body">
        <p className="text-gray-600">System configuration and settings would go here.</p>
        <div className="mt-4 space-x-3">
          <button className="btn-primary">Save Settings</button>
          <button className="btn-secondary">Reset to Default</button>
        </div>
      </div>
    </div>
  </div>
);

const SystemLogs = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        📋 <span className="ml-3">System Logs</span>
      </h1>
      <p className="text-gray-600 mt-2">Monitor system activity and audit trail</p>
    </div>
    <div className="card">
      <div className="card-body">
        <p className="text-gray-600">System logs and audit trail would go here.</p>
        <div className="mt-4">
          <button className="btn-primary">Export Logs</button>
        </div>
      </div>
    </div>
  </div>
);

const ReconciliationDashboard = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        📊 <span className="ml-3">Reconciliation Dashboard</span>
      </h1>
      <p className="text-gray-600 mt-2">Track and manage payment reconciliation</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reconciliations</h3>
          <p className="text-3xl font-bold text-warning-600">42</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Today</h3>
          <p className="text-3xl font-bold text-success-600">128</p>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Amount</h3>
          <p className="text-3xl font-bold text-primary-600">₹2.4L</p>
        </div>
      </div>
    </div>
  </div>
);

const WorkerPayments = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        💵 <span className="ml-3">Worker Payments</span>
      </h1>
      <p className="text-gray-600 mt-2">Manage worker payment processing</p>
    </div>
    <div className="card">
      <div className="card-body">
        <p className="text-gray-600">Worker payment management would go here.</p>
        <div className="mt-4 space-x-3">
          <button className="btn-success">Process Payments</button>
          <button className="btn-primary">View History</button>
        </div>
      </div>
    </div>
  </div>
);

const EmployerReceipts = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        🧾 <span className="ml-3">Employer Receipts</span>
      </h1>
      <p className="text-gray-600 mt-2">Manage employer receipt processing</p>
    </div>
    <div className="card">
      <div className="card-body">
        <p className="text-gray-600">Employer receipt management would go here.</p>
        <div className="mt-4">
          <button className="btn-primary">Generate Receipt</button>
        </div>
      </div>
    </div>
  </div>
);

const BoardReceipts = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        📄 <span className="ml-3">Board Receipts</span>
      </h1>
      <p className="text-gray-600 mt-2">Manage board receipt processing</p>
    </div>
    <div className="card">
      <div className="card-body">
        <p className="text-gray-600">Board receipt management would go here.</p>
        <div className="mt-4">
          <button className="btn-primary">View Receipts</button>
        </div>
      </div>
    </div>
  </div>
);

const Reports = () => (
  <div className="space-y-6">
    <div className="dashboard-header">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center">
        📈 <span className="ml-3">Reports</span>
      </h1>
      <p className="text-gray-600 mt-2">Generate and view detailed reports</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Financial Reports</h3>
          <p className="text-gray-600 mb-4">Detailed financial analysis and summaries</p>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Reports</h3>
          <p className="text-gray-600 mb-4">User activity and system usage reports</p>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>
    </div>
  </div>
);

const UnauthorizedPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="card max-w-md mx-auto">
        <div className="card-body">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <div className="space-x-3">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn-primary"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="card max-w-md mx-auto">
        <div className="card-body">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <div className="space-x-3">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn-primary"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = (token) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="loading-spinner h-12 w-12"></div>
          <p className="text-gray-600 font-medium">Loading application...</p>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Show main application if authenticated  
  return (
    <div className="App">
      <PermissionProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected routes with MainLayout */}
            <Route path="/" element={<MainLayout />}>
              {/* Default redirect to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard */}
              <Route path="dashboard" element={
                <ProtectedRoute componentKey="dashboard">
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Administration Routes */}
              <Route path="admin/users" element={
                <ProtectedRoute componentKey="user-management">
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              <Route path="admin/settings" element={
                <ProtectedRoute componentKey="system-settings">
                  <SystemSettings />
                </ProtectedRoute>
              } />
              
              <Route path="admin/logs" element={
                <ProtectedRoute componentKey="system-logs">
                  <SystemLogs />
                </ProtectedRoute>
              } />
              
              {/* Payment Processing */}
              <Route path="payments" element={
                <ProtectedRoute componentKey="payment-processing">
                  <PaymentProcessing />
                </ProtectedRoute>
              } />
              
              {/* Reconciliation */}
              <Route path="reconciliation" element={
                <ProtectedRoute componentKey="reconciliation-dashboard">
                  <ReconciliationDashboard />
                </ProtectedRoute>
              } />
              
              {/* Worker Routes */}
              <Route path="worker/payments" element={
                <ProtectedRoute componentKey="worker-payments">
                  <WorkerPayments />
                </ProtectedRoute>
              } />
              
              <Route path="worker/upload" element={
                <ProtectedRoute componentKey="worker-upload">
                  <WorkerUpload />
                </ProtectedRoute>
              } />
              
              {/* Employer Routes */}
              <Route path="employer/receipts" element={
                <ProtectedRoute componentKey="employer-receipts">
                  <EmployerReceipts />
                </ProtectedRoute>
              } />
              
              {/* Board Routes */}
              <Route path="board/receipts" element={
                <ProtectedRoute componentKey="board-receipts">
                  <BoardReceipts />
                </ProtectedRoute>
              } />
              
              {/* Reporting */}
              <Route path="reports" element={
                <ProtectedRoute componentKey="reports">
                  <Reports />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </PermissionProvider>
    </div>
  );
}

export default App;
