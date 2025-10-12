import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DynamicPage from '../common/DynamicPage';

const WorkerUploadFilesSummary = () => {
  const { capabilities } = useAuth();

  // Find the page for Worker File Summary from backend config
  const workerSummaryPage = capabilities.pages.find(p => p.path === '/worker/file-summary');
  const pageId = workerSummaryPage?.id;

  if (!pageId) {
    return <div>Loading page configuration...</div>;
  }

  return <DynamicPage 
    pageId={pageId} 
    sortConfig={{
      useServerSideSorting: false, // Keep client-side sorting for file summaries
      defaultSortField: 'id'
    }}
  />;
};

export default WorkerUploadFilesSummary;
