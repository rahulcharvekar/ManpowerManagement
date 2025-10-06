import React from 'react';
import { usePermissions } from '../contexts/PermissionContext';

const ActionGate = ({ 
  componentKey, 
  action, 
  children, 
  fallback = null,
  showLoading = false,
  className = ""
}) => {
  const { canPerformAction, loading } = usePermissions();

  // Show loading state if requested
  if (loading && showLoading) {
    return (
      <div className={`inline-block ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
      </div>
    );
  }

  // Check if user can perform the action
  if (!canPerformAction(componentKey, action)) {
    return fallback;
  }

  return children;
};

export default ActionGate;
