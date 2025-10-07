import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

/**
 * ModulePermissionGate - Gate component for module-based access control
 * 
 * Usage examples:
 * <ModulePermissionGate module="WORKER">
 *   <WorkerDashboard />
 * </ModulePermissionGate>
 * 
 * <ModulePermissionGate module="SYSTEM" fallback={<div>Access Denied</div>}>
 *   <AdminPanel />
 * </ModulePermissionGate>
 */
const ModulePermissionGate = ({ 
  module,               // Module to check access for
  permission,           // Specific permission to check within module
  permissions,          // Array of permissions to check within module
  requireAll = false,   // Require all permissions (AND logic) vs any (OR logic)
  children, 
  fallback = null,      // What to render if no access
  showLoading = true,   // Show loading state
  className = ""
}) => {
  const { 
    hasModuleAccess, 
    getUserModulePermissions, 
    hasPermission, 
    hasAnyPermission, 
    hasAllPermissions, 
    loading 
  } = usePermissions();

  // Show loading state if requested
  if (loading && showLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  let canAccess = false;

  // Check access based on provided criteria
  if (module && permission) {
    // Check if user has specific permission (must also have module access)
    canAccess = hasModuleAccess(module) && hasPermission(permission);
  } 
  else if (module && permissions && permissions.length > 0) {
    // Check multiple permissions within module (must also have module access)
    const permissionCheck = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    canAccess = hasModuleAccess(module) && permissionCheck;
  }
  else if (module) {
    // Check module access only
    canAccess = hasModuleAccess(module);
  }
  else if (permission) {
    // Check single permission
    canAccess = hasPermission(permission);
  }
  else if (permissions && permissions.length > 0) {
    // Check multiple permissions
    canAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  else {
    // Default to true if no restrictions
    canAccess = true;
  }

  return canAccess ? children : fallback;
};

export default ModulePermissionGate;
