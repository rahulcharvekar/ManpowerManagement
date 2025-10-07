import React from 'react';
import { 
  ActionGate, 
  PermissionButton, 
  ModulePermissionGate, 
  PermissionRenderer,
  PermissionSwitch 
} from '../core';

/**
 * Example Dashboard showing how to use permission-based UI components
 * This demonstrates the new permission matrix implementation
 */
const ExampleDashboard = () => {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Permission-Based Dashboard</h1>

      {/* Module-based sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Worker Management Module */}
        <ModulePermissionGate 
          module="WORKER"
          fallback={
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Worker module access required</p>
            </div>
          }
        >
          <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Worker Management</h2>
            
            <div className="space-y-2">
              <PermissionButton
                permission="READ_WORKER_DATA"
                onClick={() => console.log('View worker data')}
                variant="outline"
                className="w-full"
              >
                View Worker Data
              </PermissionButton>

              <PermissionButton
                permission="UPLOAD_WORKER_DATA"
                onClick={() => console.log('Upload worker data')}
                variant="success"
                className="w-full"
              >
                Upload Worker Data
              </PermissionButton>

              <PermissionButton
                permission="VALIDATE_WORKER_DATA"
                onClick={() => console.log('Validate data')}
                variant="warning"
                className="w-full"
              >
                Validate Data
              </PermissionButton>

              <PermissionButton
                permission="DELETE_WORKER_DATA"
                onClick={() => console.log('Delete data')}
                variant="danger"
                className="w-full"
              >
                Delete Worker Data
              </PermissionButton>
            </div>
          </div>
        </ModulePermissionGate>

        {/* Payment Management Module */}
        <ModulePermissionGate 
          module="PAYMENT"
          fallback={
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Payment module access required</p>
            </div>
          }
        >
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Payment Management</h2>
            
            <div className="space-y-2">
              <PermissionButton
                permission="READ_PAYMENTS"
                onClick={() => console.log('View payments')}
                variant="outline"
                className="w-full"
              >
                View Payments
              </PermissionButton>

              <PermissionButton
                permission="PROCESS_PAYMENTS"
                onClick={() => console.log('Process payments')}
                variant="primary"
                className="w-full"
              >
                Process Payments
              </PermissionButton>

              <PermissionButton
                permissions={["APPROVE_PAYMENTS", "REJECT_PAYMENTS"]}
                onClick={() => console.log('Manage approvals')}
                variant="warning"
                className="w-full"
              >
                Manage Approvals
              </PermissionButton>
            </div>
          </div>
        </ModulePermissionGate>

        {/* System Administration Module */}
        <ModulePermissionGate 
          module="SYSTEM"
          fallback={
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-500">System admin access required</p>
            </div>
          }
        >
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-900 mb-4">System Administration</h2>
            
            <div className="space-y-2">
              <PermissionButton
                permission="MANAGE_USERS"
                onClick={() => console.log('Manage users')}
                variant="outline"
                className="w-full"
              >
                Manage Users
              </PermissionButton>

              <PermissionButton
                permission="MANAGE_ROLES"
                onClick={() => console.log('Manage roles')}
                variant="secondary"
                className="w-full"
              >
                Manage Roles
              </PermissionButton>

              <PermissionButton
                permission="VIEW_SYSTEM_LOGS"
                onClick={() => console.log('View logs')}
                variant="ghost"
                className="w-full"
              >
                View System Logs
              </PermissionButton>
            </div>
          </div>
        </ModulePermissionGate>
      </div>

      {/* Role-based sections */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-6">Role-Based Components</h2>
        
        <PermissionRenderer
          rules={[
            {
              roles: ["ADMIN"],
              component: (
                <div className="p-4 bg-red-100 rounded border border-red-300">
                  <h3 className="font-semibold text-red-800">Administrator Dashboard</h3>
                  <p className="text-red-600">Full system access available</p>
                  <div className="mt-2 space-x-2">
                    <PermissionButton
                      permission="DATABASE_CLEANUP"
                      onClick={() => console.log('Database cleanup')}
                      variant="danger"
                      size="small"
                    >
                      Database Cleanup
                    </PermissionButton>
                    <PermissionButton
                      permission="SYSTEM_MAINTENANCE"
                      onClick={() => console.log('System maintenance')}
                      variant="warning"
                      size="small"
                    >
                      System Maintenance
                    </PermissionButton>
                  </div>
                </div>
              )
            },
            {
              roles: ["RECONCILIATION_OFFICER"],
              component: (
                <div className="p-4 bg-yellow-100 rounded border border-yellow-300">
                  <h3 className="font-semibold text-yellow-800">Reconciliation Officer Dashboard</h3>
                  <p className="text-yellow-600">Payment processing and reconciliation access</p>
                  <div className="mt-2 space-x-2">
                    <PermissionButton
                      permission="PERFORM_RECONCILIATION"
                      onClick={() => console.log('Perform reconciliation')}
                      variant="warning"
                      size="small"
                    >
                      Perform Reconciliation
                    </PermissionButton>
                    <PermissionButton
                      permission="GENERATE_RECONCILIATION_REPORTS"
                      onClick={() => console.log('Generate reports')}
                      variant="outline"
                      size="small"
                    >
                      Generate Reports
                    </PermissionButton>
                  </div>
                </div>
              )
            },
            {
              roles: ["WORKER"],
              component: (
                <div className="p-4 bg-blue-100 rounded border border-blue-300">
                  <h3 className="font-semibold text-blue-800">Worker Dashboard</h3>
                  <p className="text-blue-600">Data upload and payment viewing access</p>
                  <div className="mt-2 space-x-2">
                    <PermissionButton
                      permission="UPLOAD_WORKER_DATA"
                      onClick={() => console.log('Upload data')}
                      variant="primary"
                      size="small"
                    >
                      Upload Data
                    </PermissionButton>
                    <PermissionButton
                      permission="READ_PAYMENTS"
                      onClick={() => console.log('View payments')}
                      variant="outline"
                      size="small"
                    >
                      View Payments
                    </PermissionButton>
                  </div>
                </div>
              )
            }
          ]}
          fallback={
            <div className="p-4 bg-gray-100 rounded border">
              <p className="text-gray-500">Please contact administrator for role assignment</p>
            </div>
          }
        />
      </div>

      {/* Permission Switch Examples */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-6">Conditional Rendering Examples</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Administrative Functions</h3>
            
            <PermissionSwitch permission="MANAGE_USERS">
              <div className="p-3 bg-green-100 rounded border border-green-300">
                ✅ You can manage users
              </div>
            </PermissionSwitch>

            <PermissionSwitch 
              permission="MANAGE_USERS" 
              inverse={true}
              fallback={null}
            >
              <div className="p-3 bg-red-100 rounded border border-red-300 mt-2">
                ❌ You cannot manage users
              </div>
            </PermissionSwitch>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Data Operations</h3>
            
            <PermissionSwitch permissions={["UPLOAD_WORKER_DATA", "DELETE_WORKER_DATA"]}>
              <div className="p-3 bg-blue-100 rounded border border-blue-300">
                📊 You can manage worker data
              </div>
            </PermissionSwitch>

            <PermissionSwitch 
              permissions={["UPLOAD_WORKER_DATA", "DELETE_WORKER_DATA"]}
              requireAll={true}
            >
              <div className="p-3 bg-purple-100 rounded border border-purple-300 mt-2">
                🔒 You have full worker data permissions
              </div>
            </PermissionSwitch>
          </div>
        </div>
      </div>

      {/* ActionGate Examples */}
      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold mb-6">ActionGate Examples</h2>
        
        <div className="space-y-4">
          <ActionGate 
            permission="READ_BOARD_RECEIPTS"
            fallback={<p className="text-gray-500">Board receipt access required</p>}
          >
            <div className="p-4 bg-indigo-50 rounded border border-indigo-200">
              <h3 className="font-semibold text-indigo-800">Board Receipts Section</h3>
              <p className="text-indigo-600">This section is only visible to users with READ_BOARD_RECEIPTS permission</p>
            </div>
          </ActionGate>

          <ActionGate 
            module="RECONCILIATION"
            fallback={<p className="text-gray-500">Reconciliation module access required</p>}
          >
            <div className="p-4 bg-orange-50 rounded border border-orange-200">
              <h3 className="font-semibold text-orange-800">Reconciliation Section</h3>
              <p className="text-orange-600">This section is only visible to users with RECONCILIATION module access</p>
            </div>
          </ActionGate>

          <ActionGate 
            roles={["ADMIN", "RECONCILIATION_OFFICER"]}
            fallback={<p className="text-gray-500">Administrative access required</p>}
          >
            <div className="p-4 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-semibold text-gray-800">Administrative Section</h3>
              <p className="text-gray-600">This section requires ADMIN or RECONCILIATION_OFFICER role</p>
            </div>
          </ActionGate>
        </div>
      </div>
    </div>
  );
};

export default ExampleDashboard;
