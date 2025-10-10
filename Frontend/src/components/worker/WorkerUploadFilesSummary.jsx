import React, { useEffect, useState } from 'react';
import WorkerApi from '../../api/workerApi';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_SORT_BY = 'uploadDate';
const DEFAULT_SORT_DIR = 'desc';
const todayStr = new Date().toISOString().slice(0, 10);

const WorkerUploadFilesSummary = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT_BY);
  const [sortDir, setSortDir] = useState(DEFAULT_SORT_DIR);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [page, pageSize, startDate, endDate, sortBy, sortDir]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await WorkerApi.getFilesSummaries({
        page,
        size: pageSize,
        startDate,
        endDate,
        sortBy,
        sortDir,
      });
      setData(response.data || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError('Failed to load file summaries');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      await WorkerApi.uploadWorkerFile(file);
      fetchData();
    } catch (err) {
      setUploadError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Uploaded Worker Files</h2>
        <div>
          <label className="btn-primary cursor-pointer">
            {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
          {uploadError && <div className="text-red-600 text-sm mt-1">{uploadError}</div>}
        </div>
      </div>
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
              <th className="px-4 py-2">Total Records</th>
              <th className="px-4 py-2">Uploaded</th>
              <th className="px-4 py-2">Validated</th>
              <th className="px-4 py-2">Rejected</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Upload Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No files found</td></tr>
            ) : (
              data.map(row => (
                <tr key={row.fileId}>
                  <td className="px-4 py-2">{row.fileName}</td>
                  <td className="px-4 py-2">{row.totalRecords}</td>
                  <td className="px-4 py-2">{row.statusSummary?.UPLOADED || 0}</td>
                  <td className="px-4 py-2">{row.statusSummary?.VALIDATED || 0}</td>
                  <td className="px-4 py-2">{row.statusSummary?.REJECTED || 0}</td>
                  <td className="px-4 py-2">{row.overallStatus}</td>
                  <td className="px-4 py-2">{row.uploadDate}</td>
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

export default WorkerUploadFilesSummary;
