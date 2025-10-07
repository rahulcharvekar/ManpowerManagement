import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user, uiConfig, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && uiConfig) {

        setLoading(false);
        setError(null);
      } else if (!isAuthenticated) {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, uiConfig, user]);



  // Helper functions
  const hasPermission = (permission) => {
    if (!user?.permissions || !permission) {
      console.log('🔍 hasPermission early return:', { 
        user: !!user, 
        permissions: user?.permissions, 
        permission 
      });
      return false;
    }
    
    // Ensure permissions is an array before calling includes
    if (!Array.isArray(user.permissions)) {
      console.warn('❌ User permissions is not an array:', { 
        type: typeof user.permissions, 
        value: user.permissions,
        user: user 
      });
      return false;
    }
    
    // The permissions from /api/auth/me are already strings
    const result = user.permissions.includes(permission);
    console.log('✅ Permission check:', { permission, result, userPermissions: user.permissions });
    return result;
  };

  const hasAnyPermission = (permissionList) => {
    if (!permissionList || !Array.isArray(permissionList) || permissionList.length === 0) return true;
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList) => {
    if (!permissionList || !Array.isArray(permissionList) || permissionList.length === 0) return true;
    return permissionList.every(permission => hasPermission(permission));
  };

  const canAccessComponent = (componentKey) => {
    if (!uiConfig?.navigation || !user?.permissions) return false;
    
    // Find the navigation item recursively
    const findNavItem = (items) => {
      for (const item of items) {
        if (item.id === componentKey) return item;
        if (item.children) {
          const found = findNavItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const navItem = findNavItem(uiConfig.navigation);
    if (!navItem) {
      // If component not found in navigation, check if user has basic permissions
      console.warn(`Navigation item '${componentKey}' not found in UI config`);
      return false;
    }
    
    // If no required permissions, allow access
    if (!navItem.requiredPermissions || navItem.requiredPermissions.length === 0) {
      return true;
    }
    
    // User needs ANY of the required permissions to access the component
    return navItem.requiredPermissions.some(permission => hasPermission(permission));
  };

  const canPerformAction = (componentKey, action) => {
    // Direct permission check for the action
    if (hasPermission(action)) {
      return true;
    }
    
    // Check if user has the specific permission for this action via UI config
    const actionPermissions = uiConfig?.uiConfig?.actions?.[componentKey] || [];
    if (actionPermissions.length > 0) {
      return actionPermissions.some(permission => hasPermission(permission));
    }
    
    return false;
  };

  const getUserRoles = () => {
    const roles = user?.roles;
    if (!Array.isArray(roles)) {
      console.warn('User roles is not an array:', roles);
      return [];
    }
    return roles;
  };

  const hasRole = (role) => {
    if (!role) return false;
    // Check both roles array and legacyRole for backward compatibility
    const userRoles = getUserRoles();
    return userRoles.includes(role) || user?.legacyRole === role;
  };

  const hasAnyRole = (roles) => {
    if (!roles || !Array.isArray(roles)) return false;
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles) => {
    if (!roles || !Array.isArray(roles)) return false;
    return roles.every(role => hasRole(role));
  };

  // Module-based permission checking based on database structure
  const hasModuleAccess = (module) => {
    const modulePermissions = {
      WORKER: ['READ_WORKER_DATA', 'UPLOAD_WORKER_DATA', 'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS', 'DELETE_WORKER_DATA'],
      PAYMENT: ['READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS', 'GENERATE_PAYMENT_REPORTS'],
      EMPLOYER: ['READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD'],
      BOARD: ['READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS'],
      RECONCILIATION: ['READ_RECONCILIATIONS', 'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS'],
      SYSTEM: ['MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_SYSTEM_LOGS', 'SYSTEM_MAINTENANCE', 'DATABASE_CLEANUP']
    };
    
    const modulePerms = modulePermissions[module] || [];
    return hasAnyPermission(modulePerms);
  };

  const getUserModulePermissions = (module) => {
    if (!user?.permissions) return [];
    
    const modulePermissions = {
      WORKER: ['READ_WORKER_DATA', 'UPLOAD_WORKER_DATA', 'VALIDATE_WORKER_DATA', 'GENERATE_WORKER_PAYMENTS', 'DELETE_WORKER_DATA'],
      PAYMENT: ['READ_PAYMENTS', 'PROCESS_PAYMENTS', 'APPROVE_PAYMENTS', 'REJECT_PAYMENTS', 'GENERATE_PAYMENT_REPORTS'],
      EMPLOYER: ['READ_EMPLOYER_RECEIPTS', 'VALIDATE_EMPLOYER_RECEIPTS', 'SEND_TO_BOARD'],
      BOARD: ['READ_BOARD_RECEIPTS', 'APPROVE_BOARD_RECEIPTS', 'REJECT_BOARD_RECEIPTS', 'GENERATE_BOARD_REPORTS'],
      RECONCILIATION: ['READ_RECONCILIATIONS', 'PERFORM_RECONCILIATION', 'GENERATE_RECONCILIATION_REPORTS'],
      SYSTEM: ['MANAGE_USERS', 'MANAGE_ROLES', 'VIEW_SYSTEM_LOGS', 'SYSTEM_MAINTENANCE', 'DATABASE_CLEANUP']
    };
    
    const modulePerms = modulePermissions[module] || [];
    return user.permissions.filter(permission => modulePerms.includes(permission));
  };

  const getNavigationItems = () => {
    if (!uiConfig?.navigation || !user?.permissions) {
      return [];
    }
    
    // Filter navigation items based on permissions
    const filterNavItems = (items) => {
      return items
        .filter(item => {
          // Always show items with no required permissions (like Dashboard, Profile)
          if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
            console.log(`✅ No permissions required for: ${item.label}`);
            return true;
          }
          
          // For items with required permissions, user needs ANY of the permissions (OR logic)
          const hasAnyPermission = item.requiredPermissions.some(permission => hasPermission(permission));
          console.log(`${hasAnyPermission ? '✅' : '❌'} ${item.label}:`, {
            required: item.requiredPermissions,
            hasAny: hasAnyPermission
          });
          return hasAnyPermission;
        })
        .map(item => ({
          ...item,
          children: item.children ? filterNavItems(item.children) : null
        }))
        .filter(item => {
          // For parent items with children, only show if they have visible children
          if (item.children) {
            return item.children.length > 0;
          }
          // For leaf items, show them
          return true;
        });
    };
    
    const filtered = filterNavItems(uiConfig.navigation);
    console.log('🎯 Final navigation result:', filtered.map(item => ({
      label: item.label,
      children: item.children?.map(child => child.label) || []
    })));
    return filtered;
  };

  const getUserInfo = () => {
    return user || null;
  };

  const getDefaultRoute = () => {
    return uiConfig?.uiConfig?.behavior?.defaultRoute || '/dashboard';
  };

  const contextValue = {
    user,
    uiConfig,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasModuleAccess,
    canAccessComponent,
    canPerformAction,
    getNavigationItems,
    getUserInfo,
    getUserRoles,
    getUserModulePermissions,
    getDefaultRoute
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
