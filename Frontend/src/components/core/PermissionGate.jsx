import React from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';

/**
 * PermissionGate - Conditionally renders content based on capabilities
 * Similar to ActionGate but uses the new capability system
 */
const PermissionGate = ({ 
  capability,
  capabilities,
  requireAll = false,
  children,
  fallback = null 
}) => {
  const { can, canAny, canAll } = useEnhancedAuth();

  // Single capability check
  if (capability) {
    if (!can(capability)) {
      return fallback;
    }
    return children;
  }

  // Multiple capabilities check
  if (capabilities && Array.isArray(capabilities)) {
    const hasAccess = requireAll 
      ? canAll(capabilities) 
      : canAny(capabilities);
    
    if (!hasAccess) {
      return fallback;
    }
  }

  return children;
};

export default PermissionGate;
