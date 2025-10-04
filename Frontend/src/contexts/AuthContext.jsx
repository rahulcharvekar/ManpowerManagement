import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  validateSession,
  refreshToken,
  TokenManager 
} from '../api/auth';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const token = TokenManager.getToken();
      const userData = TokenManager.getUserData();

      if (token && userData) {
        // Validate the existing token
        try {
          await validateSession(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.log('Token validation failed, attempting refresh...');
          
          // Try to refresh the token
          try {
            const refreshTokenValue = TokenManager.getRefreshToken();
            if (refreshTokenValue) {
              const response = await refreshToken(refreshTokenValue);
              TokenManager.setToken(response.accessToken);
              if (response.refreshToken) {
                TokenManager.setRefreshToken(response.refreshToken);
              }
              
              // Get updated user data
              const currentUser = await getCurrentUser(response.accessToken);
              setUser(currentUser);
              TokenManager.setUserData(currentUser);
              setIsAuthenticated(true);
            } else {
              // No refresh token, clear auth state
              clearAuthState();
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            clearAuthState();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
    TokenManager.clearAll();
  };

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await loginUser(credentials);
      
      // Store tokens and user data
      TokenManager.setToken(response.accessToken);
      if (response.refreshToken) {
        TokenManager.setRefreshToken(response.refreshToken);
      }
      
      // Get user profile data
      const userData = response.user || await getCurrentUser(response.accessToken);
      TokenManager.setUserData(userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await registerUser(userData);
      
      // Auto-login after successful registration
      if (response.accessToken) {
        TokenManager.setToken(response.accessToken);
        if (response.refreshToken) {
          TokenManager.setRefreshToken(response.refreshToken);
        }
        
        const user = response.user || await getCurrentUser(response.accessToken);
        TokenManager.setUserData(user);
        
        setUser(user);
        setIsAuthenticated(true);
      }
      
      return { success: true, user: response.user, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const token = TokenManager.getToken();
      if (token) {
        await logoutUser(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      clearAuthState();
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await updateUserProfile(token, profileData);
      const updatedUser = response.user || { ...user, ...profileData };
      
      setUser(updatedUser);
      TokenManager.setUserData(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get fresh user data
  const refreshUserData = async () => {
    try {
      const token = TokenManager.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const userData = await getCurrentUser(token);
      setUser(userData);
      TokenManager.setUserData(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('User data refresh error:', error);
      
      // If token is invalid, try to refresh
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        try {
          const refreshTokenValue = TokenManager.getRefreshToken();
          if (refreshTokenValue) {
            const response = await refreshToken(refreshTokenValue);
            TokenManager.setToken(response.accessToken);
            if (response.refreshToken) {
              TokenManager.setRefreshToken(response.refreshToken);
            }
            
            const userData = await getCurrentUser(response.accessToken);
            setUser(userData);
            TokenManager.setUserData(userData);
            
            return { success: true, user: userData };
          }
        } catch (refreshError) {
          console.error('Token refresh failed during user data refresh:', refreshError);
          clearAuthState();
        }
      }
      
      return { success: false, error: error.message };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const contextValue = {
    // State
    user,
    loading,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    
    // Utilities
    hasRole,
    hasAnyRole,
    hasPermission,
    
    // Token utilities
    getToken: TokenManager.getToken,
    clearAuth: clearAuthState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth(Component, requiredRoles = []) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, loading, hasAnyRole } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access this page.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
            <p className="text-sm text-gray-500 mb-6">
              Required roles: {requiredRoles.join(', ')}
            </p>
            <button 
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Protected Route component
export function ProtectedRoute({ children, requiredRoles = [] }) {
  const { isAuthenticated, user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mb-6">
            Required roles: {requiredRoles.join(', ')}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
