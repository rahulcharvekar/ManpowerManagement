import { useState, useEffect } from "react";
import { 
  uploadWorkerPaymentFile, 
  getWorkerUploadedData,
  getWorkerUploadedDataSummary,
  validateWorkerUploadedData,
  validateWorkerPaymentFileById,
  validateFileBeforeUpload,
  getUploadedFiles,
  getWorkerValidationResults
} from "../api/workerPayments.js";

function WorkerFileUploadScreen({ onGoBack }) {
  // Helper function to ensure date is in YYYY-MM-DD format
  const formatDateForAPI = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    // If it's a Date object or other format, convert it
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // Component initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  
  // File list state
  const [filesList, setFilesList] = useState([]);
  const [filteredFilesList, setFilteredFilesList] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [filesError, setFilesError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: formatDateForAPI(new Date()),
    endDate: formatDateForAPI(new Date()),
    status: 'ALL'
  });
  
  // Upload popup state
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  
  // File details view state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  
  // Validation summary state
  const [validationSummary, setValidationSummary] = useState({
    passed: 0,
    failed: 0,
    total: 0
  });
  
  // Pagination state for file details
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  // Load files by date range
  const loadUploadedFiles = async () => {
    setIsLoadingFiles(true);
    setFilesError(null);
    
    try {
      const response = await getUploadedFiles(0, 100); // Get first 100 files
      let allFiles = [];
      
      if (Array.isArray(response)) {
        // Direct array response from API
        allFiles = response.map(file => ({
          fileId: file.id,
          fileName: file.filename,
          totalRecords: file.totalRecords || 0,
          successCount: file.successCount || 0,
          failureCount: file.failureCount || 0,
          uploadDate: file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : '',
          uploadedBy: file.uploadedBy || 'System',
          status: file.status || 'UPLOADED',
          requestReferenceNumber: file.requestReferenceNumber
        }));
      } else if (response && response.content && Array.isArray(response.content)) {
        // Paginated response from API
        allFiles = response.content.map(file => ({
          fileId: file.id,
          fileName: file.filename,
          totalRecords: file.totalRecords || 0,
          successCount: file.successCount || 0,
          failureCount: file.failureCount || 0,
          uploadDate: file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : '',
          uploadedBy: file.uploadedBy || 'System',
          status: file.status || 'UPLOADED',
          requestReferenceNumber: file.requestReferenceNumber
        }));
      }
      
      setFilesList(allFiles);
      applyStatusFilter(allFiles, filters.status);
    } catch (error) {
      console.error('Error loading files:', error);
      setFilesError(error?.message || 'Failed to load files');
      setFilesList([]);
      setFilteredFilesList([]);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Apply status filter to files list
  const applyStatusFilter = (files, statusFilter) => {
    if (statusFilter === 'ALL') {
      setFilteredFilesList(files);
    } else {
      const filtered = files.filter(file => 
        file?.status?.toUpperCase() === statusFilter.toUpperCase()
      );
      setFilteredFilesList(filtered);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    if (field === 'status') {
      applyStatusFilter(filesList, value);
    }
    // Note: Date filters are simplified since we're loading all files
  };

  // Upload handlers
  const openUploadPopup = () => {
    setShowUploadPopup(true);
    setUploadFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const closeUploadPopup = () => {
    setShowUploadPopup(false);
    setUploadFile(null);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file before setting
      const validation = validateFileBeforeUpload(file);
      if (!validation.isValid) {
        setUploadError(validation.errorMessage);
        return;
      }
      setUploadFile(file);
      setUploadError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const response = await uploadWorkerPaymentFile(uploadFile);
      
      // Show success message from API response
      if (response && response.message) {
        setUploadSuccess(response.message);
      } else {
        setUploadSuccess('File uploaded successfully');
      }
      
      closeUploadPopup();
      await loadUploadedFiles(); // Refresh the files list
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(null);
      }, 5000);
    } catch (error) {
      setUploadError(error?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection from list to view details
  const handleViewFileDetails = async (file) => {
    console.log('handleViewFileDetails called with file:', file);
    if (!file || !file.fileId) {
      console.error('Invalid file selected:', file);
      setFilesError('Invalid file selected');
      return;
    }

    console.log('Setting selected file:', file);
    setSelectedFile(file);
    setIsLoadingDetails(true);
    setFilesError(null);
    
    try {
      console.log('Loading details for file:', file);
      // Use the new validation results API - call with just fileId and basic pagination
      const details = await getWorkerValidationResults(
        file.fileId, 
        0, // page
        20 // size
        // Remove hardcoded filters - let API return all records for this file
      );
      
      console.log('API response:', details);
      
      // Transform the response to match expected format
      const transformedDetails = {
        content: details?.records || [],
        totalElements: details?.totalElements || 0,
        totalPages: details?.totalPages || 0,
        currentPage: details?.currentPage || 0,
        hasNext: details?.hasNext || false,
        hasPrevious: details?.hasPrevious || false,
        appliedFilters: details?.appliedFilters || {}
      };
      
      console.log('Transformed details:', transformedDetails);
      setFileDetails(transformedDetails);
      setCurrentPage(0);
      
      // Calculate validation summary from the records
      if (details?.records) {
        const passed = details.records.filter(record => record.status === 'VALIDATED').length;
        const failed = details.records.filter(record => record.status === 'FAILED').length;
        const uploaded = details.records.filter(record => record.status === 'UPLOADED').length;
        setValidationSummary({
          passed,
          failed,
          total: details.records.length,
          uploaded
        });
      }
    } catch (error) {
      console.error('Error loading file details:', error);
      setFilesError(error?.message || 'Failed to load file details');
      setFileDetails(null);
      setSelectedFile(null); // Reset selected file on error
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Go back to files list
  const handleGoBackToList = () => {
    setSelectedFile(null);
    setFileDetails(null);
    setValidationSummary({ passed: 0, failed: 0, total: 0 });
  };

  // Validate selected file
  const handleFileValidation = async () => {
    if (!selectedFile) {
      return;
    }

    console.log('Starting validation for file:', selectedFile.fileId);
    setIsValidating(true);
    setFilesError(null);

    try {
      const validationResponse = await validateWorkerUploadedData(selectedFile.fileId);
      console.log('Validation response:', validationResponse);
      
      // Handle validation response
      if (validationResponse) {
        // Update file status based on backend response
        const updatedFile = {
          ...selectedFile,
          status: validationResponse.status || 'VALIDATED',
          nextAction: validationResponse.nextAction,
          validationMessage: validationResponse.message,
          passedCount: validationResponse.passed,
          failedCount: validationResponse.failed
        };
        
        setSelectedFile(updatedFile);
        
        // Refresh file details to show updated validation results using the new API
        try {
          console.log('Refreshing file details after validation...');
          const details = await getWorkerValidationResults(updatedFile.fileId, 0, 20);
          
          const transformedDetails = {
            content: details?.records || [],
            totalElements: details?.totalElements || 0,
            totalPages: details?.totalPages || 0,
            currentPage: details?.currentPage || 0,
            hasNext: details?.hasNext || false,
            hasPrevious: details?.hasPrevious || false,
            appliedFilters: details?.appliedFilters || {}
          };
          
          setFileDetails(transformedDetails);
          setCurrentPage(0);
          
          // Update validation summary from the refreshed records
          if (details?.records) {
            const passed = details.records.filter(record => record.status === 'VALIDATED').length;
            const failed = details.records.filter(record => record.status === 'FAILED').length;
            const uploaded = details.records.filter(record => record.status === 'UPLOADED').length;
            setValidationSummary({
              passed,
              failed,
              total: details.records.length,
              uploaded
            });
          }
        } catch (detailsError) {
          console.error('Error refreshing file details:', detailsError);
        }
        
        // Also refresh the files list to update the main view
        await loadUploadedFiles();
      }
    } catch (error) {
      setFilesError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await loadUploadedFiles();
      } catch (error) {
        console.error('Error initializing component:', error);
        setFilesError('Failed to initialize component');
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeComponent();
    }
  }, [isInitialized, filters.startDate, filters.endDate]);

  // Handle page change for file details
  const handlePageChange = async (page) => {
    if (!selectedFile || page < 0) return;
    
    setCurrentPage(page);
    setIsLoadingDetails(true);
    setFilesError(null);
    
    try {
      console.log('Loading page', page, 'for file:', selectedFile.fileId);
      // Use the new validation results API with the new page
      const details = await getWorkerValidationResults(
        selectedFile.fileId, 
        page, // use the new page number
        20 // size
      );
      
      console.log('Pagination API response:', details);
      
      // Transform the response to match expected format
      const transformedDetails = {
        content: details?.records || [],
        totalElements: details?.totalElements || 0,
        totalPages: details?.totalPages || 0,
        currentPage: details?.currentPage || page,
        hasNext: details?.hasNext || false,
        hasPrevious: details?.hasPrevious || false,
        appliedFilters: details?.appliedFilters || {}
      };
      
      console.log('Transformed pagination details:', transformedDetails);
      setFileDetails(transformedDetails);
      
      // Update validation summary from the new page records
      if (details?.records) {
        const passed = details.records.filter(record => record.status === 'VALIDATED').length;
        const failed = details.records.filter(record => record.status === 'FAILED').length;
        const uploaded = details.records.filter(record => record.status === 'UPLOADED').length;
        setValidationSummary({
          passed,
          failed,
          total: details.records.length,
          uploaded
        });
      }
    } catch (error) {
      console.error('Error loading page:', error);
      setFilesError(error?.message || 'Failed to load page');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Format file status for display
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'uploaded': return 'bg-blue-100 text-blue-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Simple helper functions
  const showStartValidationButton = () => {
    return selectedFile?.status?.toUpperCase() === 'UPLOADED' && !selectedFile?.nextAction;
  };

  // Show loading screen during initial component setup
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading Worker Dashboard</h2>
          <p className="text-gray-500">Please wait while we load your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={selectedFile ? () => setSelectedFile(null) : onGoBack}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {selectedFile ? 'File Details & Validation' : 'File Upload & Validation'}
                </h1>
                <p className="text-blue-100">
                  {selectedFile 
                    ? `File: ${selectedFile.fileName}` 
                    : 'Upload and validate worker payment files'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!selectedFile && (
                <button
                  onClick={openUploadPopup}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload File
                </button>
              )}



              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-white">Worker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {selectedFile ? (
          /* File Details View */
          <div className="space-y-6">
            {/* File Info Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">File Information</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    File details and validation status
                  </p>
                </div>
                
                <button
                  onClick={handleGoBackToList}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Files
                </button>
              </div>

              {/* File Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.fileName}</div>
                  <div className="text-sm text-gray-600">File Name</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.totalRecords || 0}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">{selectedFile.successCount || 0}</div>
                  <div className="text-sm text-gray-600">Success Count</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-red-600">{selectedFile.failureCount || 0}</div>
                  <div className="text-sm text-gray-600">Failure Count</div>
                </div>
                <div>
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedFile.status)}`}>
                    {selectedFile.status || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Status</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {showStartValidationButton() && (
                  <button
                    onClick={handleFileValidation}
                    disabled={isValidating}
                    className="bg-green-600 text-white hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isValidating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Validating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Validation
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* File Records Table */}
            {fileDetails && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
                {/* Loading Overlay for Pagination */}
                {isLoadingDetails && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-2"></div>
                      <p className="text-sm text-gray-600">Loading records...</p>
                    </div>
                  </div>
                )}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Individual Record Status</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Detailed validation status for each record
                  </p>
                </div>

                {isLoadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="ml-4 text-gray-600">Loading record details...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Row #
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Worker ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Worker Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Position
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bank Account
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rejection Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(fileDetails?.content || []).map((record, index) => (
                          <tr key={record.id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.rowNumber || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.workerId || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.workerName || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.department || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.position || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                              ₹{record.paymentAmount ? Number(record.paymentAmount).toLocaleString('en-IN', {minimumFractionDigits: 2}) : '0.00'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.bankAccount || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                                {record.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.rejectionReason || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {fileDetails && fileDetails.totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Showing page {currentPage + 1} of {fileDetails.totalPages}
                            ({fileDetails.totalElements} total records)
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 0 || isLoadingDetails}
                              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoadingDetails ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                              ) : (
                                'Previous'
                              )}
                            </button>
                            <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                              {currentPage + 1}
                            </span>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage >= fileDetails.totalPages - 1 || isLoadingDetails}
                              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isLoadingDetails ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent"></div>
                              ) : (
                                'Next'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Files List View */
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="UPLOADED">Uploaded</option>
                    <option value="VALIDATED">Validated</option>
                    <option value="PROCESSED">Processed</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {filesError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{filesError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{uploadSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Files Grid */}
            {isLoadingFiles ? (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading files...</p>
              </div>
            ) : filteredFilesList.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Files Found</h3>
                <p className="text-gray-500 mb-4">
                  No files found for the selected date range and status filter.
                </p>
                <button
                  onClick={openUploadPopup}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                >
                  Upload File
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 text-sm">
                    <div className="col-span-4">Filename</div>
                    <div className="col-span-2 text-center">Total Records</div>
                    <div className="col-span-2 text-center">Success Count</div>
                    <div className="col-span-2 text-center">Failure Count</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {filteredFilesList.map((file, index) => (
                    <div key={file.fileId || index} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Filename */}
                        <div className="col-span-4">
                          <div className="font-medium text-gray-900 truncate" title={file.fileName}>
                            {file.fileName}
                          </div>
                          <div className="text-sm text-gray-500">{file.uploadDate}</div>
                        </div>
                        
                        {/* Total Records */}
                        <div className="col-span-2 text-center">
                          <div className="text-lg font-semibold text-gray-900">
                            {file.totalRecords || 0}
                          </div>
                        </div>
                        
                        {/* Success Count */}
                        <div className="col-span-2 text-center">
                          <div className="text-lg font-semibold text-green-600">
                            {file.successCount || 0}
                          </div>
                        </div>
                        
                        {/* Failure Count */}
                        <div className="col-span-2 text-center">
                          <div className="text-lg font-semibold text-red-600">
                            {file.failureCount || 0}
                          </div>
                        </div>
                        
                        {/* Status */}
                        <div className="col-span-1 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.status)}`}>
                            {file.status || 'Unknown'}
                          </span>
                        </div>
                        
                        {/* Action Button */}
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => handleViewFileDetails(file)}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md font-medium transition-all duration-200 text-sm"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Popup Modal */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Upload Worker Payment File</h3>
                <button
                  onClick={closeUploadPopup}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File (.xlsx, .xls, .csv)
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              )}

              {uploadSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-green-700">{uploadSuccess}</p>
                  </div>
                </div>
              )}
              
              {uploadFile && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">
                    Selected: {uploadFile.name}
                  </p>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeUploadPopup}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!uploadFile || isUploading}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerFileUploadScreen;
