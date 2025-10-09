import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [uiConfig, setUIConfig] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      // Get complete user data with permissions and UI config from /api/me/authorizations
      // This single endpoint provides: can, endpoints, capabilities, pages, roles, userId, 
      // version, menuTree, username, email, fullName
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        console.log('✅ User authorization data loaded from /api/me/authorizations:', userData);
        console.log('📋 Raw backend data:', {
          hasCan: !!userData.can,
          canKeys: userData.can ? Object.keys(userData.can).length : 0,
          hasCapabilities: !!userData.capabilities,
          capabilitiesLength: userData.capabilities?.length,
          hasMenuTree: !!userData.menuTree,
          menuTreeType: typeof userData.menuTree,
          hasPages: !!userData.pages,
          pagesLength: userData.pages?.length
        });
        
        // Set user with permissions from 'can' property
        const userObject = {
          id: userData.userId,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          legacyRole: userData.legacyRole,
          roles: userData.roles || [],
          permissions: userData.can || {}, // Capability permissions map
          capabilities: userData.capabilities || [],
          endpoints: userData.endpoints || {},
          pages: userData.pages || [],
          enabled: true
        };
        
        console.log('👤 User object being set:', {
          id: userObject.id,
          username: userObject.username,
          rolesCount: userObject.roles.length,
          permissionsCount: Object.keys(userObject.permissions).length,
          capabilitiesCount: userObject.capabilities.length,
          samplePermissions: Object.entries(userObject.permissions).slice(0, 5)
        });
        
        setUser(userObject);
        
        // Build UI config directly from authorizations response
        // No need to call /api/auth/ui-config anymore!
        // Backend sends menuTree as { items: [...] }, extract the items array
        const menuItems = userData.menuTree?.items || userData.menuTree || [];
        
        console.log('🗂️ Menu processing:', {
          rawMenuTree: userData.menuTree,
          isObject: typeof userData.menuTree === 'object',
          hasItems: !!userData.menuTree?.items,
          menuItemsLength: Array.isArray(menuItems) ? menuItems.length : 'not array',
          firstMenuItem: menuItems?.[0]
        });
        
        const uiConfig = {
          navigation: menuItems,
          menuTree: menuItems,
          pages: userData.pages || [],
          version: userData.version,
          capabilities: userData.capabilities || [],
          endpoints: userData.endpoints || [],
          etag: userData.etag // For caching support
        };
        
        console.log('🎨 UI Config built:', {
          navigationLength: uiConfig.navigation?.length,
          menuTreeLength: uiConfig.menuTree?.length,
          pagesLength: uiConfig.pages?.length,
          navigationItems: uiConfig.navigation?.map(i => ({ id: i.id, name: i.name })),
          pageItems: uiConfig.pages?.map(i => ({ id: i.id, name: i.name }))
        });
        
        console.log('✅ UI Config built from authorizations:', uiConfig);
        setUIConfig(uiConfig);
        setIsAuthenticated(true);
      } else {
        // Invalid token
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      clearAuthData();
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    setUIConfig(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Login to get token and basic user info
      const loginResponse = await AuthService.login(credentials);
      
      // Store authentication token
      localStorage.setItem('authToken', loginResponse.token);

      // Step 2: Get complete user data with authorizations from /api/me/authorizations
      // This single call provides everything: permissions, capabilities, pages, menuTree
      const authData = await AuthService.getCurrentUser();
      
      console.log('✅ Authorization data loaded from /api/me/authorizations:', authData);
      
      // authData structure: { can, endpoints, capabilities, pages, roles, userId, version, menuTree, username, email, fullName }
      const completeUser = {
        id: authData.userId || loginResponse.user.id,
        username: authData.username || loginResponse.user.username,
        email: authData.email || loginResponse.user.email,
        fullName: authData.fullName || loginResponse.user.fullName,
        legacyRole: loginResponse.user.role, // from login response for backward compat
        roles: authData.roles || [], // from authorizations
        permissions: authData.can || {}, // capability permissions map
        capabilities: authData.capabilities || [],
        endpoints: authData.endpoints || [],
        pages: authData.pages || [],
        enabled: true
      };
      
      // Store user info
      localStorage.setItem('userInfo', JSON.stringify(completeUser));
      
      // Build UI configuration directly from authorizations
      // No need to call /api/auth/ui-config anymore!
      // Backend sends menuTree as { items: [...] }, extract the items array
      const menuItems = authData.menuTree?.items || authData.menuTree || [];
      
      const config = {
        navigation: menuItems,
        menuTree: menuItems,
        pages: authData.pages || [],
        version: authData.version,
        capabilities: authData.capabilities || [],
        endpoints: authData.endpoints || [],
        etag: authData.etag // For caching support
      };
      
      console.log('✅ UI Config built from authorizations:', config);
      setUIConfig(config);
      
      setUser(completeUser);
      setIsAuthenticated(true);
      
      return { success: true, user: completeUser, config };
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

  const refreshUserInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Use /api/me/authorizations to get fresh data
      const authData = await AuthService.getCurrentUser();
      if (authData) {
        const updatedUser = {
          id: authData.userId,
          username: authData.username,
          email: authData.email,
          fullName: authData.fullName,
          legacyRole: authData.legacyRole,
          roles: authData.roles || [],
          permissions: authData.can || {},
          capabilities: authData.capabilities || [],
          endpoints: authData.endpoints || [],
          pages: authData.pages || [],
          enabled: true
        };
        
        // Backend sends menuTree as { items: [...] }, extract the items array
        const menuItems = authData.menuTree?.items || authData.menuTree || [];
        
        const updatedConfig = {
          navigation: menuItems,
          menuTree: menuItems,
          pages: authData.pages || [],
          version: authData.version,
          capabilities: authData.capabilities || [],
          endpoints: authData.endpoints || [],
          etag: authData.etag
        };
        
        setUser(updatedUser);
        setUIConfig(updatedConfig);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  };

  // Build capabilities object from uiConfig and user for easy access
  const capabilities = {
    can: user?.permissions || {},
    pages: uiConfig?.pages || [],
    endpoints: uiConfig?.endpoints || [],
    roles: user?.roles || [],
    menuTree: uiConfig?.menuTree || [],
    version: uiConfig?.version
  };

  const value = {
    user,
    uiConfig,
    capabilities, // Expose capabilities for easy access
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    clearError,
    refreshUserInfo,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
