import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionContext';

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

  const renderNavItem = (item) => (
    <li key={item.id} className={`nav-item nav-${item.category?.toLowerCase()}`}>
      <Link 
        to={item.path} 
        className={`nav-link flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 rounded-lg mx-2 ${
          location.pathname === item.path ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500 shadow-sm' : ''
        }`}
      >
        <span className="nav-icon text-xl mr-3">{item.icon}</span>
        <span className="nav-text font-medium">{item.name}</span>
      </Link>
      
      {item.children && item.children.length > 0 && (
        <ul className="nav-children ml-6 border-l border-gray-200">
          {item.children.map(renderNavItem)}
        </ul>
      )}
    </li>
  );

  // Group items by category
  const groupedItems = navigationItems.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <nav className="sidebar-navigation w-64 bg-white shadow-xl min-h-screen border-r border-gray-200">
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
        {Object.entries(groupedItems)
          .sort(([a], [b]) => {
            const order = { 'General': 1, 'Administration': 2, 'Reconciliation': 3, 'Worker': 4, 'Employer': 5, 'Board': 6, 'Reporting': 7 };
            return (order[a] || 99) - (order[b] || 99);
          })
          .map(([category, items]) => (
            <div key={category} className="nav-category mb-6">
              <h3 className="nav-category-title px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {category}
              </h3>
              <ul className="nav-list space-y-1">
                {items
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                  .map(renderNavItem)
                }
              </ul>
            </div>
          ))
        }
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <button 
          onClick={() => {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }}
          className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="mr-3">🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
