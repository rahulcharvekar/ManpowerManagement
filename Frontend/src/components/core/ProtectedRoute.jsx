import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionContext';

const ProtectedRoute = ({ 
  children, 
  componentKey, 
  fallback = null,
  redirectTo = "/unauthorized" 
}) => {
  const { canAccessComponent, loading, error } = usePermissions();

  console.log('🛡️ ProtectedRoute rendering:', { 
    componentKey, 
    loading, 
    error, 
    redirectTo 
  });

  // Show loading state
  if (loading) {
    console.log('⏳ ProtectedRoute: Still loading permissions...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    console.error('❌ ProtectedRoute: Error loading permissions:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check component access
  const hasAccess = canAccessComponent(componentKey);
  console.log('🔐 ProtectedRoute access check:', { 
    componentKey, 
    hasAccess,
    willRedirect: !hasAccess,
    redirectTo: !hasAccess ? redirectTo : 'none'
  });

  if (!hasAccess) {
    console.warn(`❌ Access denied to component: ${componentKey}, redirecting to ${redirectTo}`);
    return fallback || <Navigate to={redirectTo} replace />;
  }

  console.log(`✅ Access granted to component: ${componentKey}`);
  return children;
};

export default ProtectedRoute;
