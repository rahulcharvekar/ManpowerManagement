import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarMenu from './SidebarMenu';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { useCatalog } from '../../contexts/CatalogContext';

/**
 * CapabilityLayout - Main layout using the new capability system
 * Includes sidebar navigation and main content area
 */
const CapabilityLayout = () => {
  const { user, logout } = useEnhancedAuth();
  const { getCatalogVersion, loading: catalogLoading } = useCatalog();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <SidebarMenu />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">
                Manpower Management System
              </h2>
              {catalogLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                  <span>Loading catalog...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* System Info */}
              <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <div className="text-xs text-gray-500">Catalog Version</div>
                  <div className="text-sm font-mono font-medium text-gray-700">
                    {getCatalogVersion() || 'N/A'}
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-300"></div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Auth Model</div>
                  <div className="text-sm font-medium text-blue-600">
                    Capability-Based
                  </div>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user?.roles?.join(', ') || 'No roles'}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              © 2025 Manpower Management System. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Capability + Policy + Service Catalog</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Version 2.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CapabilityLayout;
