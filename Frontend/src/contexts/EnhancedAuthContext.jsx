import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../api/auth';
import authorizationService from '../api/authorizationApi';

const EnhancedAuthContext = createContext();

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null); // New capability-based auth
  const [uiConfig, setUIConfig] = useState(null); // Legacy UI config
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authEtag, setAuthEtag] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Try to load from cache first
      const cachedAuth = getCachedAuth();
      if (cachedAuth) {
        setAuth(cachedAuth.auth);
        setUser(cachedAuth.auth.user);
        setAuthEtag(cachedAuth.etag);
        setIsAuthenticated(true);
        setLoading(false);

        // Validate cache in background
        validateAuthCache(cachedAuth.etag);
        return;
      }

      // Fetch fresh data
      await loadAuthorizations();
      
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const validateAuthCache = async (currentEtag) => {
    try {
      const response = await authorizationService.getAuthorizations(currentEtag);
      
      if (!response.notModified) {
        // Cache is stale, update it
        setAuth(response.auth);
        setUser(response.auth.user);
        setAuthEtag(response.etag);
        cacheAuth(response.auth, response.etag);
      }
    } catch (err) {
      console.warn('Auth cache validation failed:', err);
    }
  };

  const loadAuthorizations = async () => {
    try {
      const response = await authorizationService.getAuthorizations(authEtag);
      
      if (response.notModified && auth) {
        // Cache is still valid
        return;
      }

      setAuth(response.auth);
      setUser(response.auth.user);
      setAuthEtag(response.etag);
      cacheAuth(response.auth, response.etag);
      setIsAuthenticated(true);

      // Also load legacy UI config for backward compatibility
      try {
        const config = await AuthService.getUIConfig();
        setUIConfig(config);
      } catch (configError) {
        console.warn('Failed to load legacy UI config:', configError);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to load authorizations');
    }
  };

  const getCachedAuth = () => {
    try {
      const cached = localStorage.getItem('userAuth');
      const cachedEtag = localStorage.getItem('userAuthEtag');
      
      if (cached && cachedEtag) {
        return {
          auth: JSON.parse(cached),
          etag: cachedEtag
        };
      }
    } catch (err) {
      console.warn('Failed to read cached auth:', err);
    }
    return null;
  };

  const cacheAuth = (authData, etagValue) => {
    try {
      localStorage.setItem('userAuth', JSON.stringify(authData));
      localStorage.setItem('userAuthEtag', etagValue);
    } catch (err) {
      console.warn('Failed to cache auth:', err);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userAuthEtag');
    setUser(null);
    setAuth(null);
    setUIConfig(null);
    setAuthEtag(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Login to get token
      const loginResponse = await AuthService.login(credentials);
      
      // Store authentication token
      localStorage.setItem('authToken', loginResponse.token);

      // Step 2: Load authorizations with capabilities
      await loadAuthorizations();
      
      return { success: true, user: auth?.user };
    } catch (error) {
      console.error('Login failed:', error);
      clearAuthData();
      setError(error.message || 'Login failed. Please check your credentials.');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshAuthorizations = async () => {
    try {
      const response = await authorizationService.refreshAuthorizations();
      setAuth(response.auth);
      setUser(response.auth.user);
      setAuthEtag(response.etag);
      cacheAuth(response.auth, response.etag);
    } catch (error) {
      console.error('Failed to refresh authorizations:', error);
      throw error;
    }
  };

  /**
   * Check if user has a specific capability
   * @param {string} capability - Capability key (e.g., 'WORKER.CREATE')
   * @returns {boolean}
   */
  const can = (capability) => {
    if (!auth?.can) {
      return false;
    }
    return auth.can[capability] === true;
  };

  /**
   * Check if user can perform any of the given capabilities
   * @param {Array<string>} capabilities - Array of capability keys
   * @returns {boolean}
   */
  const canAny = (capabilities) => {
    if (!Array.isArray(capabilities) || capabilities.length === 0) {
      return true;
    }
    return capabilities.some(cap => can(cap));
  };

  /**
   * Check if user can perform all of the given capabilities
   * @param {Array<string>} capabilities - Array of capability keys
   * @returns {boolean}
   */
  const canAll = (capabilities) => {
    if (!Array.isArray(capabilities) || capabilities.length === 0) {
      return true;
    }
    return capabilities.every(cap => can(cap));
  };

  /**
   * Get menu tree for navigation
   * @returns {Array}
   */
  const getMenuTree = () => {
    return auth?.menuTree || [];
  };

  /**
   * Get pages with actions
   * @returns {Array}
   */
  const getPages = () => {
    return auth?.pages || [];
  };

  /**
   * Get actions for a specific page
   * @param {string} pageId - Page identifier
   * @returns {Array}
   */
  const getPageActions = (pageId) => {
    const page = auth?.pages?.find(p => p.pageId === pageId);
    return page?.actions || [];
  };

  /**
   * Check if user can access a specific page
   * @param {string} route - Page route
   * @returns {boolean}
   */
  const canAccessPage = (route) => {
    if (!auth?.pages) {
      return false;
    }
    
    const page = auth.pages.find(p => p.route === route);
    if (!page) {
      return false;
    }

    // Check if user has read action or any action for the page
    return page.actions && page.actions.length > 0;
  };

  const value = {
    user,
    auth,
    uiConfig,
    isAuthenticated,
    loading,
    error,
    authEtag,
    login,
    logout,
    clearError,
    refreshAuthorizations,
    checkAuthStatus,
    // Capability-based methods
    can,
    canAny,
    canAll,
    getMenuTree,
    getPages,
    getPageActions,
    canAccessPage
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export default EnhancedAuthContext;
