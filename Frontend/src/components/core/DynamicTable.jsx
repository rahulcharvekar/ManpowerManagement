import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DynamicTable.css';

const DynamicTable = ({ endpoint }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        let response;
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        if (endpoint.method === 'GET') {
          response = await axios.get(endpoint.path, { headers, params: { page, size: pageSize } });
        } else if (endpoint.method === 'POST') {
          const today = new Date().toISOString().slice(0, 10);
          response = await axios.post(
            endpoint.path,
            {
              startDate: today,
              endDate: today,
              page,
              size: pageSize,
              sortBy: 'createdAt',
              sortDir: 'desc',
              sessionToken: 'string'
            },
            { headers }
          );
        }
        setRawResponse(response.data);
        setData(response.data.content || response.data.data || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setError(null);
      } catch (e) {
        setError(e.message || 'API error');
        setRawResponse(e.response?.data || null);
        setData([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, page, pageSize]);


  if (loading) return <div>Loading table...</div>;
  if (error) return <div style={{ color: 'red' }}>API Error: {error}<pre style={{ fontSize: 12, color: '#333', background: '#f8f8f8', padding: 8, overflowX: 'auto' }}>{rawResponse ? JSON.stringify(rawResponse, null, 2) : null}</pre></div>;
  if (!data.length) return <div>No data found.<pre style={{ fontSize: 12, color: '#333', background: '#f8f8f8', padding: 8, overflowX: 'auto' }}>{rawResponse ? JSON.stringify(rawResponse, null, 2) : null}</pre></div>;

  const columns = Object.keys(data[0] || {});
  return (
    <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
      <table className="dynamic-table" style={{ minWidth: 600, borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ background: '#f3f4f6' }}>
          <tr>
            {columns.map(col => <th key={col} style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>{col}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map(col => <td key={col} style={{ padding: 8, border: '1px solid #e5e7eb' }}>{String(row[col])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <div style={{ fontSize: 14, color: '#555' }}>
          Page {page + 1} of {totalPages} | Total: {totalElements}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPage(page - 1)} disabled={page === 0} style={{ padding: '4px 12px' }}>Previous</button>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1} style={{ padding: '4px 12px' }}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
