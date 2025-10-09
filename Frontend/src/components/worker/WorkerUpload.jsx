import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkerApi from '../../api/workerApi';
import { ActionGate, ModulePermissionGate } from '../core';

const WorkerUpload = () => {
  const { user, capabilities } = useAuth();
  const can = capabilities?.can || {};
  
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load uploaded files history on component mount
  useEffect(() => {
    if (can['WORKER.LIST']) {
      loadFilesHistory();
    }
  }, [can]);

  const loadFilesHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await WorkerApi.getFilesSummaries({ page: 0, size: 10 });
      if (response.success) {
        setUploadedFiles(response.data);
      }
    } catch (err) {
      console.error('Error loading files history:', err);
      setError('Failed to load upload history');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!validTypes.includes(fileExtension)) {
        setError(`Invalid file type. Please upload ${validTypes.join(', ')} files only.`);
        return;
      }
      
      // Validate file size (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setError('File size exceeds 10MB limit.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await WorkerApi.uploadWorkerFile(selectedFile, {
        description: `Worker data upload - ${new Date().toLocaleDateString()}`,
        uploadType: 'WORKER_DATA'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        console.log('✅ Upload successful:', response.data);
        
        // Add to uploaded files list
        setUploadedFiles(prev => [
          {
            ...response.data,
            uploadedBy: user?.username || 'Unknown',
            isValidated: false
          },
          ...prev
        ]);
        
        // Reset form
        setSelectedFile(null);
        setUploadProgress(0);
        
        // Auto-validate the file if permission exists
        if (can['WORKER.VALIDATE']) {
          await handleValidate(response.data.fileId);
        }
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleValidate = async (fileId) => {
    try {
      setLoading(true);
      const response = await WorkerApi.validateWorkerFile(fileId);
      
      if (response.success) {
        console.log('✅ Validation successful:', response.data);
        
        // Update file in the list
        setUploadedFiles(prev =>
          prev.map(file =>
            file.fileId === fileId
              ? {
                  ...file,
                  isValidated: true,
                  validRecords: response.data.validRecords,
                  invalidRecords: response.data.invalidRecords,
                  validationErrors: response.data.errors
                }
              : file
          )
        );
      }
    } catch (err) {
      console.error('❌ Validation error:', err);
      setError(`Validation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await WorkerApi.deleteUploadedFile(fileId);
      
      if (response.success) {
        console.log('✅ File deleted successfully');
        setUploadedFiles(prev => prev.filter(file => file.fileId !== fileId));
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      setError(`Failed to delete file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      await WorkerApi.downloadTemplate('xlsx');
      console.log('✅ Template downloaded successfully');
    } catch (err) {
      console.error('❌ Template download error:', err);
      setError('Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModulePermissionGate 
      module="WORKER"
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-6xl text-gray-400 mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Access Denied</h1>
            <p className="text-gray-500">You don't have permission to upload worker data.</p>
          </div>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Worker Data</h1>
            <p className="text-gray-600 mt-1">Upload and manage worker attendance and payment data</p>
          </div>
          
          <div className="flex gap-3">
            <ActionGate permission="WORKER.DOWNLOAD">
              <button
                onClick={handleDownloadTemplate}
                disabled={loading}
                className="btn-outline flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Download Template
              </button>
            </ActionGate>
            
            <ActionGate permission="WORKER.LIST">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-outline"
              >
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            </ActionGate>
          </div>
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

        {/* Upload Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-semibold mb-2">📋 Upload Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
            <li>Supported file formats: CSV, Excel (.xlsx, .xls)</li>
            <li>Maximum file size: 10MB</li>
            <li>Ensure your file contains required columns: Worker ID, Name, Hours, Rate</li>
            <li>Files will be validated automatically after upload</li>
            <li>Download the template for the correct format</li>
          </ul>
        </div>

        {/* File Upload Component */}
        <ActionGate 
          permission="WORKER.CREATE"
          fallback={
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">You need WORKER.CREATE permission to upload files</p>
            </div>
          }
        >
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
            
            {/* File Input */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="hidden"
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <span className="text-lg font-medium text-gray-700">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    or drag and drop
                  </span>
                  <span className="text-xs text-gray-400 mt-2">
                    CSV, XLSX, XLS up to 10MB
                  </span>
                </label>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {selectedFile && !uploading && (
                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || loading}
                    className="btn-primary flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setError(null);
                    }}
                    disabled={uploading}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </ActionGate>

        {/* Recent Uploads */}
        {showHistory && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Uploads</h2>
            
            {loading && uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading upload history...</p>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No uploads yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={file.fileId || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {file.isValidated ? '✅' : '📄'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{file.fileName || 'Uploaded File'}</h3>
                        <p className="text-sm text-gray-500">
                          Uploaded by {file.uploadedBy} on {new Date(file.uploadedAt).toLocaleString()}
                        </p>
                        {file.totalRecords && (
                          <p className="text-sm text-gray-600">
                            {file.totalRecords} records
                            {file.isValidated && (
                              <span className="ml-2">
                                (✓ {file.validRecords} valid, ✗ {file.invalidRecords} invalid)
                              </span>
                            )}
                          </p>
                        )}
                        {file.status && (
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded mt-1 ${
                            file.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                            file.status === 'UPLOADED' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {file.status}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {!file.isValidated && can['WORKER.VALIDATE'] && (
                        <button 
                          onClick={() => handleValidate(file.fileId)}
                          disabled={loading}
                          className="btn-sm btn-primary"
                        >
                          Validate
                        </button>
                      )}
                      
                      <ActionGate permission="WORKER.READ">
                        <button 
                          onClick={() => window.location.href = `/workers/file/${file.fileId}`}
                          className="btn-sm btn-outline"
                        >
                          View
                        </button>
                      </ActionGate>
                      
                      <ActionGate permission="WORKER.DELETE">
                        <button 
                          onClick={() => handleDelete(file.fileId)}
                          disabled={loading}
                          className="btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </ActionGate>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Statistics */}
        <ActionGate permission="WORKER.READ">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Uploads</p>
                  <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Validated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {uploadedFiles.filter(f => f.isValidated).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {uploadedFiles.reduce((sum, f) => sum + (f.totalRecords || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ActionGate>
      </div>
    </ModulePermissionGate>
  );
};

export default WorkerUpload;
