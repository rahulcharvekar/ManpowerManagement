/**
 * Worker API Service
 * Handles all worker-related API operations following the capability flow:
 * UI Action → Capability Check → Backend API Call
 * 
 * Maps to backend endpoints: /api/v1/worker/* and /api/worker/*
 * 
 * CAPABILITY MAPPING:
 * - WORKER.LIST        → GET /api/v1/worker/list
 * - WORKER.READ        → GET /api/v1/worker/{id}
 * - WORKER.CREATE      → POST /api/v1/worker/create
 * - WORKER.UPDATE      → PUT /api/v1/worker/{id}
 * - WORKER.DELETE      → DELETE /api/v1/worker/{id}
 * - WORKER.VALIDATE    → POST /api/worker/uploaded-data/file/{fileId}/validate
 * - WORKER.DOWNLOAD    → GET /api/v1/worker/template
 */

import { API_ENDPOINTS, apiClient } from './apiConfig';

export class WorkerApi {
  
  // ============================================================================
  // WORKER CRUD OPERATIONS
  // ============================================================================
  
  /**
   * Get list of all workers
   * Capability: WORKER.LIST
   * Endpoint: GET /api/v1/worker/list
   * 
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (0-indexed)
   * @param {number} params.size - Page size
   * @param {string} params.status - Filter by status
   * @param {string} params.search - Search term
   * @returns {Promise<Object>} Workers list with pagination
   */
  static async listWorkers(params = {}) {
    try {
      const { page = 0, size = 20, status, search } = params;
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(status && { status }),
        ...(search && { search })
      });
      
      console.log('🔍 Fetching workers list:', { page, size, status, search });
      
      const response = await apiClient.get(
        `/api/v1/worker/list?${queryParams}`,
        token
      );
      
      console.log('✅ Workers fetched successfully:', response);
      
      return {
        success: true,
        data: response.content || response.data || response,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        currentPage: response.number || page,
        pageSize: response.size || size
      };
    } catch (error) {
      console.error('❌ Error listing workers:', error);
      throw error;
    }
  }

  /**
   * Get worker by ID
   * Capability: WORKER.READ
   * Endpoint: GET /api/v1/worker/{id}
   * 
   * @param {number|string} id - Worker ID
   * @returns {Promise<Object>} Worker details
   */
  static async getWorkerById(id) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log(`🔍 Fetching worker details for ID: ${id}`);
      
      const response = await apiClient.get(`/api/v1/worker/${id}`, token);
      
      console.log('✅ Worker details fetched:', response);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error fetching worker ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new worker
   * Capability: WORKER.CREATE
   * Endpoint: POST /api/v1/worker/create
   * 
   * @param {Object} workerData - Worker information
   * @param {string} workerData.name - Worker full name
   * @param {string} workerData.email - Worker email
   * @param {string} workerData.phone - Worker phone number
   * @param {string} workerData.employeeId - Employee ID
   * @param {string} workerData.department - Department
   * @returns {Promise<Object>} Created worker data
   */
  static async createWorker(workerData) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('📝 Creating new worker:', workerData);
      
      const response = await apiClient.post(
        '/api/v1/worker/create',
        workerData,
        token
      );
      
      console.log('✅ Worker created successfully:', response);
      
      return {
        success: true,
        message: 'Worker created successfully',
        data: response
      };
    } catch (error) {
      console.error('❌ Error creating worker:', error);
      throw error;
    }
  }

  /**
   * Update worker
   * Capability: WORKER.UPDATE
   * Endpoint: PUT /api/v1/worker/{id}
   * 
   * @param {number|string} id - Worker ID
   * @param {Object} workerData - Updated worker information
   * @returns {Promise<Object>} Updated worker data
   */
  static async updateWorker(id, workerData) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log(`📝 Updating worker ${id}:`, workerData);
      
      const response = await apiClient.put(
        `/api/v1/worker/${id}`,
        workerData,
        token
      );
      
      console.log('✅ Worker updated successfully:', response);
      
      return {
        success: true,
        message: 'Worker updated successfully',
        data: response
      };
    } catch (error) {
      console.error(`❌ Error updating worker ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete worker
   * Capability: WORKER.DELETE
   * Endpoint: DELETE /api/v1/worker/{id}
   * 
   * @param {number|string} id - Worker ID
   * @returns {Promise<Object>} Success confirmation
   */
  static async deleteWorker(id) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log(`🗑️ Deleting worker ${id}`);
      
      await apiClient.delete(`/api/v1/worker/${id}`, token);
      
      console.log('✅ Worker deleted successfully');
      
      return {
        success: true,
        message: 'Worker deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting worker ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // WORKER FILE UPLOAD OPERATIONS
  // ============================================================================

  /**
   * Upload worker file (CSV, Excel)
   * Capability: WORKER.CREATE
   * Endpoint: POST /api/worker/uploaded-data/upload
   * 
   * @param {File} file - File to upload (CSV or Excel)
   * @param {Object} metadata - Additional upload metadata
   * @param {string} metadata.description - File description
   * @param {string} metadata.uploadType - Upload type/category
   * @returns {Promise<Object>} Upload result with file ID
   */
  static async uploadWorkerFile(file, metadata = {}) {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      console.log('📤 Uploading worker file:', file.name, metadata);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata if provided
      if (metadata.description) {
        formData.append('description', metadata.description);
      }
      if (metadata.uploadType) {
        formData.append('uploadType', metadata.uploadType);
      }
      
      const response = await apiClient.post(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.UPLOAD,
        formData,
        token,
        {
          'Content-Type': 'multipart/form-data'
        }
      );
      
      console.log('✅ File uploaded successfully:', response);
      
      return {
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileId: response.fileId || response.id,
          fileName: response.fileName || file.name,
          totalRecords: response.totalRecords || 0,
          uploadedAt: response.uploadedAt || new Date().toISOString(),
          status: response.status || 'UPLOADED'
        }
      };
    } catch (error) {
      console.error('❌ Error uploading worker file:', error);
      throw error;
    }
  }

  /**
   * Validate uploaded worker file
   * Capability: WORKER.VALIDATE
   * Endpoint: POST /api/worker/uploaded-data/file/{fileId}/validate
   */
  static async validateWorkerFile(fileId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.post(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.VALIDATE(fileId),
        {},
        token
      );
      
      return {
        success: true,
        message: 'File validation completed',
        data: {
          fileId,
          validRecords: response.validRecords || 0,
          invalidRecords: response.invalidRecords || 0,
          totalRecords: response.totalRecords || 0,
          errors: response.errors || [],
          warnings: response.warnings || []
        }
      };
    } catch (error) {
      console.error(`❌ Error validating file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get file summary
   * Capability: WORKER.READ
   * Endpoint: GET /api/worker/uploaded-data/file/{fileId}/summary
   */
  static async getFileSummary(fileId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.FILE_SUMMARY(fileId),
        token
      );
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error fetching file summary ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get all uploaded files summaries
   * Capability: WORKER.LIST
   * Endpoint: GET /api/worker/uploaded-data/files/summaries
   */
  static async getFilesSummaries(params = {}) {
    try {
      const { page = 0, size = 20 } = params;
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      const response = await apiClient.get(
        `${API_ENDPOINTS.WORKER_UPLOADED_DATA.FILES_SUMMARIES}?${queryParams}`,
        token
      );
      
      return {
        success: true,
        data: response.content || response.data || response,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      };
    } catch (error) {
      console.error('❌ Error fetching files summaries:', error);
      throw error;
    }
  }

  /**
   * Download worker template
   * Capability: WORKER.DOWNLOAD
   * Endpoint: GET /api/v1/worker/template
   */
  static async downloadTemplate(format = 'xlsx') {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${apiClient.baseUrl}/api/v1/worker/template?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worker_template.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return {
        success: true,
        message: 'Template downloaded successfully'
      };
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      throw error;
    }
  }

  /**
   * Delete uploaded file
   * Capability: WORKER.DELETE
   * Endpoint: DELETE /api/worker/uploaded-data/file/{fileId}
   */
  static async deleteUploadedFile(fileId) {
    try {
      const token = localStorage.getItem('authToken');
      await apiClient.delete(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.DELETE_FILE(fileId),
        token
      );
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error(`❌ Error deleting file ${fileId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // WORKER PAYMENT GENERATION
  // ============================================================================

  /**
   * Generate payment request from uploaded file
   * Capability: WORKER.GENERATE_PAYMENTS
   * Endpoint: POST /api/worker/uploaded-data/file/{fileId}/generate-request
   */
  static async generatePaymentRequest(fileId, options = {}) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.post(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.GENERATE_REQUEST(fileId),
        options,
        token
      );
      
      return {
        success: true,
        message: 'Payment request generated successfully',
        data: {
          requestId: response.requestId || response.id,
          receiptNumber: response.receiptNumber,
          totalAmount: response.totalAmount || 0,
          workersCount: response.workersCount || 0,
          status: response.status || 'GENERATED'
        }
      };
    } catch (error) {
      console.error(`❌ Error generating payment request for file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get payment requests for a file
   * Capability: WORKER.READ
   * Endpoint: GET /api/worker/uploaded-data/file/{fileId}/requests
   */
  static async getFileRequests(fileId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.REQUESTS(fileId),
        token
      );
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error fetching requests for file ${fileId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // WORKER RECEIPTS (Payment Receipts)
  // ============================================================================

  /**
   * Get all worker receipts
   * Capability: PAYMENT.LIST
   * Endpoint: GET /api/worker/receipts/all
   */
  static async getAllReceipts(params = {}) {
    try {
      const { page = 0, size = 20 } = params;
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      const response = await apiClient.get(
        `${API_ENDPOINTS.WORKER_RECEIPTS.ALL}?${queryParams}`,
        token
      );
      
      return {
        success: true,
        data: response.content || response.data || response,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      };
    } catch (error) {
      console.error('❌ Error fetching worker receipts:', error);
      throw error;
    }
  }

  /**
   * Get receipts by status
   * Capability: PAYMENT.LIST
   * Endpoint: GET /api/worker/receipts/status/{status}
   */
  static async getReceiptsByStatus(status, params = {}) {
    try {
      const { page = 0, size = 20 } = params;
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      const response = await apiClient.get(
        `${API_ENDPOINTS.WORKER_RECEIPTS.BY_STATUS(status)}?${queryParams}`,
        token
      );
      
      return {
        success: true,
        data: response.content || response.data || response,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      };
    } catch (error) {
      console.error(`❌ Error fetching receipts with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get receipt by receipt number
   * Capability: PAYMENT.READ
   * Endpoint: GET /api/worker/receipts/{receiptNumber}
   */
  static async getReceiptByNumber(receiptNumber) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(
        API_ENDPOINTS.WORKER_RECEIPTS.BY_RECEIPT_NUMBER(receiptNumber),
        token
      );
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error fetching receipt ${receiptNumber}:`, error);
      throw error;
    }
  }

  /**
   * Update receipt status
   * Capability: PAYMENT.UPDATE, PAYMENT.APPROVE, or PAYMENT.REJECT (depending on status)
   * Endpoint: PUT /api/worker/receipts/{receiptNumber}/status
   */
  static async updateReceiptStatus(receiptNumber, status, comments = '') {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.put(
        API_ENDPOINTS.WORKER_RECEIPTS.UPDATE_STATUS(receiptNumber),
        { status, comments },
        token
      );
      
      return {
        success: true,
        message: `Receipt status updated to ${status}`,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error updating receipt ${receiptNumber} status:`, error);
      throw error;
    }
  }

  // ============================================================================
  // WORKER PAYMENT DETAILS
  // ============================================================================

  /**
   * Get worker payments by uploaded file reference
   * Capability: PAYMENT.LIST
   * Endpoint: GET /api/v1/worker-payments/by-uploaded-file-ref/{ref}
   */
  static async getPaymentsByFileRef(fileRef, params = {}) {
    try {
      const { page = 0, size = 20 } = params;
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      const response = await apiClient.get(
        `${API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_UPLOADED_FILE_REF(fileRef)}?${queryParams}`,
        token
      );
      
      return {
        success: true,
        data: response.content || response.data || response,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      };
    } catch (error) {
      console.error(`❌ Error fetching payments for file ${fileRef}:`, error);
      throw error;
    }
  }

  /**
   * Get worker payment by ID
   * Capability: PAYMENT.READ
   * Endpoint: GET /api/v1/worker-payments/{id}
   */
  static async getPaymentById(id) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(
        API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_ID(id),
        token
      );
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error fetching payment ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // WORKER DATA RESULTS
  // ============================================================================

  /**
   * Get uploaded data results
   * Capability: WORKER.READ
   * Endpoint: GET /api/worker/uploaded-data/results/{fileId}
   */
  static async getUploadedDataResults(fileId, params = {}) {
    try {
      const { page = 0, size = 20 } = params;
      const token = localStorage.getItem('authToken');
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      const response = await apiClient.get(
        `${API_ENDPOINTS.WORKER_UPLOADED_DATA.RESULTS(fileId)}?${queryParams}`,
        token
      );
      
      return {
        success: true,
        data: response.content || response.data || response,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0
      };
    } catch (error) {
      console.error(`❌ Error fetching results for file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get rejected records from uploaded file
   * Capability: WORKER.READ
   * Endpoint: GET /api/worker/uploaded-data/file/{fileId}/rejected
   */
  static async getRejectedRecords(fileId) {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.REJECTED(fileId),
        token
      );
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error(`❌ Error fetching rejected records for file ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Get paginated uploaded worker data (secure)
   * Capability: WORKER.READ
   * Endpoint: POST /api/worker/uploaded-data/secure-paginated
   *
   * @param {Object} params - { startDate, endDate, page, size, sortBy, sortDir, sessionToken }
   * @returns {Promise<Object>} Paginated worker upload data
   */
  static async getUploadedDataPaginated(params = {}) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required');
      const response = await apiClient.post(
        API_ENDPOINTS.WORKER_UPLOADED_DATA.SECURE_PAGINATED,
        params,
        token
      );
      return response;
    } catch (error) {
      console.error('❌ Error fetching paginated uploaded worker data:', error);
      throw error;
    }
  }
}

export default WorkerApi;
