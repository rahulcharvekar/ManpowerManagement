import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

/**
 * PermissionRenderer - Advanced component for complex permission-based rendering
 * 
 * Usage examples:
 * 
 * // Render different content based on permissions
 * <PermissionRenderer
 *   rules={[
 *     {
 *       permissions: ["MANAGE_USERS"],
 *       component: <AdminUserManagement />
 *     },
 *     {
 *       permissions: ["READ_USERS"], 
 *       component: <ReadOnlyUserList />
 *     }
 *   ]}
 *   fallback={<div>No access</div>}
 * />
 */
const PermissionRenderer = ({
  // New rule-based system
  rules = [],           // Array of rule objects
  
  // Legacy props for backward compatibility
  permissions,
  roles,
  module,
  requireAll = false,
  children,
  fallback = null,
  renderWhenNoAccess = false,
  
  // Common props
  showLoading = true,
  className = ""
}) => {
  const {
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
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading permissions...</span>
      </div>
    );
  }

  // New rule-based system
  if (rules.length > 0) {
    // Check each rule in order and return the first match
    for (const rule of rules) {
      let matches = false;

      // Check rule conditions
      if (rule.module) {
        matches = hasModuleAccess(rule.module);
      }
      else if (rule.roles && rule.roles.length > 0) {
        matches = rule.requireAll ? hasAllRoles(rule.roles) : hasAnyRole(rule.roles);
      }
      else if (rule.permission) {
        matches = hasPermission(rule.permission);
      }
      else if (rule.permissions && rule.permissions.length > 0) {
        matches = rule.requireAll ? hasAllPermissions(rule.permissions) : hasAnyPermission(rule.permissions);
      }
      else {
        // Rule with no conditions matches all
        matches = true;
      }

      // If rule matches, render the component
      if (matches) {
        if (typeof rule.component === 'function') {
          return rule.component();
        }
        return rule.component;
      }
    }

    // No rules matched, return fallback
    return fallback;
  }

  // Legacy system for backward compatibility
  let canAccess = false;

  // Check module access
  if (module) {
    canAccess = hasModuleAccess(module);
  }
  // Check permissions
  else if (permissions && permissions.length > 0) {
    canAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }
  // Check roles
  else if (roles && roles.length > 0) {
    canAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }
  else {
    // Default to true if no restrictions
    canAccess = true;
  }

  // Apply access logic
  if (renderWhenNoAccess) {
    canAccess = !canAccess;
  }

  // Render based on access
  if (canAccess) {
    if (typeof children === 'function') {
      return children({ hasAccess: canAccess });
    }
    return children;
  }

  return fallback;
};

/**
 * Helper component for conditional rendering based on permission matrix
 */
export const PermissionSwitch = ({
  permission,
  permissions,
  roles,
  module,
  requireAll = false,
  children,
  fallback = null,
  inverse = false       // Render when permission is NOT present
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasModuleAccess
  } = usePermissions();

  let hasAccess = false;

  if (module) {
    hasAccess = hasModuleAccess(module);
  }
  else if (roles && roles.length > 0) {
    hasAccess = requireAll ? hasAllRoles(roles) : hasAnyRole(roles);
  }
  else if (permission) {
    hasAccess = hasPermission(permission);
  }
  else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  // Apply inverse logic if requested
  if (inverse) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? children : fallback;
};

export default PermissionRenderer;
