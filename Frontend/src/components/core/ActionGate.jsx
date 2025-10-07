import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

const ActionGate = ({ 
  permission,           // Single permission to check
  permissions,          // Array of permissions to check
  roles,               // Array of roles to check
  module,              // Module access to check
  componentKey,        // For backward compatibility
  action,              // For backward compatibility
  requireAll = false,  // Require all permissions/roles (AND logic) vs any (OR logic)
  children, 
  fallback = null,
  showLoading = false,
  className = "",
  disabled = false
}) => {
  const { 
    canPerformAction, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasModuleAccess,
    loading 
  } = usePermissions();

  // Show loading state if requested
  if (loading && showLoading) {
    return (
      <div className={`inline-block ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
      </div>
    );
  }

  // If disabled prop is true, don't render children
  if (disabled) {
    return fallback;
  }

  let canAccess = false;

  // Check access based on provided criteria (supports multiple types of checks)
  
  // 1. Module-based access check
  if (module) {
    canAccess = hasModuleAccess(module);
  }
  // 2. Role-based access check
  else if (roles && roles.length > 0) {
    canAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }
  // 3. Permission-based access check
  else if (permission) {
    // Single permission check
    canAccess = hasPermission(permission);
  }
  else if (permissions && permissions.length > 0) {
    // Multiple permissions check
    canAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  // 4. Legacy support for action prop
  else if (action) {
    canAccess = hasPermission(action);
  }
  // 5. Legacy support for componentKey+action
  else if (componentKey && action) {
    canAccess = canPerformAction(componentKey, action);
  }
  // 6. Default behavior
  else {
    // Default to true if no restrictions specified
    canAccess = true;
  }

  // Check if user can perform the action
  if (!canAccess) {
    return fallback;
  }

  return children;
};

export default ActionGate;
