import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS, apiClient } from '../api/apiConfig';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await apiClient.get(API_ENDPOINTS.COMPONENTS.UI_CONFIG, token);
      
      // API Response Structure:
      // {
      //   userId: 123,
      //   username: "john.doe", 
      //   fullName: "John Doe Smith",
      //   roles: ["ADMIN", "RECONCILIATION_OFFICER"],
      //   componentPermissions: {
      //     "user-management": ["VIEW", "CREATE", "EDIT", "DELETE", "MANAGE"],
      //     "payment-processing": ["VIEW", "APPROVE", "REJECT"],
      //     "dashboard": ["VIEW", "ANALYTICS"]
      //   },
      //   navigation: [
      //     { id: "dashboard", name: "Dashboard", path: "/dashboard", icon: "🏠", category: "General", displayOrder: 1 },
      //     { id: "user-management", name: "User Management", path: "/admin/users", icon: "👥", category: "Administration", displayOrder: 10 }
      //   ],
      //   uiConfig: { behavior: { defaultRoute: "/dashboard" }, components: {...} }
      // }
      
      setPermissions(response);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      setError(error.message);
      
      // If token is invalid, clear it and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const canAccessComponent = (componentKey) => {
    return permissions?.componentPermissions?.[componentKey]?.includes('VIEW') || false;
  };

  const canPerformAction = (componentKey, action) => {
    return permissions?.componentPermissions?.[componentKey]?.includes(action) || false;
  };

  const getNavigationItems = () => {
    if (!permissions?.navigation) return [];
    
    // Sort by displayOrder and filter accessible items
    return permissions.navigation
      .filter(item => canAccessComponent(item.id))
      .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
  };

  const getUserInfo = () => {
    if (!permissions) return null;
    
    return {
      userId: permissions.userId,
      username: permissions.username,
      fullName: permissions.fullName,
      roles: permissions.roles || []
    };
  };

  const getDefaultRoute = () => {
    return permissions?.uiConfig?.behavior?.defaultRoute || '/dashboard';
  };

  const contextValue = {
    permissions,
    loading,
    error,
    canAccessComponent,
    canPerformAction,
    getNavigationItems,
    getUserInfo,
    getDefaultRoute,
    refetch: fetchPermissions
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};

export default PermissionContext;
