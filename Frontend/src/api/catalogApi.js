import { apiClient, API_ENDPOINTS } from './apiConfig';

/**
 * Service Catalog API
 * Handles fetching the service catalog with ETag caching
 */
export class CatalogApi {
  /**
   * Get service catalog with ETag support
   * @param {string|null} etag - Current ETag for conditional request
   * @returns {Promise<Object>} Catalog response with etag
   */
  static async getServiceCatalog(etag = null) {
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
        API_ENDPOINTS.META?.SERVICE_CATALOG || '/api/meta/service-catalog',
        token,
        headers
      );

      // Check if response is 304 Not Modified
      if (response.notModified) {
        return { notModified: true };
      }

      return {
        catalog: response.data || response,
        etag: response.etag || response.headers?.etag,
        notModified: false
      };
    } catch (error) {
      if (error.status === 304) {
        return { notModified: true };
      }
      throw new Error(error.message || 'Failed to fetch service catalog');
    }
  }
}

export const catalogApi = CatalogApi;
export default catalogApi;
