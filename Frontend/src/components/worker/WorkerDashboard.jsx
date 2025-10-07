import React, { useState, useEffect } from 'react';
import { 
  ActionGate, 
  PermissionButton, 
  ModulePermissionGate, 
  PermissionRenderer 
} from '../core';
import { usePermissions } from '../../contexts/PermissionContext';

/**
 * Enhanced WorkerDashboard using the new permission system
 * Demonstrates practical usage of permission-based UI components
 */
const WorkerDashboard = () => {
  const { hasPermission, hasModuleAccess, user } = usePermissions();
  const [stats, setStats] = useState({
    totalUploads: 0,
    pendingPayments: 0,
    completedPayments: 0
  });

  useEffect(() => {
    // Load dashboard stats (only if user has read permissions)
    if (hasPermission('READ_WORKER_DATA') || hasPermission('READ_PAYMENTS')) {
      // Simulate loading stats
      setStats({
        totalUploads: 25,
        pendingPayments: 5,
        completedPayments: 20
      });
    }
  }, [hasPermission]);

  return (
    <ModulePermissionGate 
      module="WORKER"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h1>
            <p className="text-gray-500">You don't have permission to access the Worker module.</p>
            <p className="text-sm text-gray-400 mt-2">Please contact your administrator for access.</p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.fullName || 'User'}</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <PermissionButton
              permission="UPLOAD_WORKER_DATA"
              onClick={() => console.log('Navigate to upload')}
              variant="primary"
            >
              Upload Data
            </PermissionButton>
            
            <PermissionButton
              permission="READ_PAYMENTS"
              onClick={() => console.log('Navigate to payments')}
              variant="outline"
            >
              View Payments
            </PermissionButton>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionGate permission="READ_WORKER_DATA">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Uploads</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUploads}</p>
                </div>
              </div>
            </div>
          </ActionGate>

          <ActionGate permission="READ_PAYMENTS">
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-900">{stats.pendingPayments}</p>
                </div>
              </div>
            </div>
          </ActionGate>

          <ActionGate permission="READ_PAYMENTS">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Completed Payments</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completedPayments}</p>
                </div>
              </div>
            </div>
          </ActionGate>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Data Upload Section */}
          <ActionGate 
            permissions={["UPLOAD_WORKER_DATA", "READ_WORKER_DATA"]}
            fallback={
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-center">Worker data permissions required</p>
              </div>
            }
          >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              
              <div className="space-y-3">
                <PermissionButton
                  permission="UPLOAD_WORKER_DATA"
                  onClick={() => console.log('Upload new data')}
                  className="w-full"
                  variant="primary"
                >
                  Upload New Data
                </PermissionButton>

                <PermissionButton
                  permission="READ_WORKER_DATA"
                  onClick={() => console.log('View uploaded files')}
                  className="w-full"
                  variant="outline"
                >
                  View Uploaded Files
                </PermissionButton>

                <PermissionButton
                  permission="DELETE_WORKER_DATA"
                  onClick={() => console.log('Manage files')}
                  className="w-full"
                  variant="ghost"
                  hideIfNoPermission={false}
                >
                  Manage Files
                </PermissionButton>
              </div>

              {/* Show validation option for officers */}
              <ActionGate permission="VALIDATE_WORKER_DATA">
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <PermissionButton
                    permission="VALIDATE_WORKER_DATA"
                    onClick={() => console.log('Validate data')}
                    className="w-full"
                    variant="warning"
                  >
                    Validate Worker Data
                  </PermissionButton>
                </div>
              </ActionGate>
            </div>
          </ActionGate>

          {/* Payment Section */}
          <ActionGate 
            permission="READ_PAYMENTS"
            fallback={
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-center">Payment viewing permissions required</p>
              </div>
            }
          >
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              
              {/* Different content based on permissions */}
              <PermissionRenderer
                rules={[
                  {
                    permissions: ["GENERATE_WORKER_PAYMENTS", "PROCESS_PAYMENTS"],
                    component: (
                      <div className="space-y-3">
                        <p className="text-green-600 text-sm">✓ You can generate and process payments</p>
                        <PermissionButton
                          permission="GENERATE_WORKER_PAYMENTS"
                          onClick={() => console.log('Generate payment request')}
                          className="w-full"
                          variant="success"
                        >
                          Generate Payment Request
                        </PermissionButton>
                        <PermissionButton
                          permission="PROCESS_PAYMENTS"
                          onClick={() => console.log('Process payments')}
                          className="w-full"
                          variant="primary"
                        >
                          Process Payments
                        </PermissionButton>
                      </div>
                    )
                  }
                ]}
                fallback={
                  <div className="space-y-3">
                    <p className="text-blue-600 text-sm">View-only access to payment information</p>
                    <button 
                      onClick={() => console.log('View payment history')}
                      className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      View Payment History
                    </button>
                    <button 
                      onClick={() => console.log('View payment status')}
                      className="w-full px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      Check Payment Status
                    </button>
                  </div>
                }
              />
            </div>
          </ActionGate>
        </div>

        {/* Recent Activity */}
        <ActionGate 
          permissions={["READ_WORKER_DATA", "READ_PAYMENTS"]}
          fallback={null}
        >
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Payment processed for March 2024</span>
                <span className="ml-auto text-sm text-gray-500">2 days ago</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Data uploaded: attendance_march.xlsx</span>
                <span className="ml-auto text-sm text-gray-500">5 days ago</span>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-gray-700">Validation pending for February data</span>
                <span className="ml-auto text-sm text-gray-500">1 week ago</span>
              </div>
            </div>
          </div>
        </ActionGate>
      </div>
    </ModulePermissionGate>
  );
};

export default WorkerDashboard;
