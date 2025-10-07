import React, { useState } from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const WorkerUpload = () => {
  const { canPerformAction } = usePermissions();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploading, setUploading] = useState(false);


  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Check file type (CSV, Excel)
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const isValidType = validTypes.includes(file.type) || 
                         file.name.endsWith('.csv') || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls');
      
      // Check file size (50MB limit)
      const isValidSize = file.size <= 50 * 1024 * 1024;
      
      return isValidType && isValidSize;
    });

    const invalidFiles = newFiles.filter(file => {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      const isValidType = validTypes.includes(file.type) || 
                         file.name.endsWith('.csv') || 
                         file.name.endsWith('.xlsx') || 
                         file.name.endsWith('.xls');
      const isValidSize = file.size <= 50 * 1024 * 1024;
      return !isValidType || !isValidSize;
    });

    if (invalidFiles.length > 0) {
      alert(`Some files were rejected:\n${invalidFiles.map(f => `${f.name} - ${!f.type.includes('csv') && !f.type.includes('excel') && !f.name.match(/\.(csv|xlsx|xls)$/) ? 'Invalid format' : 'File too large'}`).join('\n')}`);
    }

    setFiles(prev => [...prev, ...validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: 'ready',
      error: null,
      uploadedData: null
    }))]);
  };

  const uploadFile = async (fileItem) => {
    if (!canPerformAction('worker-upload', 'UPLOAD')) {
      alert('You do not have permission to upload files.');
      return;
    }

    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'uploading', error: null } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', fileItem.file);

      const token = localStorage.getItem('authToken');
      
      // Use the API client for consistent handling
      const response = await apiClient.post(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.UPLOAD,
        formData,
        token,
        null // Let FormData set the content type
      );

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'completed', 
          uploadedData: response 
        } : f
      ));

      // Show success message
      console.log('File uploaded successfully:', response);

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { 
          ...f, 
          status: 'error', 
          error: error.message || 'Upload failed'
        } : f
      ));
    }
  };

  const uploadAllFiles = async () => {
    const readyFiles = files.filter(f => f.status === 'ready');
    setUploading(true);
    
    try {
      for (const file of readyFiles) {
        await uploadFile(file);
      }
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const clearCompletedFiles = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'text-primary-600';
      case 'uploading': return 'text-warning-600';
      case 'completed': return 'text-success-600';
      case 'error': return 'text-error-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return '📄';
      case 'uploading': return '⏳';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready': return 'badge badge-info';
      case 'uploading': return 'badge badge-warning';
      case 'completed': return 'badge badge-success';
      case 'error': return 'badge badge-error';
      default: return 'badge';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = canPerformAction('worker-upload', 'UPLOAD');
  const readyFilesCount = files.filter(f => f.status === 'ready').length;
  const completedFilesCount = files.filter(f => f.status === 'completed').length;
    const errorFilesCount = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              📁 <span className="ml-3">Worker Payment Upload</span>
            </h1>
            <p className="text-gray-600 mt-2">Upload worker payment data files for processing</p>
          </div>
          
          {files.filter(f => f.status === 'completed').length > 0 && (
            <button 
              onClick={clearCompletedFiles}
              className="btn-secondary"
            >
              Clear Completed
            </button>
          )}
        </div>
        
        {/* Upload Statistics */}
        {files.length > 0 && (
          <div className="mt-4 flex space-x-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-500">Ready:</span>
              <span className="ml-1 text-sm font-medium text-primary-600">{files.filter(f => f.status === 'ready').length}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">Completed:</span>
              <span className="ml-1 text-sm font-medium text-success-600">{files.filter(f => f.status === 'completed').length}</span>
            </div>
            {files.filter(f => f.status === 'error').length > 0 && (
              <div className="flex items-center">
                <span className="text-sm text-gray-500">Errors:</span>
                <span className="ml-1 text-sm font-medium text-error-600">{files.filter(f => f.status === 'error').length}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Upload Area */}
      <div className="card shadow-modern-lg">
        <div className="card-body">
          {canPerformAction('worker-upload', 'UPLOAD') ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-primary-400 bg-primary-50 scale-105 shadow-lg' 
                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50 hover:shadow-md'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <div className="text-gray-600">
                <div className="text-6xl mb-6 animate-bounce">📁</div>
                <div className="text-xl font-semibold mb-3">
                  {dragActive ? 'Drop files here!' : 'Drag and drop files here, or click to browse'}
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  Supports CSV and Excel files (.csv, .xlsx, .xls)
                </div>
                <button 
                  onClick={() => document.getElementById('file-input').click()}
                  className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                  disabled={uploading}
                >
                  <span className="mr-2">📂</span>
                  Choose Files
                </button>
                <div className="text-xs text-gray-400 mt-4">
                  Maximum file size: 50MB per file | Maximum rows: 10,000 per file
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <div className="text-gray-500 space-y-4">
                <div className="text-4xl">🔒</div>
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Access Restricted</h3>
                  <p>You do not have permission to upload files</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Upload Queue</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map((fileItem) => (
              <div key={fileItem.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getStatusIcon(fileItem.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.file.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(fileItem.file.size)}
                      </div>
                      <div className="mt-1">
                        <span className={getStatusBadge(fileItem.status)}>
                          {fileItem.status.charAt(0).toUpperCase() + fileItem.status.slice(1)}
                        </span>
                      </div>
                      {fileItem.error && (
                        <div className="text-sm text-error-600 mt-1">
                          Error: {fileItem.error}
                        </div>
                      )}
                      {fileItem.result && (
                        <div className="text-sm text-success-600 mt-1">
                          ✅ Upload successful - File ID: {fileItem.result.fileId || 'Generated'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {fileItem.status === 'uploading' && (
                      <div className="w-32">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          {uploadProgress[fileItem.id] || 0}%
                        </div>
                      </div>
                    )}
                    
                    {fileItem.status === 'ready' && canUpload && (
                      <button 
                        onClick={() => uploadFile(fileItem)}
                        className="btn-primary btn-sm"
                      >
                        Upload
                      </button>
                    )}
                    
                    {fileItem.status === 'completed' && (
                      <button 
                        onClick={() => {
                          // Navigate to results page
                          console.log('View results for:', fileItem.result);
                        }}
                        className="btn-success btn-sm"
                      >
                        View Results
                      </button>
                    )}
                    
                    <button 
                      onClick={() => removeFile(fileItem.id)}
                      className="text-error-600 hover:text-error-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="card-body">
          <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-center">
            📋 <span className="ml-2">Upload Guidelines</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-primary-800">
            <div>
              <h4 className="font-semibold mb-3">📄 Supported Formats</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  CSV files (.csv)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Excel files (.xlsx, .xls)
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">📊 Required Columns</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Worker ID
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Worker Name
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Payment Amount
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Payment Date
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">⚠️ File Requirements</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Maximum size: 50MB
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Maximum rows: 10,000
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">✅ Data Validation</h4>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Duplicate entries flagged
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Invalid dates rejected
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                  Missing fields cause errors
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerUpload;
