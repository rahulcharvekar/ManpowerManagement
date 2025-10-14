import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.ROLES, token);
      setRoles(response || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      setError(error.message || 'Failed to fetch roles');
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setShowCreateModal(true);
  };

  const handleEditRole = (roleId) => {
    console.log('Edit role:', roleId);
    // Implementation for editing role
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      console.log('Delete role:', roleId);
      // Implementation for deleting role
    }
  };

  const handleManagePermissions = (roleId) => {
    console.log('Manage permissions for role:', roleId);
    // Implementation for managing role permissions
  };

  if (loading) {
    return (
      <div className="role-management-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="role-management-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            👥 <span className="ml-2">Role Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage system roles and their permissions</p>
        </div>

        <ActionGate componentKey="role-management" action="CREATE">
          <button
            onClick={handleCreateRole}
            className="btn btn-primary flex items-center"
          >
            <span className="mr-2">+</span>
            Add New Role
          </button>
        </ActionGate>
      </div>

      {/* Role Statistics */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              👤
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              ✅
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.filter(r => r.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              ⏸️
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">System Roles</p>
              <p className="text-2xl font-bold text-gray-900">
                {roles.filter(r => r.isSystemRole).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Roles</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="roles-table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {role.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {role.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions && role.permissions.slice(0, 3).map(permission => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          {permission}
                        </span>
                      ))}
                      {role.permissions && role.permissions.length > 3 && (
                        <span className="text-xs text-gray-500">+{role.permissions.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {role.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      role.isSystemRole
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {role.isSystemRole ? 'System' : 'Custom'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">

                      <ActionGate componentKey="role-management" action="EDIT">
                        <button
                          onClick={() => handleEditRole(role.id)}
                          className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50"
                        >
                          Edit
                        </button>
                      </ActionGate>

                      <ActionGate componentKey="role-management" action="MANAGE">
                        <button
                          onClick={() => handleManagePermissions(role.id)}
                          className="text-orange-600 hover:text-orange-900 px-3 py-1 rounded border border-orange-200 hover:bg-orange-50"
                        >
                          Permissions
                        </button>
                      </ActionGate>

                      {!role.isSystemRole && (
                        <ActionGate componentKey="role-management" action="DELETE">
                          <button
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-red-600 hover:text-red-900 px-3 py-1 rounded border border-red-200 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </ActionGate>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Role Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Role</h3>
              <p className="text-gray-600 mb-4">Role creation form would go here...</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
