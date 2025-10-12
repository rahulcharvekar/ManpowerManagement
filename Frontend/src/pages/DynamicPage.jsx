import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DynamicTable from '../components/core/DynamicTable';

const DynamicPage = ({ page }) => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!page) return;
    console.log('DynamicPage: page', page);
    console.log('DynamicPage: calling /api/meta/endpoints?page_id=' + page.id);
    setLoading(true);
    const token = localStorage.getItem('authToken');
    axios.get(`/api/meta/endpoints?page_id=${page.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        console.log('DynamicPage: response', res.data);
        console.log('DynamicPage: endpoints', res.data.endpoints);
        setEndpoints(res.data.endpoints || []);
      })
      .catch(err => {
        console.log('DynamicPage: error', err);
        setEndpoints([]);
      })
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
      <div style={{ marginBottom: 16 }}>
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label style={{ marginLeft: 16 }}>End Date: </label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      {mainEndpoint ? (
        <DynamicTable endpoint={mainEndpoint} startDate={startDate} endDate={endDate} />
      ) : (
        <div>No endpoint found for this page.</div>
      )}
    </div>
  );
};

export default DynamicPage;
