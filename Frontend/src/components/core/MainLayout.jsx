import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { usePermissions } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';

// Top Header Component
const TopHeader = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - App title/breadcrumb */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Manpower Management System
          </h1>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {user?.fullName || user?.username || 'User'}
              </div>
              <div className="text-gray-500">
                {user?.roles?.join(', ') || 'No roles'}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
            title="Logout"
          >
            <span className="mr-2">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

const MainLayout = () => {
  const { loading } = usePermissions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <span className="text-gray-600 font-medium">Loading application...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <TopHeader />
      
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="sidebar flex-shrink-0">
          <Navigation />
        </aside>
        
        {/* Main Content */}
        <main className="main-content flex-1 overflow-x-hidden">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
