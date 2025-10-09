// Unified API Configuration - Aligned with Spring Boot PaymentReconciliation Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API Endpoints Configuration - Matches Spring Boot Controllers
export const API_ENDPOINTS = {
  // Authentication endpoints - AuthController (/api/auth)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
    UI_CONFIG: '/api/auth/ui-config',
    USERS: '/api/auth/users', // Admin only
    AUTHORIZATIONS: '/api/me/authorizations', // New capability-based endpoint
    REFRESH_AUTHORIZATIONS: '/api/me/authorizations/refresh', // Force refresh
  },

  // Service Catalog endpoints - Capability system
  META: {
    SERVICE_CATALOG: '/api/meta/service-catalog',
  },

  // Component-based Permission endpoints - ComponentPermissionController (/api/components)
  COMPONENTS: {
    UI_CONFIG: '/api/components/ui-config',
    CHECK_PERMISSION: '/api/components/check-permission',
    CHECK_ACCESS: '/api/components/check-access',
    ACTIONS: '/api/components/actions',
  },

  // Worker Payments V1 API - WorkerPaymentController (/api/v1/worker-payments)
  WORKER_PAYMENTS_V1: {
    BASE: '/api/v1/worker-payments',
    BY_ID: (id) => `/api/v1/worker-payments/${id}`,
    BY_UPLOADED_FILE_REF: (ref) => `/api/v1/worker-payments/by-uploaded-file-ref/${ref}`,
    BY_REFERENCE_PREFIX: '/api/v1/worker-payments/by-reference-prefix',
    PAGINATION_SESSION: '/api/v1/worker-payments/pagination-session',
    BY_SESSION: '/api/v1/worker-payments/by-session',
  },

  // Worker Uploaded Data - WorkerUploadedDataController (/api/worker/uploaded-data)
  WORKER_UPLOADED_DATA: {
    UPLOAD: '/api/worker/uploaded-data/upload',
    SECURE_PAGINATED: '/api/worker/uploaded-data/secure-paginated',
    FILE_SUMMARY: (fileId) => `/api/worker/uploaded-data/file/${fileId}/summary`,
    FILES_SUMMARIES: '/api/worker/uploaded-data/files/summaries',
    VALIDATE: (fileId) => `/api/worker/uploaded-data/file/${fileId}/validate`,
    RESULTS: (fileId) => `/api/worker/uploaded-data/results/${fileId}`,
    RESULTS_BY_SESSION: (fileId) => `/api/worker/uploaded-data/results/${fileId}/by-session`,
    GENERATE_REQUEST: (fileId) => `/api/worker/uploaded-data/file/${fileId}/generate-request`,
    REJECTED: (fileId) => `/api/worker/uploaded-data/file/${fileId}/rejected`,
    DELETE_FILE: (fileId) => `/api/worker/uploaded-data/file/${fileId}`,
    REQUESTS: (fileId) => `/api/worker/uploaded-data/file/${fileId}/requests`,
    BY_RECEIPT: (receiptNumber) => `/api/worker/uploaded-data/receipt/${receiptNumber}`,
    PAGINATION_SESSION: (fileId) => `/api/worker/uploaded-data/file/${fileId}/pagination-session`,
  },

  // Worker Payment Receipts - WorkerPaymentReceiptController (/api/worker/receipts)
  WORKER_RECEIPTS: {
    ALL: '/api/worker/receipts/all',
    BY_STATUS: (status) => `/api/worker/receipts/status/${status}`,
    BY_RECEIPT_NUMBER: (receiptNumber) => `/api/worker/receipts/${receiptNumber}`,
    UPDATE_STATUS: (receiptNumber) => `/api/worker/receipts/${receiptNumber}/status`,
    PAGINATION_SESSION: '/api/worker/receipts/pagination-session',
    BY_SESSION: '/api/worker/receipts/by-session',
  },

  // Board Receipts - BoardReceiptController (/api/v1/board-receipts)
  BOARD_RECEIPTS: {
    BASE: '/api/v1/board-receipts',
    ALL: '/api/v1/board-receipts/all',
    BY_ID: (id) => `/api/v1/board-receipts/${id}`,
    BY_BOARD_REF: (boardRef) => `/api/v1/board-receipts/board-ref/${boardRef}`,
    BY_EMPLOYER_REF: (employerRef) => `/api/v1/board-receipts/employer-ref/${employerRef}`,
    BY_STATUS: (status) => `/api/v1/board-receipts/status/${status}`,
    PROCESS: '/api/v1/board-receipts/process',
    PAGINATION_SESSION: '/api/v1/board-receipts/pagination-session',
    BY_SESSION: '/api/v1/board-receipts/by-session',
    UPDATE: (id) => `/api/v1/board-receipts/${id}`,
    DELETE: (id) => `/api/v1/board-receipts/${id}`,
  },

  // Employer Payment Receipts - EmployerPaymentReceiptController (/api/employer/receipts)
  EMPLOYER_RECEIPTS: {
    AVAILABLE: '/api/employer/receipts/available',
    VALIDATE: '/api/employer/receipts/validate',
    VALIDATED: '/api/employer/receipts/validated',
    ALL: '/api/employer/receipts/all',
    BY_WORKER_RECEIPT: (workerReceiptNumber) => `/api/employer/receipts/worker/${workerReceiptNumber}`,
    PAGINATION_SESSION: '/api/employer/receipts/pagination-session',
    BY_SESSION: '/api/employer/receipts/by-session',
  },
};

// Request Configuration Helper
export class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.etagCache = new Map(); // Cache for ETags
  }

  // Create headers with authentication and ETag support
  createHeaders(token = null, contentType = 'application/json', etag = null) {
    const headers = {
      'Accept': 'application/json',
    };

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Add If-None-Match header for ETag caching
    if (etag) {
      headers['If-None-Match'] = etag;
    }

    return headers;
  }

  // Generic GET request with ETag caching support
  async get(endpoint, token = null, params = null, useCache = false) {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams}`;
    }

    // Get cached ETag if caching is enabled
    const cachedEtag = useCache ? this.etagCache.get(endpoint) : null;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.createHeaders(token, 'application/json', cachedEtag?.etag),
    });

    // Handle 304 Not Modified - return cached data
    if (response.status === 304 && cachedEtag) {
      console.log(`✅ Using cached data for ${endpoint} (304 Not Modified)`);
      return cachedEtag.data;
    }

    const data = await this.handleResponse(response);
    
    // Cache the ETag if present
    if (useCache && response.headers.has('ETag')) {
      const etag = response.headers.get('ETag');
      this.etagCache.set(endpoint, { etag, data });
      console.log(`✅ Cached ETag for ${endpoint}: ${etag}`);
    }
    
    return data;
  }

  // Generic POST request
  async post(endpoint, data = null, token = null, contentType = 'application/json') {
    const headers = this.createHeaders(token, contentType);
    
    let body = null;
    if (data) {
      body = contentType === 'application/json' ? JSON.stringify(data) : data;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body,
    });

    return this.handleResponse(response);
  }

  // Generic PUT request
  async put(endpoint, data, token = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.createHeaders(token),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  // Generic DELETE request
  async delete(endpoint, token = null) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.createHeaders(token),
    });

    return this.handleResponse(response);
  }
  
  // Clear ETag cache for a specific endpoint or all endpoints
  clearCache(endpoint = null) {
    if (endpoint) {
      this.etagCache.delete(endpoint);
      console.log(`✅ Cleared cache for ${endpoint}`);
    } else {
      this.etagCache.clear();
      console.log('✅ Cleared all cache');
    }
  }

  // Handle response and errors consistently
  async handleResponse(response) {
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }
      
      throw new Error(errorData.error || errorData.message || `Request failed: ${response.statusText}`);
    }

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Common validation helpers
export const ValidationUtils = {
  // Validate mandatory date range (required by Spring Boot for security)
  validateDateRange(startDate, endDate = null) {
    if (!startDate) {
      throw new Error('startDate is mandatory for security reasons');
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new Error('Invalid startDate format. Use YYYY-MM-DD');
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new Error('Invalid endDate format. Use YYYY-MM-DD');
      }
      
      if (end < start) {
        throw new Error('endDate must be after startDate');
      }
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : null
    };
  },

  // Validate pagination parameters
  validatePagination(page = 0, size = 20) {
    const pageNum = parseInt(page);
    const sizeNum = parseInt(size);

    if (pageNum < 0) {
      throw new Error('Page number must be >= 0');
    }

    if (sizeNum < 1 || sizeNum > 1000) {
      throw new Error('Page size must be between 1 and 1000');
    }

    return { page: pageNum, size: sizeNum };
  }
};

// Export configuration
export { API_BASE_URL };
