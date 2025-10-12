

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DynamicPage from '../common/DynamicPage';

const WorkerList = () => {
  const { capabilities } = useAuth();

  // Find the page for Worker Uploaded Data from backend config
  const workerListPage = capabilities.pages.find(
    (p) => p.path === '/worker/uploaded-data' && Array.isArray(p.actions)
  );
  const pageId = workerListPage?.id;

  if (!pageId) {
    return <div>Loading page configuration...</div>;
  }

  return <DynamicPage 
    pageId={pageId} 
    sortConfig={{
      useServerSideSorting: true,
      defaultSortField: 'id',
      allowedSortFields: ['id', 'workerName', 'employerId', 'paymentAmount', 'status', 'createdAt', 'workDate', 'receiptNumber']
    }}
  />;
};

export default WorkerList;
