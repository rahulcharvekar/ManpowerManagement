import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionContext';

const Navigation = () => {
  const { getNavigationItems, loading, getUserInfo } = usePermissions();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-64 bg-white shadow-xl border-r border-gray-200">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const navigationItems = getNavigationItems();
  const userInfo = getUserInfo();

  const renderNavItem = (item) => {
    // If item has no path and has children, render as expandable group
    if (!item.path && item.children && item.children.length > 0) {
      return (
        <li key={item.id} className={`nav-group nav-${item.section?.toLowerCase()}`}>
          <div className="nav-group-header px-4 py-2 text-sm font-semibold text-gray-600 uppercase tracking-wider">
            <span className="nav-icon text-lg mr-3">{item.icon}</span>
            {item.label}
          </div>
          <ul className="nav-children ml-2 space-y-1">
            {item.children.map(renderNavItem)}
          </ul>
        </li>
      );
    }
    
    // Regular navigation item
    return (
      <li key={item.id} className={`nav-item nav-${item.section?.toLowerCase()}`}>
        <Link 
          to={item.path} 
          className={`nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-lg mx-2 ${
            location.pathname === item.path ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 shadow-sm' : ''
          }`}
        >
          <span className="nav-icon text-xl mr-3">{item.icon}</span>
          <span className="nav-text font-medium">{item.label}</span>
        </Link>
      </li>
    );
  };

  // Navigation items are already structured hierarchically from the backend

  return (
    <nav className="sidebar-navigation w-64 bg-white shadow-xl h-full border-r border-gray-200">
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-primary">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold">
            {userInfo?.fullName?.charAt(0) || userInfo?.username?.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-white">
              {userInfo?.fullName || userInfo?.username || 'User'}
            </div>
            <div className="text-xs text-white/80">
              {userInfo?.roles?.join(', ') || 'No roles'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="py-2">
        <ul className="nav-list space-y-1">
          {navigationItems.map(renderNavItem)}
        </ul>
      </div>

    </nav>
  );
};

export default Navigation;
