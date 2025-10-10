import React, { useEffect, useState } from 'react';
import WorkerApi from '../../api/workerApi';


const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_DIR = 'desc';
const todayStr = new Date().toISOString().slice(0, 10);

const WorkerUploadPaginatedTable = () => {
  const [data, setData] = useState([]);
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, pageSize, sortBy, sortDir, startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await WorkerApi.getUploadedDataPaginated({
        startDate,
        endDate,
        page,
        size: pageSize,
        sortBy,
        sortDir,
        sessionToken: 'string', // Replace with real session token if needed
      });
      setData(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
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
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('rowNumber')}>Row #</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('workerId')}>Worker ID</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('workerName')}>Name</th>
              <th className="px-4 py-2">Employer</th>
              <th className="px-4 py-2">Toli</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Uploaded At</th>
              <th className="px-4 py-2">Rejection Reason</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8">No data found</td></tr>
            ) : (
              data.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-2">{row.rowNumber}</td>
                  <td className="px-4 py-2">{row.workerId || '-'}</td>
                  <td className="px-4 py-2">{row.workerName || '-'}</td>
                  <td className="px-4 py-2">{row.employerId}</td>
                  <td className="px-4 py-2">{row.toliId}</td>
                  <td className="px-4 py-2">{row.status}</td>
                  <td className="px-4 py-2">{row.createdAt}</td>
                  <td className="px-4 py-2">{row.uploadedAt}</td>
                  <td className="px-4 py-2 text-red-600">{row.rejectionReason || '-'}</td>
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
