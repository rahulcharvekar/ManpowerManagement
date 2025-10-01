import { useState, useEffect } from 'react';

function WorkerGenerateRequestScreen({ onGoBack }) {
  // Helper function to format date for API
  const formatDateForAPI = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // State management
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: formatDateForAPI(new Date()),
    endDate: formatDateForAPI(new Date()),
    status: 'ALL'
  });

  // Fetch uploaded files
  const fetchUploadedFiles = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Import the API function
      const { getWorkerFileSummariesComplete } = await import('../api/workerPayments.js');

      // Prepare filter parameters
      const filterParams = {
        page: page,
        size: 20,
        sortBy: 'uploadDate',
        sortDir: 'desc',
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      const result = await getWorkerFileSummariesComplete(filterParams);
      
      setFiles(result.data || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
      setCurrentPage(result.currentPage || 0);

    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      setError(error.message || 'Failed to fetch uploaded files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load files on component mount and filter changes
  useEffect(() => {
    fetchUploadedFiles(0);
  }, [filters.startDate, filters.endDate, filters.status]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchUploadedFiles(newPage);
    }
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

  // Generate request function
  const handleGenerateRequest = async (fileId) => {
    try {
      // Import the function from workerPayments
      const { generateRequestFromUploadedData } = await import('../api/workerPayments.js');
      
      const result = await generateRequestFromUploadedData(fileId, "string");
      alert('Request generated successfully!');
      
      // Refresh the files list
      fetchUploadedFiles(currentPage);
    } catch (error) {
      console.error('Error generating request:', error);
      alert(`Failed to generate request: ${error.message}`);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'UPLOADED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Uploaded' },
      'VALIDATED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Validated' },
      'REQUEST_GENERATED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Request Generated' },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
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
                <h1 className="text-2xl font-bold text-gray-800">Generate Payment Request</h1>
                <p className="text-sm text-gray-600">View and manage your uploaded files</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="UPLOADED">Uploaded</option>
                <option value="VALIDATED">Validated</option>
                <option value="REQUEST_GENERATED">Request Generated</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {files.length} of {totalElements} files
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
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
                onClick={() => fetchUploadedFiles(currentPage)}
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
                        File ID
                      </th>
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
                        Overall Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <tr key={file.fileId || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {file.fileId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(file.uploadDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {file.totalRecords}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(file.overallStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{file.totalValidatedAmount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleGenerateRequest(file.fileId)}
                            disabled={file.overallStatus !== 'VALIDATED'}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              file.overallStatus === 'VALIDATED'
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Generate Request
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
                  <div key={file.fileId || index} className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                      </div>
                      {getStatusBadge(file.overallStatus)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      <div>File ID: <span className="font-mono">{file.fileId}</span></div>
                      <div>Upload Date: {formatDisplayDate(file.uploadDate)}</div>
                      <div>Records: {file.totalRecords}</div>
                      <div>Amount: ₹{file.totalValidatedAmount || 0}</div>
                    </div>
                    <button
                      onClick={() => handleGenerateRequest(file.fileId)}
                      disabled={file.overallStatus !== 'VALIDATED'}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        file.overallStatus === 'VALIDATED'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Generate Request
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                  if (pageNum >= totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage >= totalPages - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerGenerateRequestScreen;
