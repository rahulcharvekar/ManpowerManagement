import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkerApi from '../../api/workerApi';
import { ActionGate, ModulePermissionGate } from '../core';

const WorkerList = () => {
  const { capabilities } = useAuth();
  const can = capabilities?.can || {};
  
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 20
  });

  // Load workers on component mount
  useEffect(() => {
    if (can['WORKER.LIST']) {
      loadWorkers();
    }
  }, [can, pagination.currentPage, searchTerm]);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await WorkerApi.listWorkers({
        page: pagination.currentPage,
        size: pagination.pageSize,
        search: searchTerm || undefined
      });
      
      if (response.success) {
        setWorkers(response.data);
        setPagination(prev => ({
          ...prev,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      }
    } catch (err) {
      console.error('❌ Error loading workers:', err);
      setError('Failed to load workers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedWorker(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (worker) => {
    setSelectedWorker(worker);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = async (workerId) => {
    try {
      setLoading(true);
      const response = await WorkerApi.getWorkerById(workerId);
      if (response.success) {
        setSelectedWorker(response.data);
        setModalMode('view');
        setShowModal(true);
      }
    } catch (err) {
      console.error('❌ Error viewing worker:', err);
      setError('Failed to load worker details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId, workerName) => {
    if (!window.confirm(`Are you sure you want to delete worker: ${workerName}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await WorkerApi.deleteWorker(workerId);
      
      if (response.success) {
        console.log('✅ Worker deleted successfully');
        loadWorkers(); // Reload the list
      }
    } catch (err) {
      console.error('❌ Error deleting worker:', err);
      setError(`Failed to delete worker: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorker = async (workerData) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (modalMode === 'create') {
        response = await WorkerApi.createWorker(workerData);
      } else if (modalMode === 'edit') {
        response = await WorkerApi.updateWorker(selectedWorker.id, workerData);
      }

      if (response.success) {
        console.log(`✅ Worker ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
        setShowModal(false);
        loadWorkers(); // Reload the list
      }
    } catch (err) {
      console.error(`❌ Error ${modalMode === 'create' ? 'creating' : 'updating'} worker:`, err);
      setError(`Failed to ${modalMode === 'create' ? 'create' : 'update'} worker: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  return (
    <ModulePermissionGate 
      module="WORKER"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h1>
            <p className="text-gray-500">You don't have permission to view worker list.</p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Worker List</h1>
            <p className="text-gray-600 mt-1">Manage worker records and information</p>
          </div>
          
          <ActionGate permission="WORKER.CREATE">
            <button
              onClick={handleCreate}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Add Worker
            </button>
          </ActionGate>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search workers by name, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg 
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
            </div>
            <button
              onClick={loadWorkers}
              disabled={loading}
              className="btn-outline flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Workers Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading workers...</p>
            </div>
          ) : workers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">👥</div>
              <p className="text-gray-500 text-lg">No workers found</p>
              <ActionGate permission="WORKER.CREATE">
                <button
                  onClick={handleCreate}
                  className="btn-primary mt-4"
                >
                  Add First Worker
                </button>
              </ActionGate>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Worker ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workers.map((worker) => (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {worker.workerId || worker.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {worker.name || worker.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {worker.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {worker.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            worker.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {worker.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <ActionGate permission="WORKER.READ">
                              <button
                                onClick={() => handleView(worker.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                              </button>
                            </ActionGate>
                            
                            <ActionGate permission="WORKER.UPDATE">
                              <button
                                onClick={() => handleEdit(worker)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Worker"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                            </ActionGate>
                            
                            <ActionGate permission="WORKER.DELETE">
                              <button
                                onClick={() => handleDelete(worker.id, worker.name || worker.fullName)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Worker"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </ActionGate>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{pagination.currentPage * pagination.pageSize + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)}
                      </span> of{' '}
                      <span className="font-medium">{pagination.totalElements}</span> workers
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 0}
                        className="btn-outline btn-sm"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages - 1}
                        className="btn-outline btn-sm"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Worker Modal (Create/Edit/View) */}
      {showModal && (
        <WorkerModal
          mode={modalMode}
          worker={selectedWorker}
          onClose={() => setShowModal(false)}
          onSave={handleSaveWorker}
        />
      )}
    </ModulePermissionGate>
  );
};

// Worker Modal Component
const WorkerModal = ({ mode, worker, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    workerId: worker?.workerId || '',
    name: worker?.name || worker?.fullName || '',
    email: worker?.email || '',
    phone: worker?.phone || '',
    department: worker?.department || '',
    position: worker?.position || '',
    hourlyRate: worker?.hourlyRate || '',
    status: worker?.status || 'ACTIVE'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isViewMode = mode === 'view';
  const title = mode === 'create' ? 'Add New Worker' : mode === 'edit' ? 'Edit Worker' : 'Worker Details';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Worker ID *
              </label>
              <input
                type="text"
                name="workerId"
                value={formData.workerId}
                onChange={handleChange}
                disabled={isViewMode}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isViewMode}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate
              </label>
              <input
                type="number"
                step="0.01"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isViewMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            {!isViewMode && (
              <button
                type="submit"
                className="btn-primary"
              >
                {mode === 'create' ? 'Create Worker' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerList;
