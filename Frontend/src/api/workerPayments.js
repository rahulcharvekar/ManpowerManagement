// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Upload file to the server
export async function uploadWorkerPaymentFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/upload`, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

// Get uploaded data with pagination (WorkerUploadedData table)
export async function getWorkerUploadedData(fileId, page = 0, size = 20, status = null) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  if (status) {
    params.append('status', status);
  }
  
  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/file/${fileId}?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch uploaded data: ${response.statusText}`);
  }

  return response.json();
}

// Get uploaded data summary (status counts)
export async function getWorkerUploadedDataSummary(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/file/${fileId}/summary`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch data summary: ${response.statusText}`);
  }

  return response.json();
}

// Get rejected records for a file
export async function getWorkerRejectedRecords(fileId, page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/file/${fileId}/rejected?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch rejected records: ${response.statusText}`);
  }

  return response.json();
}

// Get paginated file details (Legacy - for backward compatibility)
export async function getWorkerPaymentFileDetails(
  fileId, 
  page = 0, 
  size = 20
) {
  // Use the new uploaded data endpoint
  return getWorkerUploadedData(fileId, page, size);
}

// Start validation process for uploaded data (Legacy endpoint)
export async function validateWorkerUploadedData(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/file/${fileId}/validate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`);
  }

  return response.json();
}

// Start validation process for worker payment file (New endpoint)
export async function validateWorkerPaymentFileById(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/validate/${fileId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`);
  }

  return response.json();
}

// Get validation results for a file with pagination and filters
export async function getWorkerValidationResults(
  fileId, 
  page = 0, 
  size = 20, 
  sortBy = 'rowNumber', 
  sortDir = 'asc',
  status = null, 
  startDate = null, 
  endDate = null
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: sortBy,
    sortDir: sortDir
  });

  // Only add optional parameters if they are provided
  if (status) {
    params.append('status', status);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }

  const url = `${API_BASE_URL}/api/worker/uploaded-data/results/${fileId}?${params}`;
  console.log('getWorkerValidationResults URL:', url);
  console.log('getWorkerValidationResults fileId:', fileId, 'type:', typeof fileId);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  console.log('getWorkerValidationResults response status:', response.status);
  console.log('getWorkerValidationResults response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('getWorkerValidationResults error response:', errorText);
    throw new Error(`Failed to fetch validation results: ${response.statusText}`);
  }

  const jsonData = await response.json();
  console.log('getWorkerValidationResults raw JSON response:', jsonData);
  return jsonData;
}

// Get validated records ready for request generation
export async function getWorkerValidatedRecords(fileId, page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/validated-records/${fileId}?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch validated records: ${response.statusText}`);
  }

  return response.json();
}

// Validate uploaded file (Legacy - for backward compatibility)
export async function validateWorkerPaymentFile(fileId) {
  return validateWorkerUploadedData(fileId);
}

// Utility function to validate file before upload
export function validateFileBeforeUpload(file) {
  // Check file type - Support multiple MIME types for better compatibility
  const allowedTypes = [
    // Excel XLSX files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Excel XLS files (multiple possible MIME types)
    'application/vnd.ms-excel',
    'application/excel',
    'application/x-excel',
    'application/x-msexcel',
    // CSV files (multiple possible MIME types)
    'text/csv',
    'text/comma-separated-values',
    'application/csv',
    'application/excel',
    // Generic fallback
    'application/octet-stream'
  ];
  
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['xlsx', 'xls', 'csv'];

  // Validate file extension (primary check)
  if (!allowedExtensions.includes(fileExtension || '')) {
    return {
      isValid: false,
      errorMessage: 'Only Excel files (.xlsx, .xls) and CSV files (.csv) are allowed.'
    };
  }

  // Additional MIME type check (secondary check for supported browsers)
  if (file.type && !allowedTypes.includes(file.type)) {
    // Only show warning if MIME type is not empty and not in allowed list
    // But don't reject the file if extension is correct
    console.warn(`File MIME type "${file.type}" not in allowed list, but extension "${fileExtension}" is valid.`);
  }

  // Check file size (200MB = 200 * 1024 * 1024 bytes)
  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      errorMessage: `File size exceeds 200MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  // Check minimum file size (empty files)
  if (file.size === 0) {
    return {
      isValid: false,
      errorMessage: 'File is empty. Please select a valid file with data.'
    };
  }

  return { isValid: true };
}

// Generate payment request from validated data (moves data to WorkerPayment table)
export async function generateWorkerPaymentRequest(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/generate-request/${fileId}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request generation failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Generate request from uploaded data file (New endpoint)
export async function generateRequestFromUploadedData(fileId, uploadedFileRef = "string") {
  const requestBody = {
    uploadedFileRef: uploadedFileRef
  };

  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/file/${fileId}/generate-request`, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request generation failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Process uploaded data (move validated records to WorkerPayment table)
export async function processWorkerUploadedData(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/file/${fileId}/process`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Processing failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Process validated file (Legacy - for backward compatibility)
export async function processWorkerPaymentFile(fileId) {
  return generateWorkerPaymentRequest(fileId);
}

// Get all uploaded files
export async function getUploadedFiles(page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  const response = await fetch(`${API_BASE_URL}/api/uploaded-files?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch uploaded files: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get file summaries for validated files ready for request generation
export async function getWorkerFileSummaries(page = 0, size = 20, sortBy = 'uploadDate', sortDir = 'desc') {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: sortBy,
    sortDir: sortDir
  });

  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/files/summaries?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file summaries: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker file summaries with complete filter support
export async function getWorkerFileSummariesComplete(filters = {}) {
  const {
    page = 0,
    size = 20,
    sortBy = 'uploadDate',
    sortDir = 'desc',
    status,
    startDate,
    endDate
  } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: sortBy,
    sortDir: sortDir
  });

  // Add optional filters
  if (status && status !== 'ALL') {
    params.append('status', status);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }

  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/files/summaries?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker file summaries: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get uploaded files by date
export async function getUploadedFilesByDate(date) {
  console.log('getUploadedFilesByDate called with date:', date);
  
  // Validate date format (should be YYYY-MM-DD)
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, received: ${date}`);
  }
  
  const url = `${API_BASE_URL}/api/uploaded-files/by-date?singleDate=${encodeURIComponent(date)}`;
  console.log('Making API request to URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  console.log('API response status:', response.status);
  console.log('API response ok:', response.ok);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error response:', errorText);
    throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`);
  }

  const jsonData = await response.json();
  console.log('API JSON response:', jsonData);
  
  // Extract the files array from the response object
  if (jsonData && jsonData.success && Array.isArray(jsonData.files)) {
    console.log('Extracting files array:', jsonData.files);
    
    // Transform the API response to show only specified fields
    const transformedFiles = jsonData.files.map(file => ({
      fileId: file.id, // Use id as unique identifier
      fileName: file.filename,
      recordCount: file.totalRecords,
      successCount: file.successCount,
      failureCount: file.failureCount,
      uploadDate: file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : '',
      uploadedBy: file.uploadedBy,
      status: file.status
    }));
    
    console.log('Transformed files:', transformedFiles);
    return transformedFiles;
  } else {
    console.warn('Unexpected API response format:', jsonData);
    return [];
  }
}

// Get uploaded files by status
export async function getUploadedFilesByStatus(status) {
  const response = await fetch(`${API_BASE_URL}/api/uploaded-files/by-status/${status}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }

  return response.json();
}

// Get available receipts for employer (legacy - non-paginated)
export async function getAvailableReceipts() {
  const response = await fetch(`${API_BASE_URL}/api/employer/receipts/available`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch receipts: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get available receipts for employer with pagination and filters
export async function getAvailableReceiptsPaginated(filters = {}) {
  const {
    page = 0,
    size = 20,
    status,
    startDate,
    endDate,
    singleDate
  } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  if (status && status !== 'ALL') {
    params.append('status', status);
  }

  if (singleDate) {
    params.append('singleDate', singleDate);
  } else if (startDate && endDate) {
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  const url = `${API_BASE_URL}/api/employer/receipts/all?${params}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch receipts: ${response.status} ${response.statusText}`);
  }

  const jsonData = await response.json();
  return jsonData;
}

// Get worker payment receipts with pagination and filters (for Worker Payment Screen)
export async function getWorkerPaymentReceiptsPaginated(filters = {}) {
  const {
    page = 0,
    size = 20,
    status,
    startDate,
    endDate,
    singleDate
  } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  if (status && status !== 'ALL') {
    params.append('status', status);
  }

  if (singleDate) {
    params.append('singleDate', singleDate);
  } else if (startDate && endDate) {
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  // Use the employer receipts available endpoint which returns worker payment receipts
  const url = `${API_BASE_URL}/api/employer/receipts/available?${params}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch worker payment receipts: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const jsonData = await response.json();
  return jsonData;
}

// Get paginated board receipts
export async function getBoardReceiptsPaginated(filters = {}) {
  const {
    page = 0,
    size = 20,
    status,
    startDate,
    endDate,
    singleDate
  } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });

  if (status && status !== 'ALL') {
    params.append('status', status);
  }

  if (singleDate) {
    params.append('singleDate', singleDate);
  } else if (startDate && endDate) {
    params.append('startDate', startDate);
    params.append('endDate', endDate);
  }

  const url = `${API_BASE_URL}/api/v1/board-receipts/all?${params}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch board receipts: ${response.status} ${response.statusText}`);
  }

  const jsonData = await response.json();
  return jsonData;
}

// Process board receipt
export async function processBoardReceipt(receiptId, utrNumber) {
  const response = await fetch(`${API_BASE_URL}/api/v1/board-receipts/${receiptId}/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      utrNumber: utrNumber
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to process board receipt: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker payments by worker receipt number (for employer view details)
export async function getWorkerPaymentsByWorkerReceiptNumber(workerReceiptNumber, page = 0, size = 20) {
  const params = new URLSearchParams({
    receiptNumber: workerReceiptNumber,
    page: page.toString(),
    size: size.toString(),
    sortBy: 'id',
    sortDir: 'desc'
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/worker-payments?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker payments: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker payments by receipt number (with pagination)
export async function getWorkerPaymentsByRequestNumber(receiptNumber, page = 0, size = 20) {
  const params = new URLSearchParams({
    receiptNumber: receiptNumber,
    page: page.toString(),
    size: size.toString(),
    sortBy: 'id',
    sortDir: 'desc'
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/worker-payments?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker payments: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Validate worker receipt with transaction reference
export async function validateWorkerReceipt(workerReceiptNumber, transactionReference, validatedBy) {
  const requestBody = {
    workerReceiptNumber,
    transactionReference,
    validatedBy
  };

  const response = await fetch(`${API_BASE_URL}/api/employer/receipts/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`Failed to validate receipt: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get employer receipts by employer reference
export async function getEmployerReceiptsByEmpRef(empRef, page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    empRef: empRef
  });

  const response = await fetch(`${API_BASE_URL}/api/employer/receipts/all?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employer receipts: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker payments by uploaded file reference (new endpoint)
export async function getWorkerPaymentsByFileRef(uploadedFileRef, page = 0, size = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: 'id',
    sortDir: 'desc'
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/worker-payments/by-uploaded-file-ref/${uploadedFileRef}?${params}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker payments by file ref: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker file summaries with filters for card clicks
export async function getWorkerFileSummariesWithFilters(page = 0, size = 20, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: filters.sortBy || 'uploadDate',
    sortDir: filters.sortDir || 'desc'
  });

  // Add optional filters
  if (filters.fileId) {
    params.append('fileId', filters.fileId);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const response = await fetch(`${API_BASE_URL}/api/worker/uploaded-data/files/summaries?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker file summaries: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker receipts for pending requests card
export async function getWorkerReceipts(page = 0, size = 20, filters = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: filters.sortBy || 'createdAt',
    sortDir: filters.sortDir || 'desc'
  });

  // Add optional filters
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.singleDate) {
    params.append('singleDate', filters.singleDate);
  }
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }

  const response = await fetch(`${API_BASE_URL}/api/worker/receipts/all?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker receipts: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker receipts for generated requests card - only applies startDate filter
export async function getGeneratedWorkerReceipts(page = 0, size = 20, startDate) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  // Only apply startDate filter for generated requests
  if (startDate) {
    params.append('startDate', startDate);
  }

  const response = await fetch(`${API_BASE_URL}/api/worker/receipts/all?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch generated worker receipts: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Get worker payments by receipt number for payment details
export async function getWorkerPaymentsByReceiptNumber(receiptNumber, page = 0, size = 20) {
  const params = new URLSearchParams({
    receiptNumber: receiptNumber,
    page: page.toString(),
    size: size.toString(),
    sortBy: 'id',
    sortDir: 'desc'
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/worker-payments?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker payments: ${response.status} ${response.statusText}`);
  }

  const jsonData = await response.json();
  
  // The API returns Spring Boot Page format, so we need to extract the pagination info
  return {
    content: jsonData.content || [],
    totalPages: jsonData.totalPages || 0,
    totalElements: jsonData.totalElements || 0,
    number: jsonData.number || 0,
    size: jsonData.size || size,
    first: jsonData.first || false,
    last: jsonData.last || false
  };
}

// Send worker receipt to employer/bank
export async function sendWorkerReceiptToEmployer(receiptNumber) {
  const response = await fetch(`${API_BASE_URL}/api/worker/receipts/${receiptNumber}/send-to-employer`, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
    },
    body: ''
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send receipt to employer: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// Get worker payments with advanced filters for payment details view
export async function getWorkerPaymentsWithFilters(filters = {}) {
  const {
    status,
    receiptNumber,
    startDate,
    endDate,
    page = 0,
    size = 20,
    sortBy = 'id',
    sortDir = 'desc'
  } = filters;

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy: sortBy,
    sortDir: sortDir
  });

  // Add optional filters
  if (status) {
    params.append('status', status);
  }
  if (receiptNumber) {
    params.append('receiptNumber', receiptNumber);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/worker-payments?${params}`, {
    method: 'GET',
    headers: {
      'Accept': '*/*',
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch worker payments: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
