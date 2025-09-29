// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Upload file to the server
export async function uploadWorkerPaymentFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

// Get paginated file details
export async function getWorkerPaymentFileDetails(
  fileId, 
  page = 0, 
  size = 20
) {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString()
  });
  
  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/validate/${fileId}/details?${params}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file details: ${response.statusText}`);
  }

  return response.json();
}

// Validate uploaded file
export async function validateWorkerPaymentFile(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/validate/${fileId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Validation failed: ${response.statusText}`);
  }

  return response.json();
}

// Utility function to validate file before upload
export function validateFileBeforeUpload(file) {
  // Check file type
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
  ];
  
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['xlsx', 'xls', 'csv'];

  if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
    return {
      isValid: false,
      errorMessage: 'Only Excel files (.xlsx, .xls) and CSV files (.csv) are allowed.'
    };
  }

  // Check file size (200MB = 200 * 1024 * 1024 bytes)
  const maxSize = 200 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      isValid: false,
      errorMessage: `File size must be less than 200MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }

  return { isValid: true };
}

// Process validated file
export async function processWorkerPaymentFile(fileId) {
  const response = await fetch(`${API_BASE_URL}/api/worker-payments/file/process/${fileId}`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Processing failed: ${response.statusText}`);
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
