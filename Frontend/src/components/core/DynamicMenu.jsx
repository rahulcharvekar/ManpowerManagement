import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * DynamicMenu - Renders navigation menu from backend pages configuration
 * Uses the pages array from /api/auth/ui-config response
 * 
 * Structure:
 * - Parent pages (parentId: null) are top-level menu items
 * - Child pages (parentId: <parent_id>) are submenu items
 * - Actions array on pages defines required capabilities
 */
const DynamicMenu = () => {
  const { capabilities, user, loading } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  // Build hierarchical menu structure from flat pages array
  const menuStructure = useMemo(() => {
    console.log('🔍 DynamicMenu - Building menu structure');
    console.log('📊 capabilities:', capabilities);
    console.log('📄 pages:', capabilities?.pages);
    
    if (!capabilities?.pages) {
      console.warn('⚠️ No pages found in capabilities');
      return [];
    }

    const pages = capabilities.pages;
    console.log(`📝 Processing ${pages.length} pages`);
    
    // Group pages by parent
    const pageMap = new Map();
    const parentPages = [];
    const childPages = [];

    pages.forEach(page => {
      pageMap.set(page.id, page);
      if (page.parentId === null) {
        parentPages.push(page);
      } else {
        childPages.push(page);
      }
    });

    console.log(`👨‍👩‍👧 Found ${parentPages.length} parent pages, ${childPages.length} child pages`);

    // Build hierarchy
    const menuTree = parentPages
      .filter(page => page.isMenuItem)
      .map(parent => ({
        ...parent,
        children: childPages
          .filter(child => child.parentId === parent.id && child.isMenuItem)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    console.log('🌲 Built menu tree:', menuTree);
    return menuTree;
  }, [capabilities?.pages]);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const getIcon = (iconName) => {
    const icons = {
      people: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      payments: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      list: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      upload: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    };

    return icons[iconName] || icons.dashboard;
  };

  if (loading) {
    return (
      <div className="w-64 bg-white shadow-xl border-r border-gray-200">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.id);
    const isActive = location.pathname === item.path;
    const isParentActive = hasChildren && item.children.some(child => location.pathname === child.path);

    // Parent menu item (with children)
    if (hasChildren) {
      return (
        <li key={item.id} className="mb-1">
          {/* Parent Header */}
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              isParentActive
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <span className="mr-3">{getIcon(item.icon)}</span>
              <span>{item.name}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'transform rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Children Submenu */}
          {isExpanded && (
            <ul className="ml-4 mt-1 space-y-1">
              {item.children.map(child => (
                <li key={child.id}>
                  <Link
                    to={child.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                      location.pathname === child.path
                        ? 'bg-primary-100 text-primary-700 font-medium border-l-4 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{getIcon(child.icon)}</span>
                    <span>{child.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    // Single menu item (no children)
    return (
      <li key={item.id} className="mb-1">
        <Link
          to={item.path}
          className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500 shadow-sm'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="mr-3">{getIcon(item.icon)}</span>
          <span>{item.name}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav className="w-64 bg-white shadow-xl border-r border-gray-200 h-full flex flex-col">
      {/* User Info Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 flex-1">
            <div className="text-sm font-semibold text-white truncate">
              {user?.username || 'User'}
            </div>
            <div className="text-xs text-white/80">
              {capabilities?.roles?.join(', ') || 'No roles'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {/* Dashboard Link (always first) */}
          <li className="mb-2">
            <Link
              to="/dashboard"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                location.pathname === '/dashboard'
                  ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{getIcon('dashboard')}</span>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* Dynamic Menu Items from Backend */}
          {menuStructure.length > 0 ? (
            menuStructure.map(renderMenuItem)
          ) : (
            <li className="px-4 py-3 text-sm text-gray-500 text-center">
              No menu items available
            </li>
          )}
        </ul>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div>Version: {capabilities?.version || 'N/A'}</div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span>Connected</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DynamicMenu;
