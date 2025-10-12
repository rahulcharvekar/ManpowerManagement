import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiClient } from '../../api/apiConfig';
import { useAuth } from '../../contexts/AuthContext';
import DynamicTable from './DynamicTable';

const DynamicPage = ({ pageId, sortConfig }) => {
  const { capabilities } = useAuth();
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchEndpoints();
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
      const data = await response.json();
      if (data && data.endpoints && Array.isArray(data.endpoints)) {
        setEndpoints(data.endpoints);
      } else {
        setError('Invalid endpoints response');
      }
    } catch (err) {
      setError(err.message || 'Failed to load endpoints');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, uploadPath) => {
    const file = e.target.files[0];
    if (!file || !uploadPath) return;
    setUploading(true);
    setUploadError(null);
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', file);
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${uploadPath}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Optionally refetch data or show success
    } catch (err) {
      setUploadError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Loading page...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  const listEndpoint = endpoints.find(e => e.ui_type === 'LIST');
  const uploadEndpoint = endpoints.find(e => e.ui_type === 'UPLOAD');

  return (
    <div>
      {uploadEndpoint && (
        <div className="mb-4">
          <label className="btn-primary cursor-pointer">
            {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileUpload(e, uploadEndpoint.path)} className="hidden" disabled={uploading} />
          </label>
          {uploadError && <div className="text-red-600 text-sm mt-1">{uploadError}</div>}
        </div>
      )}
      {listEndpoint ? (
        <DynamicTable 
          key={`${pageId}-${JSON.stringify(sortConfig)}`}
          apiPath={listEndpoint.path} 
          uiType={listEndpoint.ui_type} 
          sortConfig={sortConfig} 
        />
      ) : (
        <div>No table endpoint found for this page.</div>
      )}
    </div>
  );
};

export default DynamicPage;
