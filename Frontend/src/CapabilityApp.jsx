import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EnhancedAuthProvider } from './contexts/EnhancedAuthContext';
import { CatalogProvider } from './contexts/CatalogContext';
import RouteGuard from './components/core/RouteGuard';
import CapabilityLayout from './components/core/CapabilityLayout';
import CapabilityDashboard from './components/CapabilityDashboard';
import UnauthorizedPage from './components/UnauthorizedPage';
import LoginPage from './components/auth/LoginPage';

/**
 * CapabilityApp - Main application setup using the new capability system
 * This demonstrates how to integrate all the new components
 */
function CapabilityApp() {
  return (
    <Router>
      <EnhancedAuthProvider>
        <CatalogProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route element={<CapabilityLayout />}>
              <Route 
                path="/" 
                element={
                  <RouteGuard route="/">
                    <CapabilityDashboard />
                  </RouteGuard>
                } 
              />
              
              <Route 
                path="/dashboard" 
                element={
                  <RouteGuard route="/dashboard">
                    <CapabilityDashboard />
                  </RouteGuard>
                } 
              />

              {/* Worker Routes */}
              <Route 
                path="/workers" 
                element={
                  <RouteGuard route="/workers">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Workers Module</h1>
                      <p className="text-gray-600 mt-2">Protected by capability system</p>
                    </div>
                  </RouteGuard>
                } 
              />

              <Route 
                path="/workers/upload" 
                element={
                  <RouteGuard route="/workers/upload" capability="WORKER.CREATE">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Worker Upload</h1>
                      <p className="text-gray-600 mt-2">Requires WORKER.CREATE capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Payment Routes */}
              <Route 
                path="/payments" 
                element={
                  <RouteGuard route="/payments" capability="PAYMENT.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Payments Module</h1>
                      <p className="text-gray-600 mt-2">Protected by PAYMENT.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Employer Routes */}
              <Route 
                path="/employer" 
                element={
                  <RouteGuard route="/employer" capability="EMPLOYER.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Employer Module</h1>
                      <p className="text-gray-600 mt-2">Protected by EMPLOYER.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Board Routes */}
              <Route 
                path="/board" 
                element={
                  <RouteGuard route="/board" capability="BOARD.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Board Module</h1>
                      <p className="text-gray-600 mt-2">Protected by BOARD.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Reconciliation Routes */}
              <Route 
                path="/reconciliation" 
                element={
                  <RouteGuard route="/reconciliation" capability="RECONCILIATION.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Reconciliation Module</h1>
                      <p className="text-gray-600 mt-2">Protected by RECONCILIATION.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Reports Routes */}
              <Route 
                path="/reports" 
                element={
                  <RouteGuard route="/reports" capability="REPORTS.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Reports Module</h1>
                      <p className="text-gray-600 mt-2">Protected by REPORTS.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Admin Routes */}
              <Route 
                path="/admin/users" 
                element={
                  <RouteGuard route="/admin/users" capability="USER_MANAGEMENT.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">User Management</h1>
                      <p className="text-gray-600 mt-2">Protected by USER_MANAGEMENT.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              <Route 
                path="/admin/permissions" 
                element={
                  <RouteGuard route="/admin/permissions" capability="PERMISSION_MANAGEMENT.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">Permission Management</h1>
                      <p className="text-gray-600 mt-2">Protected by PERMISSION_MANAGEMENT.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              <Route 
                path="/admin/system" 
                element={
                  <RouteGuard route="/admin/system" capability="SYSTEM.READ">
                    <div className="p-6">
                      <h1 className="text-2xl font-bold">System Settings</h1>
                      <p className="text-gray-600 mt-2">Protected by SYSTEM.READ capability</p>
                    </div>
                  </RouteGuard>
                } 
              />

              {/* Catch all - redirect to unauthorized */}
              <Route path="*" element={<Navigate to="/unauthorized" replace />} />
            </Route>
          </Routes>
        </CatalogProvider>
      </EnhancedAuthProvider>
    </Router>
  );
}

export default CapabilityApp;
