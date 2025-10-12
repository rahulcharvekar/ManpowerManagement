


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const WorkerList = () => {
  const { capabilities } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [previousPageToken, setPreviousPageToken] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [status, setStatus] = useState('');
  const [sortByColumn, setSortByColumn] = useState('string');

  // Find the page for Worker Uploaded Data from backend config
  const workerListPage = capabilities.pages.find(
    (p) => p.path === '/worker/uploaded-data' && Array.isArray(p.actions)
  );
  console.log('WorkerList: capabilities.pages', capabilities.pages);
  console.log('WorkerList: workerListPage', workerListPage);
  const pageId = workerListPage?.id;

  const [endpoints, setEndpoints] = useState([]);
  const [endpointLoading, setEndpointLoading] = useState(false);


  useEffect(() => {
    if (!pageId) return;
    setEndpointLoading(true);
    const token = localStorage.getItem('authToken');
    axios.get(`/api/meta/endpoints?page_id=${pageId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        console.log('WorkerList: endpoints response', res.data);
        setEndpoints(res.data.endpoints || []);
      })
      .catch(err => {
        console.log('WorkerList: endpoints error', err);
        setEndpoints([]);
      })
      .finally(() => setEndpointLoading(false));
  }, [pageId]);

  const endpoint = endpoints[0];
  const endpointPath = endpoint?.path;
  const endpointMethod = endpoint?.method || 'GET';

  useEffect(() => {
    if (!endpointPath) return;
    fetchData();
    // eslint-disable-next-line
  }, [endpointPath, pageToken, pageSize, startDate, endDate, sortBy, sortDir, status, sortByColumn]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      let url = endpointPath.startsWith('http') ? endpointPath : `${API_BASE_URL}${endpointPath}`;
      const body = {
        startDate,
        endDate,
        size: pageSize,
        sortBy,
        sortDir,
        status,
        sortByColumn
      };
      if (pageToken) body.pageToken = pageToken;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error('Failed to fetch worker list');
      const result = await response.json();
      setData(result.content || result.data || result.results || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
      setCurrentPage(result.currentPage || 0);
      setNextPageToken(result.nextPageToken || null);
      setPreviousPageToken(result.previousPageToken || null);
      setHasNext(result.hasNext || false);
      setHasPrevious(result.hasPrevious || false);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker List</h1>
      {!endpointPath && !endpointLoading && (
        <div className="text-red-600">No endpoint configured for Worker List.</div>
      )}
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <input type="text" value={status} onChange={e => setStatus(e.target.value)} className="form-input" />
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Render columns dynamically if possible */}
                {data[0] && Object.keys(data[0]).map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8">No data found</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-4 py-2 whitespace-nowrap text-sm">{String(val)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Page {currentPage + 1} of {totalPages} | Total: {totalElements}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPageToken(previousPageToken)} disabled={!hasPrevious} className="btn-outline btn-sm">Previous</button>
          <button onClick={() => setPageToken(nextPageToken)} disabled={!hasNext} className="btn-outline btn-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default WorkerList;

