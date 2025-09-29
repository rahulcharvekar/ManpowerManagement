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
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [filesError, setFilesError] = useState(null);
  const [currentDate, setCurrentDate] = useState(formatDateForAPI(new Date()));
  
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

  // Load files by date
  const loadFilesByDate = async (date) => {
    setIsLoadingFiles(true);
    setFilesError(null);
    
    // Ensure date is in correct YYYY-MM-DD format
    const formattedDate = formatDateForAPI(date);
    
    try {
      // Try to fetch from API, fallback to empty array if API is not available
      console.log('Fetching files for date:', formattedDate);
      const files = await getUploadedFilesByDate(formattedDate);
      console.log('Files received:', files);
      
      setFilesList(Array.isArray(files) ? files : []);
    } catch (error) {
      console.error('Error loading files:', error);
      
      // If API is not available, set empty state instead of error
      setFilesList([]);
      
      // Only show error if it's not a network/connection issue
      if (error?.message && !error.message.includes('fetch')) {
        setFilesError(error.message);
      }
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Load files on component mount and date change
  useEffect(() => {
    // Add error boundary for useEffect
    try {
      loadFilesByDate(currentDate).finally(() => {
        setIsInitialized(true);
      });
    } catch (error) {
      console.error('Error in useEffect:', error);
      setFilesError('Failed to initialize component');
      setIsLoadingFiles(false);
      setIsInitialized(true);
    }
  }, [currentDate]);

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
        // Refresh the files list
        await loadFilesByDate(currentDate);
        closeUploadPopup();
        
        // Auto-select the uploaded file if we have fileId in response
        if (response.fileId) {
          // Find and select the uploaded file
          setTimeout(async () => {
            const files = await getUploadedFilesByDate(formatDateForAPI(currentDate));
            const uploadedFile = files.find(f => f.id === response.fileId);
            if (uploadedFile) {
              await handleViewFileDetails(uploadedFile);
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
    setReceiptNumber(null); // Clear previous receipt number
    
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
    if (!selectedFile) return;

    setIsValidating(true);
    setFilesError(null);

    try {
      await validateWorkerPaymentFile(selectedFile.fileId);
      
      // Refresh files list first to get updated status
      await loadFilesByDate(currentDate);
      
      // Update selected file with new status
      const updatedFiles = await getUploadedFilesByDate(formatDateForAPI(currentDate));
      const updatedFile = updatedFiles.find(f => f.fileId === selectedFile.fileId);
      
      if (updatedFile) {
        setSelectedFile(updatedFile);
        // Refresh file details with updated file
        await handleViewFileDetails(updatedFile);
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
      if (response.receiptNumber) {
        setReceiptNumber(response.receiptNumber);
      }
      
      // Refresh files list first to get updated status
      await loadFilesByDate(currentDate);
      
      // Update selected file with new status
      const updatedFiles = await getUploadedFilesByDate(formatDateForAPI(currentDate));
      const updatedFile = updatedFiles.find(f => f.fileId === selectedFile.fileId);
      
      if (updatedFile) {
        setSelectedFile(updatedFile);
        // Don't call handleViewFileDetails as it clears receiptNumber
        // Just refresh the file details directly
        try {
          const details = await getWorkerPaymentFileDetails(updatedFile.fileId, 0, pageSize);
          setFileDetails(details || { content: [], totalElements: 0 });
          setCurrentPage(0);
        } catch (detailsError) {
          console.error('Error refreshing file details:', detailsError);
        }
      }
    } catch (error) {
      setFilesError(error.message);
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
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedFile ? 'File Details' : 'Worker Payment Files'}
                </h1>
                <p className="text-sm text-gray-600">
                  {selectedFile ? `File: ${selectedFile.fileName}` : `Files for ${currentDate}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!selectedFile && (
                <button
                  onClick={openUploadPopup}
                  className="btn-primary flex items-center gap-2"
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
                  className="btn-secondary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to List
                </button>
              )}

              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700">Worker</span>
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
                    
                    <div className="flex items-center gap-3">
                      {selectedFile.status === 'UPLOADED' && (
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
                      
                      {selectedFile.status === 'VALIDATED' && (
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
            {/* Date Selection */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
                  <p className="text-gray-600">View files uploaded on a specific date</p>
                </div>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => {
                    const newDate = formatDateForAPI(e.target.value);
                    console.log('Date changed to:', newDate); // Debug log
                    setCurrentDate(newDate);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Files List */}
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
            ) : filesList.length === 0 ? (
              <div className="bg-white rounded-xl p-12 shadow-lg text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No files found</h3>
                <p className="text-gray-600 mb-6">No files were uploaded on {currentDate}</p>
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
                    Uploaded Files ({filesList.length} files)
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Files uploaded on {currentDate}</p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {(filesList || []).map((file, index) => {
                    // Defensive check for file object
                    if (!file || typeof file !== 'object') {
                      return null;
                    }
                    
                    return (
                      <div key={file.fileId || index} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-800">{file.fileName || 'Unknown File'}</h4>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(file.status)}`}>
                                {file.status || 'Unknown'}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Total Records:</span> {file.recordCount || 0}
                              </div>
                              <div>
                                <span className="font-medium">Success Count:</span> {file.successCount || 0}
                              </div>
                              <div>
                                <span className="font-medium">Failure Count:</span> {file.failureCount || 0}
                              </div>
                              <div>
                                <span className="font-medium">File ID:</span> {file.fileId || '-'}
                              </div>
                              <div>
                                <span className="font-medium">Upload Date:</span> {file.uploadDate || '-'}
                              </div>
                              <div>
                                <span className="font-medium">Uploaded By:</span> {file.uploadedBy || 'System'}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleViewFileDetails(file)}
                            className="ml-4 btn-secondary flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
