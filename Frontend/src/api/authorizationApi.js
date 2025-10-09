import { apiClient, API_ENDPOINTS } from './apiConfig';

/**
 * Authorization API Service
 * Handles capability-based authorization requests
 */
export class AuthorizationService {
  /**
   * Get user authorizations with capabilities
   * @param {string|null} etag - Current ETag for conditional request
   * @returns {Promise<Object>} Authorization response with etag
   */
  static async getAuthorizations(etag = null) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {};
      if (etag) {
        headers['If-None-Match'] = etag;
      }

      const response = await apiClient.get(
        API_ENDPOINTS.AUTH?.AUTHORIZATIONS || '/api/me/authorizations',
        token,
        headers
      );

      // Check if response is 304 Not Modified
      if (response.notModified) {
        return { notModified: true };
      }

      return {
        auth: response.data || response,
        etag: response.etag || response.headers?.etag || response.user?.etag,
        notModified: false
      };
    } catch (error) {
      if (error.status === 304) {
        return { notModified: true };
      }
      throw new Error(error.message || 'Failed to fetch authorizations');
    }
  }

  /**
   * Refresh user authorizations
   * Forces regeneration after role change
   * @returns {Promise<Object>} Fresh authorization data
   */
  static async refreshAuthorizations() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(
        API_ENDPOINTS.AUTH?.REFRESH_AUTHORIZATIONS || '/api/me/authorizations/refresh',
        token
      );

      return {
        auth: response.data || response,
        etag: response.etag || response.headers?.etag || response.user?.etag
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to refresh authorizations');
    }
  }
}

export const authorizationService = AuthorizationService;
export default authorizationService;
