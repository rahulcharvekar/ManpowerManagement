import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';

/**
 * UnauthorizedPage - Displays when user lacks required capabilities
 */
const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            You don't have the required capabilities to access this page.
          </p>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Logged in as</div>
            <div className="font-medium text-gray-900">
              {user?.fullName || user?.username || 'Unknown User'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Roles: {user?.roles?.join(', ') || 'None'}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex gap-3">
              <svg 
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What can I do?</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Contact your system administrator</li>
                  <li>• Request additional capabilities</li>
                  <li>• Return to a permitted page</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Go Home
            </button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact support at{' '}
          <a 
            href="mailto:support@example.com" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            support@example.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
