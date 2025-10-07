import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login = ({ onLogin }) => {
  const { login, loading, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Validate input
    if (!credentials.username.trim()) {
      return;
    }
    if (!credentials.password) {
      return;
    }

    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Call the onLogin callback if provided
        if (onLogin) {
          onLogin(result.user);
        }
      }
      // Error handling is done by the AuthContext
    } catch (error) {
      // Additional error handling if needed
      console.error('Login submission error:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            🏢
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Manpower Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <span>{error}</span>
              </div>
              {error.includes('NetworkError') || error.includes('Failed to fetch') ? (
                <div className="mt-2 text-xs text-red-500">
                  Make sure the backend server is running on localhost:8080
                </div>
              ) : null}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* API Connection Status */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <span className="text-blue-600 text-sm">🔗</span>
              <p className="text-xs text-blue-700 ml-2">
                Connected to API server at <code className="bg-blue-100 px-1 rounded">localhost:8080</code>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
