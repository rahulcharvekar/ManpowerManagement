import React, { useState, useCallback } from 'react';
import ApiService from '../api/apiService';

const FileUpload = ({ onUploadComplete, acceptedTypes = '.csv,.xlsx,.xls' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Validate file type
      const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        throw new Error(`File type not allowed. Accepted types: ${acceptedTypes}`);
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Simulate upload progress (in real implementation, you might get this from the API)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file using API service
      const response = await ApiService.uploadWorkerData(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedFile({
        ...response,
        fileName: file.name,
        fileSize: file.size
      });

      // Get file summary
      if (response.fileId) {
        const summary = await ApiService.getUploadedDataSummary(response.fileId);
        setUploadedFile(prev => ({ ...prev, ...summary }));
      }

      if (onUploadComplete) {
        onUploadComplete(response);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      setError(ApiService.handleApiError(error));
    } finally {
      setUploading(false);
    }
  };

  const handleValidateFile = async () => {
    if (!uploadedFile?.fileId) return;

    try {
      setUploading(true);
      const validationResult = await ApiService.validateUploadedData(uploadedFile.fileId);
      
      setUploadedFile(prev => ({
        ...prev,
        validationResult,
        isValidated: true
      }));

    } catch (error) {
      console.error('Validation failed:', error);
      setError(ApiService.handleApiError(error));
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setError('');
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-4xl text-gray-400">📁</div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: {acceptedTypes}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Maximum file size: 10MB
              </p>
            </div>
            
            <input
              type="file"
              accept={acceptedTypes}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={uploading}
            />
            
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              Browse Files
            </label>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-green-500 text-2xl">✅</div>
              <div>
                <h3 className="font-medium text-green-800">{uploadedFile.fileName}</h3>
                <p className="text-sm text-green-600">
                  {(uploadedFile.fileSize / 1024).toFixed(1)} KB uploaded successfully
                </p>
                {uploadedFile.totalRecords && (
                  <p className="text-sm text-green-600">
                    {uploadedFile.totalRecords} records found
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={resetUpload}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {uploadedFile.fileId && !uploadedFile.isValidated && (
            <div className="mt-4">
              <button
                onClick={handleValidateFile}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Validating...' : 'Validate Data'}
              </button>
            </div>
          )}

          {uploadedFile.validationResult && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-800 mb-2">Validation Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valid Records:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {uploadedFile.validationResult.validCount || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Invalid Records:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {uploadedFile.validationResult.invalidCount || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {uploading && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-400 text-sm">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
