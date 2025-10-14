import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DynamicPage from '../common/DynamicPage';

const UserManagement = () => {
  const { capabilities } = useAuth();

  // Find the page for Admin Users from backend config
  const userManagementPage = capabilities.pages.find(
    (p) => p.path === '/admin/users' && p.ui_type === 'LIST' && Array.isArray(p.actions)
  );
  const pageId = userManagementPage?.id;

  if (!pageId) {
    return <div>Loading page configuration...</div>;
  }

  return <DynamicPage
    pageId={pageId}
    sortConfig={{
      useServerSideSorting: true,
      defaultSortField: 'id',
      allowedSortFields: ['id', 'username', 'email', 'role', 'status', 'createdAt', 'lastLogin']
    }}
  />;
};

export default UserManagement;
