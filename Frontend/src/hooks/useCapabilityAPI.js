import { useCatalog } from '../contexts/CatalogContext';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';
import { apiClient } from '../api/apiConfig';

/**
 * useCapabilityAPI - Hook for making API calls using capabilities and policies
 * Resolves endpoints from the service catalog and checks capabilities
 */
export const useCapabilityAPI = () => {
  const { resolveEndpoint } = useCatalog();
  const { can } = useEnhancedAuth();

  /**
   * Make an API call using capability and policy
   * @param {Object} options - Request options
   * @param {string} options.capability - Required capability
   * @param {string} options.policy - Policy name to resolve endpoint
   * @param {Object} options.data - Request body data
   * @param {Object} options.params - URL parameters for path templating
   * @returns {Promise<any>} API response
   */
  const call = async ({ capability, policy, data = null, params = {} }) => {
    // Check capability
    if (!can(capability)) {
      throw new Error(`Missing capability: ${capability}`);
    }

    // Resolve endpoint
    const endpoint = resolveEndpoint(policy);
    if (!endpoint) {
      throw new Error(`Could not resolve endpoint for policy: ${policy}`);
    }

    // Replace path parameters
    let path = endpoint.path;
    Object.keys(params).forEach(key => {
      path = path.replace(`{${key}}`, params[key]);
    });

    // Get token
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Make the request
    const method = endpoint.method.toLowerCase();
    
    try {
      let response;
      switch (method) {
        case 'get':
          response = await apiClient.get(path, token);
          break;
        case 'post':
          response = await apiClient.post(path, data, token);
          break;
        case 'put':
          response = await apiClient.put(path, data, token);
          break;
        case 'delete':
          response = await apiClient.delete(path, token);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return { call };
};

export default useCapabilityAPI;
