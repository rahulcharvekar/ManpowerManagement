import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DynamicTable.css';

const DynamicTable = ({ endpoint, startDate, endDate }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [previousPageToken, setPreviousPageToken] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        let response;
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        if (endpoint.method === 'GET') {
          response = await axios.get(endpoint.path, { headers, params: { page: currentPage, size: pageSize } });
        } else if (endpoint.method === 'POST') {
          const today = new Date().toISOString().slice(0, 10);
          const body = {
            startDate: startDate || today,
            endDate: endDate || today,
            size: pageSize,
            sortBy: 'createdAt',
            sortDir: 'desc',
            status: "",
            sortByColumn: "string"
          };
          if (pageToken) body.pageToken = pageToken;
          response = await axios.post(endpoint.path, body, { headers });
        }
        setRawResponse(response.data);
        setData(response.data.content || response.data.data || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setCurrentPage(response.data.currentPage || 0);
        setNextPageToken(response.data.nextPageToken || null);
        setPreviousPageToken(response.data.previousPageToken || null);
        setHasNext(response.data.hasNext || false);
        setHasPrevious(response.data.hasPrevious || false);
        setError(null);
      } catch (e) {
        setError(e.message || 'API error');
        setRawResponse(e.response?.data || null);
        setData([]);
        setTotalPages(0);
        setTotalElements(0);
        setCurrentPage(0);
        setNextPageToken(null);
        setPreviousPageToken(null);
        setHasNext(false);
        setHasPrevious(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, pageToken, pageSize, startDate, endDate]);


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
          Page {currentPage + 1} of {totalPages} | Total: {totalElements}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPageToken(previousPageToken)} disabled={!hasPrevious} style={{ padding: '4px 12px' }}>Previous</button>
          <button onClick={() => setPageToken(nextPageToken)} disabled={!hasNext} style={{ padding: '4px 12px' }}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
