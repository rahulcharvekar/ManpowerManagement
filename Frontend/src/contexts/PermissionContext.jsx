import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user, uiConfig, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔄 PermissionProvider state:', { 
    authLoading, 
    isAuthenticated, 
    hasUser: !!user,
    hasUIConfig: !!uiConfig,
    userPermissions: user?.permissions,
    permissionType: user?.permissions ? typeof user.permissions : 'none'
  });

  useEffect(() => {
    console.log('🔄 PermissionProvider useEffect:', { 
      authLoading, 
      isAuthenticated, 
      hasUser: !!user,
      hasUIConfig: !!uiConfig,
      willSetLoadingFalse: !authLoading && (isAuthenticated && uiConfig || !isAuthenticated)
    });

    if (!authLoading) {
      if (isAuthenticated && uiConfig && user) {
        console.log('✅ PermissionProvider ready - user authenticated with config and user data');
        setLoading(false);
        setError(null);
      } else if (!isAuthenticated) {
        console.log('⚠️ PermissionProvider ready - user not authenticated');
        setLoading(false);
      } else {
        console.warn('⏳ Waiting for user data or UI config...', { user: !!user, uiConfig: !!uiConfig });
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
    
    // Handle both array and object formats for permissions
    if (Array.isArray(user.permissions)) {
      // Array format: ['PERMISSION1', 'PERMISSION2']
      const result = user.permissions.includes(permission);
      console.log('✅ Permission check (array):', { permission, result, userPermissions: user.permissions });
      return result;
    } else if (typeof user.permissions === 'object') {
      // Object format: { 'PERMISSION1': true, 'PERMISSION2': false }
      const result = user.permissions[permission] === true;
      console.log('✅ Permission check (object):', { permission, result, userPermissions: user.permissions });
      return result;
    } else {
      console.warn('❌ User permissions is neither array nor object:', { 
        type: typeof user.permissions, 
        value: user.permissions,
        user: user 
      });
      return false;
    }
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
    console.log('🔍 canAccessComponent check:', { 
      componentKey, 
      componentKeyType: typeof componentKey,
      hasUser: !!user,
      hasPermissions: !!user?.permissions,
      hasUIConfig: !!uiConfig,
      hasNavigation: !!uiConfig?.navigation,
      hasMenuTree: !!uiConfig?.menuTree,
      navigationLength: uiConfig?.navigation?.length,
      menuTreeLength: uiConfig?.menuTree?.length,
      pagesLength: uiConfig?.pages?.length
    });

    // If no user or permissions, deny access
    if (!user?.permissions) {
      console.warn('❌ No user or permissions available');
      return false;
    }

    // Try to get navigation/pages data
    const navigation = uiConfig?.navigation || uiConfig?.menuTree;
    const pages = uiConfig?.pages || [];
    
    console.log('📊 Available navigation data:', {
      navigation: Array.isArray(navigation) ? navigation.length : 'not array',
      pages: Array.isArray(pages) ? pages.length : 'not array',
      navigationItems: navigation?.map(n => ({ id: n.id, name: n.name, path: n.path })),
      pageItems: pages?.map(p => ({ id: p.id, name: p.name, path: p.path }))
    });
    
    // Find the item recursively in navigation/pages
    // Handle both string and numeric IDs
    const findItem = (items) => {
      if (!items || !Array.isArray(items)) return null;
      
      for (const item of items) {
        // Compare both as strings and numbers for flexibility
        if (item.id === componentKey || 
            String(item.id) === String(componentKey) ||
            item.id === Number(componentKey)) {
          console.log('🎯 Found matching item:', item);
          return item;
        }
        if (item.children) {
          const found = findItem(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Search in both navigation and pages
    let navItem = findItem(navigation);
    if (!navItem) {
      navItem = findItem(pages);
    }
    
    if (!navItem) {
      console.warn(`⚠️ Item '${componentKey}' not found in navigation or pages, allowing access by default`);
      return true; // Backward compatibility
    }
    
    console.log('✅ Found item for access check:', { 
      componentKey, 
      item: navItem,
      hasActions: !!navItem.actions,
      actionsLength: navItem.actions?.length,
      actions: navItem.actions
    });
    
    // Check actions array (new backend structure)
    if (navItem.actions && Array.isArray(navItem.actions) && navItem.actions.length > 0) {
      const permissionsCheck = navItem.actions.map(permission => ({
        permission,
        hasIt: hasPermission(permission)
      }));
      
      const hasAccess = navItem.actions.some(permission => hasPermission(permission));
      
      console.log('🔐 Permission check result (actions):', { 
        componentKey, 
        requiredActions: navItem.actions,
        permissionsCheck,
        hasAccess,
        userPermissionKeys: Object.keys(user.permissions).slice(0, 10)
      });
      return hasAccess;
    }
    
    // Check requiredPermissions (legacy/backward compatibility)
    if (navItem.requiredPermissions && navItem.requiredPermissions.length > 0) {
      const hasAccess = navItem.requiredPermissions.some(permission => hasPermission(permission));
      console.log('🔐 Permission check result (requiredPermissions):', { 
        componentKey, 
        requiredPermissions: navItem.requiredPermissions, 
        hasAccess 
      });
      return hasAccess;
    }
    
    // If parent item with children, allow access (children will be checked individually)
    if (navItem.children && navItem.children.length > 0) {
      console.log('✅ Parent item with children, allowing access:', componentKey);
      return true;
    }
    
    // If no required permissions or actions, allow access
    console.log('✅ No required permissions or actions for component:', componentKey);
    return true;
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

  // Module-based permission checking based on actual backend response structure
  // Backend sends permissions in format: MODULE.ACTION (e.g., WORKER.CREATE, PAYMENT.READ, etc.)
  const hasModuleAccess = (module) => {
    if (!user?.permissions) {
      console.log('❌ hasModuleAccess: No user permissions');
      return false;
    }

    // Check if user has ANY permission that starts with the module name
    // For example, for module "WORKER", check for WORKER.CREATE, WORKER.READ, WORKER.UPDATE, etc.
    const hasAccess = Object.keys(user.permissions).some(permission => {
      const hasIt = permission.startsWith(`${module}.`) && user.permissions[permission] === true;
      return hasIt;
    });

    console.log(`🔍 hasModuleAccess(${module}):`, {
      hasAccess,
      userPermissions: Object.keys(user.permissions).filter(p => p.startsWith(`${module}.`)),
      allPermissionKeys: Object.keys(user.permissions).slice(0, 10)
    });

    return hasAccess;
  };

  const getUserModulePermissions = (module) => {
    if (!user?.permissions) return [];
    
    // Get all permissions for this module (e.g., all permissions starting with "WORKER.")
    const modulePermissions = Object.keys(user.permissions)
      .filter(permission => permission.startsWith(`${module}.`) && user.permissions[permission] === true);
    
    console.log(`📋 getUserModulePermissions(${module}):`, modulePermissions);
    return modulePermissions;
  };

  const getNavigationItems = () => {
    console.log('🔍 getNavigationItems called with:', { 
      hasUIConfig: !!uiConfig, 
      hasNavigation: !!uiConfig?.navigation,
      hasMenuTree: !!uiConfig?.menuTree,
      hasUser: !!user,
      hasPermissions: !!user?.permissions,
      uiConfigKeys: uiConfig ? Object.keys(uiConfig) : [],
      navigationLength: uiConfig?.navigation?.length,
      menuTreeLength: uiConfig?.menuTree?.length
    });

    // Try to get navigation from either 'navigation' or 'menuTree' property
    const navigation = uiConfig?.navigation || uiConfig?.menuTree;
    
    if (!navigation || !user?.permissions) {
      console.warn('⚠️ No navigation or permissions available:', { 
        hasNavigation: !!navigation,
        hasUser: !!user,
        hasPermissions: !!user?.permissions 
      });
      return [];
    }
    
    // Filter navigation items based on permissions
    const filterNavItems = (items) => {
      return items
        .map(item => {
          // Process children first if they exist
          const processedItem = {
            ...item,
            children: item.children ? filterNavItems(item.children) : null
          };
          return processedItem;
        })
        .filter(item => {
          // 1. For parent items with children, check if ANY child is accessible
          if (item.children && Array.isArray(item.children) && item.children.length > 0) {
            const hasAccessibleChildren = item.children.length > 0;
            console.log(`${hasAccessibleChildren ? '✅' : '❌'} ${item.name}: ${item.children.length} accessible children`);
            return hasAccessibleChildren;
          }
          
          // 2. For leaf items with actions array (new backend structure)
          if (item.actions && Array.isArray(item.actions) && item.actions.length > 0) {
            // User needs ANY of the action permissions to see this menu item
            const hasAnyPermission = item.actions.some(permission => hasPermission(permission));
            console.log(`${hasAnyPermission ? '✅' : '❌'} ${item.name}:`, {
              required: item.actions,
              hasAny: hasAnyPermission
            });
            return hasAnyPermission;
          }
          
          // 3. Check for legacy requiredPermissions (backward compatibility)
          if (item.requiredPermissions && Array.isArray(item.requiredPermissions) && item.requiredPermissions.length > 0) {
            const hasAnyPermission = item.requiredPermissions.some(permission => hasPermission(permission));
            console.log(`${hasAnyPermission ? '✅' : '❌'} ${item.label || item.name}:`, {
              required: item.requiredPermissions,
              hasAny: hasAnyPermission
            });
            return hasAnyPermission;
          }
          
          // 4. Items with no permissions (like Dashboard, Profile) - always show
          console.log(`✅ No restrictions for: ${item.label || item.name}`);
          return true;
        });
    };
    
    const filtered = filterNavItems(navigation);
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
