import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';

/**
 * PermissionButton Component
 * Renders a button only if the user has the required permission(s)
 * 
 * @param {string|string[]} permission - Single permission or array of permissions required
 * @param {string} requireAll - If true and multiple permissions, require ALL permissions (default: false = ANY)
 * @param {Function} onClick - Click handler
 * @param {string} className - CSS classes
 * @param {React.ReactNode} children - Button content
 * @param {boolean} disabled - Disable button
 * @param {string} variant - Button style variant (primary, secondary, danger, success)
 * @param {React.ReactNode} fallback - What to show when permission denied (default: null)
 */
const PermissionButton = ({ 
  permission, 
  requireAll = false,
  onClick,
  className = '',
  children,
  disabled = false,
  variant = 'primary',
  fallback = null,
  ...props 
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Determine if user has required permissions
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission) 
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }

  // If no access, show fallback or nothing
  if (!hasAccess) {
    return fallback;
  }

  // Variant styles
  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
  };

  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const buttonStyles = `${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonStyles}
      {...props}
    >
      {children}
    </button>
  );
};

export default PermissionButton;
