import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicTable from '../core/DynamicTable';
import { useAuth } from '../../contexts/AuthContext';

const BoardReceiptsPage = () => {
  const { capabilities } = useAuth();
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Find the endpoint for Board Receipts from backend config
  const boardReceiptsPage = capabilities.pages?.find(
    (p) => p.path === '/board-receipts' && Array.isArray(p.actions)
  );
  const listAction = boardReceiptsPage?.actions?.find(
    (a) => a.capability === 'BOARD.RECEIPTS' && a.endpoint
  );
  const endpoint = listAction?.endpoint ? {
    method: listAction.endpoint.method || 'GET',
    path: listAction.endpoint.path
  } : null;

  useEffect(() => {
    if (endpoint) {
      setEndpoints([endpoint]);
      setLoading(false);
    } else {
      setEndpoints([]);
      setLoading(false);
    }
  }, [endpoint]);

  if (loading) return <div>Loading...</div>;
  if (!endpoints.length) return <div>No endpoint configured for Board Receipts.</div>;

  const mainEndpoint = endpoints[0];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Board Receipts</h1>
      {mainEndpoint ? (
        <DynamicTable endpoint={mainEndpoint} />
      ) : (
        <div>No endpoint found for this page.</div>
      )}
    </div>
  );
};

export default BoardReceiptsPage;
