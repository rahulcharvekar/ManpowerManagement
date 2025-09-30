import { useState, useEffect } from "react";
import { 
  uploadWorkerPaymentFile, 
  getWorkerPaymentFileDetails,
  validateWorkerPaymentFile, 
  processWorkerPaymentFile,
  validateFileBeforeUpload,
  getUploadedFilesByDate,
  getUploadedFilesByStatus
} from "../api/workerPayments.js";

export function WorkerDashboard({ onGoBack }) {
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
  
  // File details view state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState(null);
  
  // Pagination state for file details
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);

  // Load files by date range
  const loadFilesByDateRange = async (startDate, endDate) => {
    setIsLoadingFiles(true);
    setFilesError(null);
    
    try {
      let allFiles = [];
      
      // If start and end date are the same, use single date API
      if (startDate === endDate) {
        const files = await getUploadedFilesByDate(startDate);
        allFiles = Array.isArray(files) ? files : [];
      } else {
        // For date ranges, we'll need to call the API for each date
        // This could be optimized with a backend API that accepts date ranges
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = formatDateForAPI(d);
          try {
            const files = await getUploadedFilesByDate(dateStr);
            if (Array.isArray(files)) {
              allFiles = [...allFiles, ...files];
            }
          } catch (dateError) {
            console.warn(`Failed to fetch files for ${dateStr}:`, dateError);
          }
        }
      }
      
      setFilesList(allFiles);
    } catch (error) {
      console.error('Error loading files:', error);
      setFilesList([]);
      
      if (error?.message && !error.message.includes('fetch')) {
        setFilesError(error.message);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Apply filters to the files list
  const applyFilters = () => {
    let filtered = [...filesList];
    
    // Filter by status
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(file => 
        file.status?.toUpperCase() === filters.status.toUpperCase()
      );
    }
    
    setFilteredFilesList(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    // If date range changed, reload files
    if (filterType === 'startDate' || filterType === 'endDate') {
      loadFilesByDateRange(newFilters.startDate, newFilters.endDate);
    }
  };

  // Load files on component mount
  useEffect(() => {
    try {
      loadFilesByDateRange(filters.startDate, filters.endDate).finally(() => {
        setIsInitialized(true);
      });
    } catch (error) {
      console.error('Error in useEffect:', error);
      setFilesError('Failed to initialize component');
      setIsLoadingFiles(false);
      setIsInitialized(true);
    }
  }, []);

  // Apply filters when filesList or filters change
  useEffect(() => {
    applyFilters();
  }, [filesList, filters.status]);

  // Handle upload popup
  const openUploadPopup = () => {
    setShowUploadPopup(true);
    setUploadFile(null);
    setUploadError(null);
  };

  const closeUploadPopup = () => {
    setShowUploadPopup(false);
    setUploadFile(null);
    setUploadError(null);
  };

  // Handle file selection in popup
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFileBeforeUpload(file);
    if (!validation.isValid) {
      setUploadError(validation.errorMessage || 'Invalid file');
      return;
    }

    setUploadFile(file);
    setUploadError(null);
  };

  // Handle file upload in popup
  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await uploadWorkerPaymentFile(uploadFile);
      if (response.status === 'success') {
        // Refresh the files list with current filters
        await loadFilesByDateRange(filters.startDate, filters.endDate);
        closeUploadPopup();
        
        // Auto-select the uploaded file if we have fileId in response
        if (response.fileId) {
          // Find and select the uploaded file from the filtered list
          setTimeout(() => {
            const uploadedFile = filteredFilesList.find(f => f.fileId === response.fileId);
            if (uploadedFile) {
              handleViewFileDetails(uploadedFile);
            }
          }, 500); // Small delay to ensure file list is updated
        }
      } else {
        setUploadError(response.message || 'Upload failed');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file selection from list to view details
  const handleViewFileDetails = async (file) => {
    if (!file || !file.fileId) {
      setFilesError('Invalid file selected');
      return;
    }

    setSelectedFile(file);
    setIsLoadingDetails(true);
    setFilesError(null);
    
    // Only clear receipt number if this is a different file or file doesn't have a receipt
    if (!selectedFile || selectedFile.fileId !== file.fileId || !file.receiptNumber) {
      setReceiptNumber(file.receiptNumber || null);
    }
    
    try {
      const details = await getWorkerPaymentFileDetails(file.fileId, 0, pageSize);
      setFileDetails(details || { content: [], totalElements: 0 });
      setCurrentPage(0);
    } catch (error) {
      console.error('Error loading file details:', error);
      setFilesError(error?.message || 'Failed to load file details');
      setFileDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Go back to files list
  const handleGoBackToList = () => {
    setSelectedFile(null);
    setFileDetails(null);
    setReceiptNumber(null);
  };

  // Validate selected file
  const handleFileValidation = async () => {
    if (!selectedFile) {
      return;
    }

    setIsValidating(true);
    setFilesError(null);

    try {
      const validationResponse = await validateWorkerPaymentFile(selectedFile.fileId);
      
      // Update file status based on backend response
      if (validationResponse?.status) {
        const updatedFile = {
          ...selectedFile,
          status: validationResponse.status,
          nextAction: validationResponse.nextAction,
          validationMessage: validationResponse.message,
          passedCount: validationResponse.passed,
          failedCount: validationResponse.failed
        };
        
        setSelectedFile(updatedFile);
        
        // Refresh file details to show updated validation results
        try {
          const details = await getWorkerPaymentFileDetails(updatedFile.fileId, 0, pageSize);
          setFileDetails(details || { content: [], totalElements: 0 });
          setCurrentPage(0);
        } catch (detailsError) {
          console.error('Error refreshing file details:', detailsError);
        }
        
        // Also refresh the files list to update the main view
        await loadFilesByDateRange(filters.startDate, filters.endDate);
      }
    } catch (error) {
      setFilesError(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Generate receipt for validated file
  const handleReceiptGeneration = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setFilesError(null);

    try {
      const response = await processWorkerPaymentFile(selectedFile.fileId);
      
      // Store receipt number from API response
      if (response && response.receiptNumber) {
        setReceiptNumber(response.receiptNumber);
      } else if (response && (response.success === true || response.status === 'success')) {
        setReceiptNumber('Generated successfully');
      } else {
        throw new Error('Receipt generation failed - no receipt number or success indicator in response');
      }
      
      // Clear nextAction as processing is complete
      const updatedFile = {
        ...selectedFile,
        nextAction: null, // Clear the nextAction so no more buttons show
        status: 'PROCESSED' // Update status to processed
      };
      setSelectedFile(updatedFile);
      
      // Refresh file details to show updated status
      try {
        const details = await getWorkerPaymentFileDetails(updatedFile.fileId, 0, pageSize);
        setFileDetails(details || { content: [], totalElements: 0 });
        setCurrentPage(0);
      } catch (detailsError) {
        console.error('Error refreshing file details:', detailsError);
      }
      
      // Refresh files list to update main view
      await loadFilesByDateRange(filters.startDate, filters.endDate);
    } catch (error) {
      console.error('Error in receipt generation:', error);
      
      // Provide more specific error messages
      let userMessage = 'Receipt generation failed: ';
      if (error.message && error.message.includes('Data truncated for column')) {
        userMessage += 'Database configuration issue. Please contact administrator.';
      } else if (error.message && error.message.includes('Processing failed')) {
        userMessage += 'Server processing error. Please try again or contact support.';
      } else {
        userMessage += error.message || 'Unknown error occurred.';
      }
      
      setFilesError(userMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle page change for file details
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (selectedFile) {
      handleViewFileDetails({ ...selectedFile, page });
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

  const showGenerateReceiptButton = () => {
    return selectedFile?.nextAction === 'GENERATE_RECEIPT';
  };

  // Show loading screen during initial component setup
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onGoBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {selectedFile ? 'File Details' : 'Worker Dashboard'}
                </h1>
                <p className="text-blue-100">
                  {selectedFile 
                    ? `File: ${selectedFile.fileName}` 
                    : filters.startDate === filters.endDate 
                      ? `Files for ${filters.startDate}`
                      : `Files from ${filters.startDate} to ${filters.endDate}`
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload File
                </button>
              )}
              
              {selectedFile && (
                <button
                  onClick={handleGoBackToList}
                  className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to List
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
                  <h3 className="text-lg font-semibold text-gray-800">{selectedFile.fileName}</h3>
                  <p className="text-gray-600">Uploaded on {selectedFile.uploadDate}</p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedFile.status)}`}>
                  {selectedFile.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.recordCount}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.successCount}</div>
                  <div className="text-sm text-gray-600">Success Count</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.failureCount}</div>
                  <div className="text-sm text-gray-600">Failure Count</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.fileId}</div>
                  <div className="text-sm text-gray-600">File ID</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.uploadDate}</div>
                  <div className="text-sm text-gray-600">Upload Date</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-800">{selectedFile.uploadedBy || 'System'}</div>
                  <div className="text-sm text-gray-600">Uploaded By</div>
                </div>
                
                {/* Validation Success Message */}
                {selectedFile.validationMessage && selectedFile.nextAction === 'GENERATE_RECEIPT' && (
                  <div className="col-span-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-blue-800">{selectedFile.validationMessage}</div>
                          {selectedFile.passedCount !== undefined && (
                            <div className="text-xs text-blue-600 mt-1">
                              Passed: {selectedFile.passedCount}, Failed: {selectedFile.failedCount || 0}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {receiptNumber && (
                  <div className="col-span-full">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="text-lg font-semibold text-green-800">{receiptNumber}</div>
                          <div className="text-sm text-green-600">Receipt Number Generated</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-green-700">
                        Processing completed successfully • {selectedFile.recordCount} records processed
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Records Table */}
            {isLoadingDetails ? (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading file details...</p>
              </div>
            ) : fileDetails ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        All Records ({fileDetails?.totalElements || 0} records)
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        File records and validation status
                      </p>
                    </div>

                    {/* Receipt Number Display in Grid Header */}
                    {receiptNumber && receiptNumber !== 'Generated successfully' && (
                      <div className="bg-green-100 border border-green-300 rounded-lg px-4 py-2">
                        <div className="text-sm font-medium text-green-800">Receipt Number</div>
                        <div className="text-lg font-bold text-green-900">{receiptNumber}</div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {/* Show Start Validation button for UPLOADED files */}
                      {showStartValidationButton() && (
                        <button
                          onClick={handleFileValidation}
                          disabled={isValidating}
                          className="btn-primary flex items-center gap-2"
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
                      
                      {/* Show Generate Receipt button when nextAction is GENERATE_RECEIPT */}
                      {showGenerateReceiptButton() && (
                        <button
                          onClick={handleReceiptGeneration}
                          disabled={isProcessing}
                          className="btn-success flex items-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Generate Receipt
                            </>
                          )}
                        </button>
                      )}

                      {/* Show completion message when processing is done */}
                      {selectedFile?.status?.toUpperCase() === 'PROCESSED' && receiptNumber && (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">Processing Complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Worker Ref
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toli
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PAN
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Validation
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(fileDetails?.content || []).map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{record.workerRef}</div>
                              <div className="text-xs text-gray-500">Bank: {record.bankAccount}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{record.name}</div>
                              <div className="text-xs text-gray-500">Aadhar: {record.aadhar}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">₹{record.paymentAmount?.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-500">Ref: {record.requestRefNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.toli}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.pan || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              record.validationStatus === 'Pending validation'
                                ? 'bg-yellow-100 text-yellow-800'
                                : record.validationStatus === 'Validated'
                                ? 'bg-green-100 text-green-800'
                                : record.validationStatus === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {record.validationStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Files List View */
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range Filter */}
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
                {/* Status Filter */}
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

            {/* Uploaded Files Grid */}
            {isLoadingFiles ? (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading files...</p>
              </div>
            ) : filesError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-red-800">Error loading files</p>
                    <p className="text-sm text-red-600">{filesError}</p>
                  </div>
                </div>
              </div>
            ) : filteredFilesList.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No files found</h3>
                <p className="text-gray-600 mb-6">
                  No files match the selected filters. Try adjusting the date range or status filter.
                </p>
                <button
                  onClick={openUploadPopup}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload First File
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Uploaded Files ({filteredFilesList.length} files)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {filters.startDate === filters.endDate 
                      ? `Files uploaded on ${filters.startDate}`
                      : `Files from ${filters.startDate} to ${filters.endDate}`}
                    {filters.status !== 'ALL' && ` • Status: ${filters.status}`}
                  </p>
                </div>

                {/* Compact Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Filename
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Rec
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Success
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredFilesList.map((file, index) => {
                        // Defensive check for file object
                        if (!file || typeof file !== 'object') {
                          return null;
                        }
                        
                        return (
                          <tr key={file.fileId || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {file.fileName || 'Unknown File'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ID: {file.fileId} • {file.uploadDate}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {file.recordCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                              {file.successCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                              {file.failureCount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {file.uploadedBy || 'System'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.status)}`}>
                                {file.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                onClick={() => handleViewFileDetails(file)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Popup */}
      {showUploadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Upload File</h3>
              <button
                onClick={closeUploadPopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <input
                id="popup-file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div
                onClick={() => document.getElementById('popup-file-input')?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              >
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-gray-700 font-medium mb-2">
                  Click to select file
                </div>
                <div className="text-sm text-gray-500">
                  Supports: .xlsx, .xls, .csv files
                </div>
              </div>
            </div>

            {/* Selected File */}
            {uploadFile && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{uploadFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadFile(null)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{uploadError}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeUploadPopup}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!uploadFile || isUploading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload File'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
