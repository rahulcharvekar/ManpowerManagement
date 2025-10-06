import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { usePermissions } from '../contexts/PermissionContext';

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
    <div className="flex min-h-screen bg-gray-50">
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
  );
};

export default MainLayout;
