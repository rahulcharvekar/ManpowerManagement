import { apiClient, API_ENDPOINTS } from './apiConfig';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  /**
   * Login user with credentials
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response with token and user info
   */
  static async login(credentials) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        username: credentials.username.trim(),
        password: credentials.password
      });

      // Backend returns: { token, type, id, username, email, fullName, role }
      // Ensure we have the expected structure
      if (!response.token) {
        throw new Error('No authentication token received from server');
      }

      return {
        token: response.token,
        type: response.type || 'Bearer',
        user: {
          id: response.id,
          username: response.username,
          email: response.email,
          fullName: response.fullName,
          role: response.role // Note: backend sends singular 'role'
        }
      };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  static async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Get current user information with authorizations
   * Uses ETag caching for better performance
   * @param {boolean} useCache - Whether to use ETag caching (default: true)
   * @returns {Promise<Object>} Current user data with capabilities and permissions
   */
  static async getCurrentUser(useCache = true) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use /api/me/authorizations to get user info with capabilities
      // Enable ETag caching for better performance
      const response = await apiClient.get(API_ENDPOINTS.AUTH.AUTHORIZATIONS, token, null, useCache);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user information');
    }
  }

  /**
   * Refresh user authorizations (force refresh from backend, bypass cache)
   * @returns {Promise<Object>} Updated user data with fresh capabilities and permissions
   */
  static async refreshAuthorizations() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Try the dedicated refresh endpoint first
      try {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.REFRESH_AUTHORIZATIONS, token, null, false);
        // Clear cache after refresh
        apiClient.clearCache(API_ENDPOINTS.AUTH.AUTHORIZATIONS);
        return response;
      } catch (refreshError) {
        // Fallback: clear cache and call regular authorizations endpoint
        console.warn('Refresh endpoint not available, using regular authorizations with cache bypass:', refreshError);
        apiClient.clearCache(API_ENDPOINTS.AUTH.AUTHORIZATIONS);
        const response = await apiClient.get(API_ENDPOINTS.AUTH.AUTHORIZATIONS, token, null, false);
        return response;
      }
    } catch (error) {
      throw new Error(error.message || 'Failed to refresh authorizations');
    }
  }

  /**
   * Get UI configuration and permissions for the current user
   * @returns {Promise<Object>} UI configuration with permissions and navigation
   */
  static async getUIConfig() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.UI_CONFIG, token);
      
      // Backend returns: { userId, username, fullName, roles[], permissions[], uiConfig, navigation }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get UI configuration');
    }
  }

  /**
   * Get all users (Admin only)
   * @returns {Promise<Array>} List of users
   */
  static async getAllUsers() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.USERS, token);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get users');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  static isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Get stored authentication token
   * @returns {string|null} JWT token or null
   */
  static getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Get stored user information
   * @returns {Object|null} User object or null
   */
  static getStoredUser() {
    try {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Error parsing stored user info:', error);
      return null;
    }
  }

  /**
   * Clear authentication data from local storage
   */
  static clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    // Clear API cache
    apiClient.clearCache();
  }

  /**
   * Get service catalog with endpoint mappings
   * Uses ETag caching for better performance
   * @param {boolean} useCache - Whether to use ETag caching (default: true)
   * @returns {Promise<Object>} Service catalog with endpoint policies
   */
  static async getServiceCatalog(useCache = true) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(API_ENDPOINTS.META.SERVICE_CATALOG, token, null, useCache);
      return response;
    } catch (error) {
      // Service catalog is optional, don't throw error
      console.warn('Service catalog not available:', error);
      return null;
    }
  }

  /**
   * Validate token format (basic client-side validation)
   * @param {string} token - JWT token
   * @returns {boolean} Whether token format is valid
   */
  static validateTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT tokens should have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3;
  }
}

export default AuthService;
