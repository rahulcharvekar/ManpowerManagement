// Common API service utilities
import { API_ENDPOINTS, apiClient, ValidationUtils } from './apiConfig';

export class ApiService {
  // Authentication services
  static async login(username, password) {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password
    });
    
    const token = response.token || response.accessToken;
    if (!token) {
      throw new Error('No token received from server');
    }
    
    localStorage.setItem('authToken', token);
    if (response.user) {
      localStorage.setItem('userInfo', JSON.stringify(response.user));
    }
    
    return { token, user: response.user };
  }

  static async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await apiClient.get(API_ENDPOINTS.AUTH.ME, token);
  }

  static async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    // Could call logout endpoint if available
  }

  // Permission services
  static async getUIConfig() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await apiClient.get(API_ENDPOINTS.COMPONENTS.UI_CONFIG, token);
  }

  static async checkPermission(componentId, action) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await apiClient.post(
      API_ENDPOINTS.COMPONENTS.CHECK_PERMISSION,
      { componentId, action },
      token
    );
  }

  // User management services
  static async getUsers() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await apiClient.get(API_ENDPOINTS.AUTH.USERS, token);
  }

  static async createUser(userData) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData, token);
  }

  // Worker payment services
  static async getWorkerPayments(options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const {
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate = new Date().toISOString().split('T')[0],
      page = 0,
      size = 20
    } = options;

    // Validate inputs
    const dateRange = ValidationUtils.validateDateRange(startDate, endDate);
    const pagination = ValidationUtils.validatePagination(page, size);

    // Create pagination session
    const sessionResponse = await apiClient.post(
      API_ENDPOINTS.WORKER_PAYMENTS_V1.PAGINATION_SESSION,
      {
        ...dateRange,
        ...pagination
      },
      token
    );

    // Get payments by session
    const paymentsResponse = await apiClient.get(
      `${API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_SESSION}?sessionId=${sessionResponse.sessionId}&page=${page}&size=${size}`,
      token
    );

    return {
      ...paymentsResponse,
      sessionId: sessionResponse.sessionId
    };
  }

  static async updateWorkerPaymentStatus(paymentId, status) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    return await apiClient.put(
      API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_ID(paymentId),
      { status },
      token
    );
  }

  // Worker uploaded data services
  static async uploadWorkerData(file) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post(
      API_ENDPOINTS.WORKER_UPLOADED_DATA.UPLOAD,
      formData,
      token,
      'multipart/form-data'
    );
  }

  static async getUploadedDataSummary(fileId) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return await apiClient.get(
      API_ENDPOINTS.WORKER_UPLOADED_DATA.FILE_SUMMARY(fileId),
      token
    );
  }

  static async validateUploadedData(fileId) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return await apiClient.post(
      API_ENDPOINTS.WORKER_UPLOADED_DATA.VALIDATE(fileId),
      {},
      token
    );
  }

  // Worker receipts services
  static async getWorkerReceipts(options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const { status, page = 0, size = 20 } = options;
    const pagination = ValidationUtils.validatePagination(page, size);

    if (status) {
      return await apiClient.get(
        `${API_ENDPOINTS.WORKER_RECEIPTS.BY_STATUS(status)}?page=${page}&size=${size}`,
        token
      );
    }

    return await apiClient.get(
      `${API_ENDPOINTS.WORKER_RECEIPTS.ALL}?page=${page}&size=${size}`,
      token
    );
  }

  static async updateWorkerReceiptStatus(receiptNumber, status) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return await apiClient.put(
      API_ENDPOINTS.WORKER_RECEIPTS.UPDATE_STATUS(receiptNumber),
      { status },
      token
    );
  }

  // Board receipts services
  static async getBoardReceipts(options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const { status, boardRef, employerRef, page = 0, size = 20 } = options;
    const pagination = ValidationUtils.validatePagination(page, size);

    if (status) {
      return await apiClient.get(
        `${API_ENDPOINTS.BOARD_RECEIPTS.BY_STATUS(status)}?page=${page}&size=${size}`,
        token
      );
    }

    if (boardRef) {
      return await apiClient.get(
        API_ENDPOINTS.BOARD_RECEIPTS.BY_BOARD_REF(boardRef),
        token
      );
    }

    if (employerRef) {
      return await apiClient.get(
        API_ENDPOINTS.BOARD_RECEIPTS.BY_EMPLOYER_REF(employerRef),
        token
      );
    }

    return await apiClient.get(
      `${API_ENDPOINTS.BOARD_RECEIPTS.ALL}?page=${page}&size=${size}`,
      token
    );
  }

  // Employer receipts services
  static async getEmployerReceipts(options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const { type = 'available', workerReceiptNumber, page = 0, size = 20 } = options;

    if (workerReceiptNumber) {
      return await apiClient.get(
        API_ENDPOINTS.EMPLOYER_RECEIPTS.BY_WORKER_RECEIPT(workerReceiptNumber),
        token
      );
    }

    switch (type) {
      case 'available':
        return await apiClient.get(
          `${API_ENDPOINTS.EMPLOYER_RECEIPTS.AVAILABLE}?page=${page}&size=${size}`,
          token
        );
      case 'validated':
        return await apiClient.get(
          `${API_ENDPOINTS.EMPLOYER_RECEIPTS.VALIDATED}?page=${page}&size=${size}`,
          token
        );
      default:
        return await apiClient.get(
          `${API_ENDPOINTS.EMPLOYER_RECEIPTS.ALL}?page=${page}&size=${size}`,
          token
        );
    }
  }

  static async validateEmployerReceipts(receiptIds) {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    return await apiClient.post(
      API_ENDPOINTS.EMPLOYER_RECEIPTS.VALIDATE,
      { receiptIds },
      token
    );
  }

  // Generic error handler
  static handleApiError(error) {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      return;
    }

    return error.message || 'An unexpected error occurred';
  }
}

export default ApiService;
