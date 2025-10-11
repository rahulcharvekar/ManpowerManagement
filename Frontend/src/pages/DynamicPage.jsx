import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicTable from '../components/core/DynamicTable';

const DynamicPage = ({ page }) => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!page) return;
    setLoading(true);
    const token = localStorage.getItem('authToken');
    axios.get(`/api/meta/endpoints?page_id=${page.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setEndpoints(res.data.endpoints || []))
      .catch(err => setEndpoints([]))
      .finally(() => setLoading(false));
  }, [page]);

  if (!page) return <div>Select a page from the menu.</div>;
  if (loading) return <div>Loading...</div>;
  if (!endpoints.length) return <div>No endpoints available for this page.</div>;

  // Use the first endpoint for now (or enhance logic as needed)
  const mainEndpoint = endpoints[0];

  return (
    <div>
      <h2>{page.name}</h2>
      {mainEndpoint ? (
        <DynamicTable endpoint={mainEndpoint} />
      ) : (
        <div>No endpoint found for this page.</div>
      )}
    </div>
  );
};

export default DynamicPage;
