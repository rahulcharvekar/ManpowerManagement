import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';

// Core Components
import ProtectedRoute from './components/core/ProtectedRoute';
import MainLayout from './components/core/MainLayout';

// Auth Components
import Login from './components/auth/Login';

// Main Component Pages
import Dashboard from './components/Dashboard';

// Admin Components
import UserManagement from './components/admin/UserManagement';
import SystemSettings from './components/admin/SystemSettings';
import SystemLogs from './components/admin/SystemLogs';

// Reconciliation Components
import PaymentProcessing from './components/reconciliation/PaymentProcessing';
import ReconciliationDashboard from './components/reconciliation/ReconciliationDashboard';

// Worker Components
import WorkerDashboard from './components/worker/WorkerDashboard';
import WorkerList from './components/worker/WorkerList';
import WorkerUploadFilesSummary from './components/worker/WorkerUploadFilesSummary';
import WorkerPayments from './components/worker/WorkerPayments';

// Employer Components
import EmployerReceipts from './components/employer/EmployerReceipts';
import EmployerList from './components/employer/EmployerList';

// Board Components
import BoardReceipts from './components/board/BoardReceipts';
import BoardReceiptsPage from './components/board/BoardReceiptsPage';

// Reports Components
import Reports from './components/reports/Reports';

// All components are now imported from their organized directories

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

// App Content Component (needs to be inside AuthProvider to use useAuth)
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
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
    return <Login />;
  }

  // Show main application if authenticated  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
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
            
            {/* Administration Routes - Match backend navigation structure */}
            {/* Main admin route */}
            <Route path="admin" element={
              <ProtectedRoute componentKey="7">
                <Navigate to="/admin/users" replace />
              </ProtectedRoute>
            } />
            
            {/* Admin - User Management */}
            <Route path="admin/users" element={
              <ProtectedRoute componentKey="14">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            {/* Legacy admin routes */}
            <Route path="admin/system" element={
              <ProtectedRoute componentKey="admin-system">
                <SystemSettings />
              </ProtectedRoute>
            } />
            
            <Route path="admin/logs" element={
              <ProtectedRoute componentKey="admin-logs">
                <SystemLogs />
              </ProtectedRoute>
            } />
            
            {/* Payment Routes - Match backend navigation structure */}
            {/* Main payments route */}
            <Route path="payments" element={
              <ProtectedRoute componentKey="3">
                <Navigate to="/payments/list" replace />
              </ProtectedRoute>
            } />
            
            {/* Payment List */}
            <Route path="payments/list" element={
              <ProtectedRoute componentKey="11">
                <WorkerPayments />
              </ProtectedRoute>
            } />
            
            {/* Legacy payment processing route */}
            <Route path="payments/process" element={
              <ProtectedRoute componentKey="payment-processing">
                <PaymentProcessing />
              </ProtectedRoute>
            } />
            
            {/* Reconciliation */}
            <Route path="reconciliation" element={
              <ProtectedRoute componentKey="recon-dashboard">
                <ReconciliationDashboard />
              </ProtectedRoute>
            } />
            
            {/* Worker Routes - Match backend navigation structure */}
            {/* Main workers route - shows submenu or redirect to first available */}
            <Route path="workers" element={
              <ProtectedRoute componentKey="2">
                <Navigate to="/workers/list" replace />
              </ProtectedRoute>
            } />
            
            {/* Worker List */}
            <Route path="workers/list" element={
              <ProtectedRoute componentKey="8">
                <WorkerList />
              </ProtectedRoute>
            } />
            
            {/* Worker Upload Files Summary (for Upload Workers menu) */}
            <Route path="workers/upload" element={
              <ProtectedRoute componentKey="9">
                <WorkerUploadFilesSummary />
              </ProtectedRoute>
            } />
            
            {/* Legacy routes for backward compatibility */}
            <Route path="worker/payments" element={
              <ProtectedRoute componentKey="worker-payments">
                <WorkerPayments />
              </ProtectedRoute>
            } />
            
            <Route path="worker/upload" element={
              <Navigate to="/workers/upload" replace />
            } />
            
            {/* Employer Routes */}
            <Route path="employers/list" element={
              <ProtectedRoute componentKey="58">
                <EmployerList />
              </ProtectedRoute>
            } />
            <Route path="employer/receipts" element={
              <ProtectedRoute componentKey="employer-receipts">
                <EmployerReceipts />
              </ProtectedRoute>
            } />

            {/* Board Routes */}
            <Route path="board-receipts" element={
              <ProtectedRoute componentKey="65">
                <BoardReceiptsPage />
              </ProtectedRoute>
            } />
            <Route path="board/receipts" element={
              <ProtectedRoute componentKey="board-receipts">
                <BoardReceipts />
              </ProtectedRoute>
            } />
            <Route path="board/approvals" element={
              <ProtectedRoute componentKey="board-approvals">
                <BoardReceipts />
              </ProtectedRoute>
            } />
            
            {/* Profile Route */}
            <Route path="profile" element={
              <ProtectedRoute componentKey="profile">
                <div>Profile Component (TODO)</div>
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Catch all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
  );
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <PermissionProvider>
          <AppContent />
        </PermissionProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
