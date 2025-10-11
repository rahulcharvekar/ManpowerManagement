import React, { useEffect, useState } from 'react';
import axios from 'axios';


const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_DIR = 'desc';
const todayStr = new Date().toISOString().slice(0, 10);

const WorkerUploadPaginatedTable = () => {
  const [data, setData] = useState([]);
  // Removed fileId and status, only startDate and endDate remain
  const [endpoint, setEndpoint] = useState(null);
  const [endpointLoading, setEndpointLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);
  const [sortDir, setSortDir] = useState(DEFAULT_SORT_DIR);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);



  // Fetch endpoint from /api/meta/endpoints for page_id=9
  useEffect(() => {
    setEndpointLoading(true);
    const token = localStorage.getItem('authToken');
    axios.get('/api/meta/endpoints?page_id=9', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => {
        const endpoints = res.data.endpoints || [];
        setEndpoint(endpoints[0] || null);
      })
      .catch(() => setEndpoint(null))
      .finally(() => setEndpointLoading(false));
  }, []);

  // Default startDate and endDate to today
  useEffect(() => {
    setStartDate(todayStr);
    setEndDate(todayStr);
  }, []);

  useEffect(() => {
    if (!endpoint) return;
    fetchData(endpoint);
    // eslint-disable-next-line
  }, [endpoint, page, pageSize, sortBy, sortDir, startDate, endDate]);

  const fetchData = async (endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const params = {
        page,
        size: pageSize,
        startDate,
        endDate,
        sortBy,
        sortDir
      };
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(endpoint.path, {
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } else if (endpoint.method === 'POST') {
        response = await axios.post(endpoint.path, params, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } else {
        throw new Error('Unsupported endpoint method');
      }
  setData(response.data.data || []);
  setTotalPages(response.data.totalPages || 0);
  setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  if (endpointLoading) return <div>Loading endpoint...</div>;
  if (!endpoint) return <div>No endpoint found for this page.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Worker Data (Paginated)</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input" />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input" />
        </div>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">File Name</th>
              <th className="px-4 py-2">File ID</th>
              <th className="px-4 py-2">Upload Date</th>
              <th className="px-4 py-2">Total Records</th>
              <th className="px-4 py-2">Validated</th>
              <th className="px-4 py-2">Uploaded</th>
              <th className="px-4 py-2">Rejected</th>
              <th className="px-4 py-2">Overall Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8">No data found</td></tr>
            ) : (
              data.map((row, idx) => (
                <tr key={row.fileId || idx}>
                  <td className="px-4 py-2">{row.fileName}</td>
                  <td className="px-4 py-2">{row.fileId}</td>
                  <td className="px-4 py-2">{row.uploadDate ? new Date(row.uploadDate).toLocaleString() : '-'}</td>
                  <td className="px-4 py-2">{row.totalRecords}</td>
                  <td className="px-4 py-2">{row.statusSummary?.VALIDATED ?? 0}</td>
                  <td className="px-4 py-2">{row.statusSummary?.UPLOADED ?? 0}</td>
                  <td className="px-4 py-2">{row.statusSummary?.REJECTED ?? 0}</td>
                  <td className="px-4 py-2">{row.overallStatus}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Page {page + 1} of {totalPages} | Total: {totalElements}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 0} className="btn-outline btn-sm">Previous</button>
          <button onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages - 1} className="btn-outline btn-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default WorkerUploadPaginatedTable;
