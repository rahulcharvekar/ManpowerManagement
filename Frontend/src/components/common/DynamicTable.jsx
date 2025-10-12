import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/apiConfig';
import useTableSort from '../../hooks/useTableSort';

const DynamicTable = ({ apiPath, uiType, sortConfig = {} }) => {
  const { useServerSideSorting = false, defaultSortField = 'id', allowedSortFields = [] } = sortConfig;
  const todayStr = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState([]);
  const { sortedData, handleSort: clientHandleSort } = useTableSort(data);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageToken, setPageToken] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [previousPageToken, setPreviousPageToken] = useState(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [status, setStatus] = useState('');
  const [sortField, setSortField] = useState(() => defaultSortField);
  const [sortDirection, setSortDirection] = useState('asc');

  // Reset sort state when sortConfig changes
  useEffect(() => {
    setSortField(defaultSortField);
    setSortDirection('asc');
  }, [defaultSortField]);

  useEffect(() => {
    if (apiPath) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [apiPath, pageToken, pageSize, startDate, endDate, status, ...(useServerSideSorting ? [sortField, sortDirection] : [])]);

  const fetchData = async () => {
    if (!apiPath) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const params = {
        pageToken: pageToken || undefined,
        startDate,
        endDate,
        size: pageSize,
        sortBy: useServerSideSorting ? sortField : undefined,
        sortDir: useServerSideSorting ? sortDirection : undefined,
        status: status || undefined,
        sortByColumn: useServerSideSorting ? sortField : undefined
      };
      const result = await apiClient.post(apiPath, params, token);
      setData(result.content || result.data || result.results || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
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

  const handleSort = (col) => {
    if (useServerSideSorting) {
      // Server-side sorting
      if (allowedSortFields.length > 0 && !allowedSortFields.includes(col)) {
        setError(`Invalid sort field: ${col}. Allowed fields: [${allowedSortFields.join(', ')}]`);
        return;
      }
      if (sortField === col) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortField(col);
        setSortDirection('asc');
      }
    } else {
      // Client-side sorting
      clientHandleSort(col);
    }
  };

  return (
    <div className="p-6">
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
        <div>
          <label className="block text-sm font-medium">Page Size</label>
          <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="form-input">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
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
                {data[0] && Object.keys(data[0]).map((col) => (
                  <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort(col)}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(useServerSideSorting ? data : sortedData).length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8">No data found</td></tr>
              ) : (
                (useServerSideSorting ? data : sortedData).map((row, idx) => (
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
          Total: {totalElements}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPageToken(previousPageToken)} disabled={!hasPrevious} className="btn-outline btn-sm">Previous</button>
          <button onClick={() => setPageToken(nextPageToken)} disabled={!hasNext} className="btn-outline btn-sm">Next</button>
        </div>
      </div>
    </div>
  );
};

export default DynamicTable;
