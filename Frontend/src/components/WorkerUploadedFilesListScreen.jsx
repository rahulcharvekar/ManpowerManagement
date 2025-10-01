import { useState, useEffect } from 'react';
import { getUploadedFiles, getWorkerValidationResults, validateWorkerUploadedData } from '../api/workerPayments.js';

function WorkerUploadedFilesListScreen({ onGoBack }) {
  // State management
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationResults, setValidationResults] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [detailsCurrentPage, setDetailsCurrentPage] = useState(0);
  const [detailsPageSize, setDetailsPageSize] = useState(20);
  const [detailsTotalElements, setDetailsTotalElements] = useState(0);
  const [detailsTotalPages, setDetailsTotalPages] = useState(0);

  // Fetch uploaded files
  const fetchUploadedFiles = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/uploaded-files`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('fetchUploadedFiles API response:', result);
      
      // The API returns an array directly, not a paginated object
      if (Array.isArray(result)) {
        console.log('Files array received with', result.length, 'files');
        console.log('First file structure:', result[0]);
        setFiles(result);
        setTotalElements(result.length);
        setTotalPages(1);
        setCurrentPage(0);
      } else {
        console.log('Unexpected response format, not an array:', result);
        setFiles([]);
        setTotalElements(0);
        setTotalPages(0);
        setCurrentPage(0);
      }

    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setError(error.message || 'Failed to fetch uploaded files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Fetch validation results for a specific file
  const fetchValidationResults = async (fileId, page = 0, size = 20) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);

      console.log('fetchValidationResults called with fileId:', fileId, 'page:', page, 'size:', size);
      
      const data = await getWorkerValidationResults(fileId, page, size, 'rowNumber', 'asc');
      
      console.log('getWorkerValidationResults response:', data);
      console.log('Response keys:', Object.keys(data));
      console.log('Response type:', typeof data);
      console.log('Is array?', Array.isArray(data));
      
      if (data && data.records) {
        console.log('Found data.records with', data.records.length, 'records');
        setValidationResults(data.records);
        setDetailsTotalElements(data.totalElements || 0);
        setDetailsTotalPages(data.totalPages || 0);
        setDetailsCurrentPage(page);
      } else if (data && data.content) {
        console.log('Found data.content with', data.content.length, 'records');
        setValidationResults(data.content);
        setDetailsTotalElements(data.totalElements || 0);
        setDetailsTotalPages(data.totalPages || 0);
        setDetailsCurrentPage(page);
      } else if (Array.isArray(data)) {
        console.log('Response is array with', data.length, 'records');
        setValidationResults(data);
        setDetailsTotalElements(data.length);
        setDetailsTotalPages(1);
        setDetailsCurrentPage(0);
      } else {
        console.log('No data.records or data.content found, data structure:', data);
        console.log('Available properties:', Object.keys(data || {}));
        setValidationResults([]);
        setDetailsTotalElements(0);
        setDetailsTotalPages(0);
        setDetailsCurrentPage(0);
      }

    } catch (error) {
      console.error('Error fetching validation results:', error);
      setDetailsError(error.message || 'Failed to fetch validation results');
      setValidationResults([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle View Details button click
  const handleViewDetails = async (file) => {
    console.log('handleViewDetails called with file object:', file);
    console.log('File ID being used:', file.id);
    setSelectedFile(file);
    setShowDetailsModal(true);
    setDetailsCurrentPage(0);
    await fetchValidationResults(file.id, 0, detailsPageSize);
  };

  // Handle modal page change
  const handleDetailsPageChange = async (newPage) => {
    if (selectedFile) {
      await fetchValidationResults(selectedFile.id, newPage, detailsPageSize);
    }
  };

  // Handle Start Validation
  const handleStartValidation = async (file) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);
      
      console.log('Starting validation for file:', file.id);
      
      // Call the validation API
      await validateWorkerUploadedData(file.id);
      
      // Show success message
      alert(`Validation started successfully for file: ${file.filename}`);
      
      // Refresh the files list to show updated status
      await fetchUploadedFiles();
      
      // If modal is open, refresh the validation results
      if (showDetailsModal && selectedFile && selectedFile.id === file.id) {
        await fetchValidationResults(file.id, detailsCurrentPage, detailsPageSize);
      }
      
    } catch (error) {
      console.error('Error starting validation:', error);
      setDetailsError(error.message || 'Failed to start validation');
      alert(`Failed to start validation: ${error.message || 'Unknown error'}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedFile(null);
    setValidationResults([]);
    setDetailsError(null);
    setDetailsCurrentPage(0);
    setDetailsTotalElements(0);
    setDetailsTotalPages(0);
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'UPLOADED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Uploaded' },
      'VALIDATED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Validated' },
      'PROCESSING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
      'FAILED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' },
      'COMPLETED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Completed' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">View Uploaded Files</h1>
                <p className="text-sm text-gray-600">View all uploaded files in the system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Summary */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total files: {totalElements}
            </div>
            <button
              onClick={() => fetchUploadedFiles()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Files Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading files...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Error loading files</p>
              <p className="text-gray-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchUploadedFiles()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-medium">No files found</p>
              <p className="text-gray-500 text-sm mt-1">Upload some files to see them here</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Success/Failure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <tr key={file.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{file.filename}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(file.uploadDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.totalRecords}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-medium">{file.successCount}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-600 font-medium">{file.failureCount}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(file.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.requestReferenceNumber || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(file)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {files.map((file, index) => (
                  <div key={file.id || index} className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{file.filename}</span>
                      </div>
                      {getStatusBadge(file.status)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Upload Date: {formatDisplayDate(file.uploadDate)}</div>
                      <div>Records: {file.totalRecords}</div>
                      <div>Success/Failure: <span className="text-green-600">{file.successCount}</span>/<span className="text-red-600">{file.failureCount}</span></div>
                      {file.requestReferenceNumber && (
                        <div>Reference: {file.requestReferenceNumber}</div>
                      )}
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => handleViewDetails(file)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedFile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    File Details: {selectedFile.filename}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Showing worker records for file ID: {selectedFile.id}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {selectedFile.status === 'UPLOADED' && (
                    <button
                      onClick={() => handleStartValidation(selectedFile)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Start Validation
                    </button>
                  )}
                  <button
                    onClick={closeDetailsModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="max-h-96 overflow-y-auto">
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading details...</span>
                  </div>
                ) : detailsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-600 font-medium">Error loading details</p>
                    <p className="text-gray-600 text-sm mt-1">{detailsError}</p>
                  </div>
                ) : validationResults.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 font-medium">No worker records found</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Row</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Account</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {validationResults.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.rowNumber}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.workerId}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.firstName} {record.lastName}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.companyName}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.position}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                ${record.paymentAmount?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.workDate ? new Date(record.workDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{record.bankAccount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                      {validationResults.map((record, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">
                              {record.firstName} {record.lastName}
                            </h4>
                            <span className="text-sm text-gray-500">Row {record.rowNumber}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Worker ID:</span>
                              <span className="ml-1 text-gray-900">{record.workerId}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Company:</span>
                              <span className="ml-1 text-gray-900">{record.companyName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Position:</span>
                              <span className="ml-1 text-gray-900">{record.position}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Amount:</span>
                              <span className="ml-1 text-gray-900">${record.paymentAmount?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Work Date:</span>
                              <span className="ml-1 text-gray-900">
                                {record.workDate ? new Date(record.workDate).toLocaleDateString() : '-'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Bank Account:</span>
                              <span className="ml-1 text-gray-900">{record.bankAccount}</span>
                            </div>
                            {record.phoneNumber && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Phone:</span>
                                <span className="ml-1 text-gray-900">{record.phoneNumber}</span>
                              </div>
                            )}
                            {record.address && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Address:</span>
                                <span className="ml-1 text-gray-900">{record.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Pagination */}
              {detailsTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handleDetailsPageChange(Math.max(0, detailsCurrentPage - 1))}
                      disabled={detailsCurrentPage === 0}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handleDetailsPageChange(Math.min(detailsTotalPages - 1, detailsCurrentPage + 1))}
                      disabled={detailsCurrentPage >= detailsTotalPages - 1}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{detailsCurrentPage * detailsPageSize + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min((detailsCurrentPage + 1) * detailsPageSize, detailsTotalElements)}
                        </span> of{' '}
                        <span className="font-medium">{detailsTotalElements}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handleDetailsPageChange(Math.max(0, detailsCurrentPage - 1))}
                          disabled={detailsCurrentPage === 0}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {Array.from({ length: Math.min(5, detailsTotalPages) }, (_, i) => {
                          let pageNum;
                          if (detailsTotalPages <= 5) {
                            pageNum = i;
                          } else if (detailsCurrentPage < 3) {
                            pageNum = i;
                          } else if (detailsCurrentPage > detailsTotalPages - 4) {
                            pageNum = detailsTotalPages - 5 + i;
                          } else {
                            pageNum = detailsCurrentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handleDetailsPageChange(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pageNum === detailsCurrentPage
                                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum + 1}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => handleDetailsPageChange(Math.min(detailsTotalPages - 1, detailsCurrentPage + 1))}
                          disabled={detailsCurrentPage >= detailsTotalPages - 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerUploadedFilesListScreen;
