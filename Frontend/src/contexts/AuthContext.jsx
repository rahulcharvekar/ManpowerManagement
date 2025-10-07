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

      // Get current user data with permissions from /api/auth/me
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        // Set user information from /api/auth/me response
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          legacyRole: userData.legacyRole,
          roles: userData.roles,
          permissions: userData.permissions,
          enabled: userData.enabled
        });
        
        // Also get UI configuration for navigation
        try {
          const config = await AuthService.getUIConfig();
          setUIConfig(config);
        } catch (configError) {
          console.warn('Failed to load UI config:', configError);
          // Continue with user data even if UI config fails
        }
        
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

      // Step 1: Login to get token
      const loginResponse = await AuthService.login(credentials);
      
      // Store authentication token
      localStorage.setItem('authToken', loginResponse.token);

      // Step 2: Get complete user data with permissions from /api/auth/me
      const userData = await AuthService.getCurrentUser();
      
      // Update state with complete user information
      const completeUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        legacyRole: userData.legacyRole,
        roles: userData.roles,
        permissions: userData.permissions,
        enabled: userData.enabled
      };
      
      // Store user info
      localStorage.setItem('userInfo', JSON.stringify(completeUser));
      
      // Step 3: Get UI configuration for navigation
      let config = null;
      try {
        config = await AuthService.getUIConfig();
        setUIConfig(config);
      } catch (configError) {
        console.warn('Failed to load UI config:', configError);
      }
      
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

      const config = await AuthService.getUIConfig();
      if (config) {
        const updatedUser = {
          id: config.userId,
          username: config.username,
          fullName: config.fullName,
          roles: config.roles,
          permissions: config.permissions
        };
        setUser(updatedUser);
        setUIConfig(config);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  };

  const value = {
    user,
    uiConfig,
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
