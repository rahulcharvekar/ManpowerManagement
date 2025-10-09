import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';

/**
 * RouteGuard - Protects routes based on capabilities
 * Checks if user can access a specific page/route
 */
const RouteGuard = ({ 
  route,
  capability,
  children, 
  fallback = null,
  redirectTo = "/unauthorized" 
}) => {
  const { canAccessPage, can, loading, error } = useEnhancedAuth();

  // Show loading state with Tailwind styling
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading authorization...</p>
        </div>
      </div>
    );
  }

  // Show error state with Tailwind styling
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authorization Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check route access
  if (route && !canAccessPage(route)) {
    return fallback || <Navigate to={redirectTo} replace />;
  }

  // Check capability access
  if (capability && !can(capability)) {
    return fallback || <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RouteGuard;
