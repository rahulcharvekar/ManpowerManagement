import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/apiConfig';

const CapabilityManagement = () => {
  const { capabilities } = useAuth();
  const [endpoints, setEndpoints] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Find the page for Capability Management from backend config
  const capabilityPage = capabilities.pages.find(
    (p) => p.path === '/admin/capabilities' && Array.isArray(p.actions)
  );
  const pageId = capabilityPage?.id;

  useEffect(() => {
    if (pageId) {
      fetchEndpoints();
    }
  }, [pageId]);

  const fetchEndpoints = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/meta/endpoints?page_id=${pageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch endpoints');
      const result = await response.json();
      if (result && result.endpoints && Array.isArray(result.endpoints)) {
        setEndpoints(result.endpoints);
        fetchData(result.endpoints);
      } else {
        setError('Invalid endpoints response');
      }
    } catch (err) {
      setError(err.message || 'Failed to load endpoints');
      setLoading(false);
    }
  };

  const fetchData = async (eps = endpoints) => {
    const listEndpoint = eps.find(e => e.ui_type === 'LIST');
    if (!listEndpoint) {
      setError('No LIST endpoint found');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(listEndpoint.path, token);
      setData(response || []);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({});
    setShowCreateModal(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setShowEditModal(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this capability?')) return;
    const deleteEndpoint = endpoints.find(e => e.ui_type === 'DELETE');
    if (!deleteEndpoint) {
      setError('No DELETE endpoint found');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      await apiClient.delete(`${deleteEndpoint.path}/${item.id}`, token);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEdit = !!selectedItem;
    const endpoint = endpoints.find(e => e.ui_type === (isEdit ? 'UPDATE' : 'CREATE'));
    if (!endpoint) {
      setError(`No ${isEdit ? 'UPDATE' : 'CREATE'} endpoint found`);
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const url = isEdit ? `${endpoint.path}/${selectedItem.id}` : endpoint.path;
      const method = isEdit ? 'put' : 'post';
      await apiClient[method](url, formData, token);
      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      setError(err.message || `Failed to ${isEdit ? 'update' : 'create'}`);
    }
  };

  if (!pageId) {
    return <div>Loading page configuration...</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="capability-management">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Capability Management</h1>
        <button onClick={handleCreate} className="btn btn-primary">Create Capability</button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {data[0] && Object.keys(data[0]).map((col) => (
              <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
            ))}
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, idx) => (
            <tr key={idx}>
              {Object.values(item).map((val, i) => (
                <td key={i} className="px-4 py-2 whitespace-nowrap text-sm">{String(val)}</td>
              ))}
              <td className="px-4 py-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(item)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Create Capability</h2>
            <form onSubmit={handleSubmit}>
              {/* Add form fields here based on capability structure */}
              <input
                type="text"
                placeholder="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 mb-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-2 mb-2 w-full"
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="mr-2 px-4 py-2 bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl mb-4">Edit Capability</h2>
            <form onSubmit={handleSubmit}>
              {/* Add form fields here */}
              <input
                type="text"
                placeholder="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 mb-2 w-full"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-2 mb-2 w-full"
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setShowEditModal(false)} className="mr-2 px-4 py-2 bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapabilityManagement;
