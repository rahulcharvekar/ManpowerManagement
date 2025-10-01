import { useState, useEffect } from 'react';

function WorkerPaymentDetailsScreen({ onGoBack }) {
  // Helper function to format date for API
  const formatDateForAPI = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return new Date().toISOString().split('T')[0];
    }
  };

  // State management
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter states - default to current date
  const [filters, setFilters] = useState({
    status: '',
    receiptNumber: '',
    startDate: formatDateForAPI(new Date()),
    endDate: formatDateForAPI(new Date())
  });

  // Fetch worker payments
  const fetchWorkerPayments = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Import the API function
      const { getWorkerPaymentsWithFilters } = await import('../api/workerPayments.js');

      // Prepare filter parameters
      const filterParams = {
        page: page,
        size: 20,
        sortBy: 'id',
        sortDir: 'desc',
        status: filters.status || undefined,
        receiptNumber: filters.receiptNumber || undefined,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      const result = await getWorkerPaymentsWithFilters(filterParams);
      
      setPayments(result.content || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
      setCurrentPage(result.number || 0);

    } catch (error) {
      console.error('Error fetching worker payments:', error);
      setError(error.message || 'Failed to fetch worker payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount and filter changes
  useEffect(() => {
    fetchWorkerPayments(0);
  }, [filters.status, filters.receiptNumber, filters.startDate, filters.endDate]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchWorkerPayments(newPage);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      'GENERATED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Generated' },
      'PAYMENT_PROCESSED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Payment Processed' },
      'PAYMENT_INITIATED': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Payment Initiated' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Worker Payment Details</h1>
                <p className="text-gray-600 text-sm">View detailed worker payment information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="GENERATED">Generated</option>
                <option value="PAYMENT_PROCESSED">Payment Processed</option>
                <option value="PAYMENT_INITIATED">Payment Initiated</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label htmlFor="receiptNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Number
              </label>
              <input
                type="text"
                id="receiptNumber"
                value={filters.receiptNumber}
                onChange={(e) => handleFilterChange('receiptNumber', e.target.value)}
                placeholder="Enter receipt number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {payments.length} of {totalElements} payments
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading payments...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Error loading payments</p>
              <p className="text-gray-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchWorkerPayments(currentPage)}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No payments found</p>
              <p className="text-gray-500 text-sm mt-1">No payments found for the selected criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Worker Ref
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toli
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Account
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment, index) => (
                      <tr key={payment.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {payment.workerRef}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.toli}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {payment.pan || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {payment.bankAccount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{payment.paymentAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                          {payment.receiptNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(payment.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {payments.map((payment, index) => (
                  <div key={payment.id || index} className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{payment.name}</span>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      <div>Worker Ref: <span className="font-mono">{payment.workerRef}</span></div>
                      <div>Toli: {payment.toli}</div>
                      <div>Amount: ₹{payment.paymentAmount?.toFixed(2) || '0.00'}</div>
                      <div>Receipt: <span className="font-mono">{payment.receiptNumber}</span></div>
                      <div>Created: {formatDisplayDate(payment.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-lg p-4 mt-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage < 3 ? i : currentPage - 2 + i;
                  if (pageNum >= totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage >= totalPages - 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerPaymentDetailsScreen;
