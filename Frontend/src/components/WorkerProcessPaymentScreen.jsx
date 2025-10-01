import { useState, useEffect } from 'react';

function WorkerProcessPaymentScreen({ onGoBack }) {
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
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal states for viewing payment details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [sendingToBank, setSendingToBank] = useState(false);
  
  // Pagination for payment details modal
  const [detailsCurrentPage, setDetailsCurrentPage] = useState(0);
  const [detailsTotalPages, setDetailsTotalPages] = useState(0);
  const [detailsTotalElements, setDetailsTotalElements] = useState(0);
  
  // Filter states - default startDate to current date
  const [filters, setFilters] = useState({
    startDate: formatDateForAPI(new Date()),
    endDate: '',
    status: 'ALL'
  });

  // Fetch worker receipts
  const fetchWorkerReceipts = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Import the API function
      const { getWorkerReceipts } = await import('../api/workerPayments.js');

      // Prepare filter parameters
      const filterParams = {
        page: page,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'desc',
        startDate: filters.startDate,
        endDate: filters.endDate || undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined
      };

      const result = await getWorkerReceipts(page, 20, filterParams);
      
      setReceipts(result.receipts || []);
      setTotalPages(result.totalPages || 0);
      setTotalElements(result.totalElements || 0);
      setCurrentPage(result.currentPage || 0);

    } catch (error) {
      console.error('Error fetching worker receipts:', error);
      setError(error.message || 'Failed to fetch worker receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load receipts on component mount and filter changes
  useEffect(() => {
    fetchWorkerReceipts(0);
  }, [filters.startDate, filters.endDate, filters.status]);

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
      fetchWorkerReceipts(newPage);
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

  // Handle viewing payment details
  const handleViewDetails = async (receipt) => {
    setSelectedReceipt(receipt);
    setShowDetailsModal(true);
    setDetailsCurrentPage(0);
    await fetchPaymentDetails(receipt.receiptNumber, 0);
  };

  // Fetch payment details with pagination
  const fetchPaymentDetails = async (receiptNumber, page = 0) => {
    try {
      setDetailsLoading(true);
      setDetailsError(null);

      // Import the API function
      const { getWorkerPaymentsByReceiptNumber } = await import('../api/workerPayments.js');
      
      const result = await getWorkerPaymentsByReceiptNumber(receiptNumber, page, 20);
      
      setPaymentDetails(result.content || []);
      setDetailsTotalPages(result.totalPages || 0);
      setDetailsTotalElements(result.totalElements || 0);
      setDetailsCurrentPage(result.number || 0);

    } catch (error) {
      console.error('Error fetching payment details:', error);
      setDetailsError(error.message || 'Failed to fetch payment details');
      setPaymentDetails([]);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle pagination for payment details
  const handleDetailsPageChange = (newPage) => {
    if (newPage >= 0 && newPage < detailsTotalPages && selectedReceipt) {
      fetchPaymentDetails(selectedReceipt.receiptNumber, newPage);
    }
  };

  // Handle sending receipt to bank
  const handleSendToBank = async (receiptNumber) => {
    if (!window.confirm('Are you sure you want to send this receipt to the bank?')) {
      return;
    }

    try {
      setSendingToBank(true);
      
      // Import the API function
      const { sendWorkerReceiptToEmployer } = await import('../api/workerPayments.js');
      
      const result = await sendWorkerReceiptToEmployer(receiptNumber);
      alert(`Receipt sent successfully! Employer Receipt Number: ${result.employerReceiptNumber}`);
      
      // Refresh the receipts list
      fetchWorkerReceipts(currentPage);

    } catch (error) {
      console.error('Error sending receipt to bank:', error);
      alert(`Failed to send receipt to bank: ${error.message}`);
    } finally {
      setSendingToBank(false);
    }
  };

  // Close details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedReceipt(null);
    setPaymentDetails([]);
    setDetailsError(null);
    setDetailsCurrentPage(0);
    setDetailsTotalPages(0);
    setDetailsTotalElements(0);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Process Payment Requests</h1>
                <p className="text-gray-600 text-sm">View and manage worker payment requests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Payment Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="GENERATED">Generated</option>
                <option value="PAYMENT_PROCESSED">Payment Processed</option>
                <option value="PAYMENT_INITIATED">Payment Initiated</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {receipts.length} of {totalElements} payment requests
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages}
            </div>
          </div>
        </div>

        {/* Payment Requests Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading payment requests...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Error loading payment requests</p>
              <p className="text-gray-600 text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchWorkerReceipts(currentPage)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 font-medium">No payment requests found</p>
              <p className="text-gray-500 text-sm mt-1">No payment requests found for the selected date range</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Records
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {receipts.map((receipt, index) => (
                      <tr key={receipt.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {receipt.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{receipt.receiptNumber}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDisplayDate(receipt.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {receipt.totalRecords}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{receipt.totalAmount?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(receipt.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => handleViewDetails(receipt)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden">
                {receipts.map((receipt, index) => (
                  <div key={receipt.id || index} className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">{receipt.receiptNumber}</span>
                      </div>
                      {getStatusBadge(receipt.status)}
                    </div>
                    <div className="text-xs text-gray-500 space-y-1 mb-3">
                      <div>Receipt ID: <span className="font-mono">{receipt.id}</span></div>
                      <div>Created: {formatDisplayDate(receipt.createdAt)}</div>
                      <div>Records: {receipt.totalRecords}</div>
                      <div>Amount: ₹{receipt.totalAmount?.toFixed(2) || '0.00'}</div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleViewDetails(receipt)}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
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
                    : 'bg-blue-600 text-white hover:bg-blue-700'
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
                          ? 'bg-blue-600 text-white'
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
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Payment Details</h3>
                  <p className="text-blue-100 text-sm">
                    Receipt: {selectedReceipt?.receiptNumber}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {selectedReceipt?.status === 'GENERATED' && (
                    <button
                      onClick={() => handleSendToBank(selectedReceipt.receiptNumber)}
                      disabled={sendingToBank}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        sendingToBank
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                      }`}
                    >
                      {sendingToBank ? 'Sending...' : 'Send To Bank'}
                    </button>
                  )}
                  <button
                    onClick={handleCloseDetailsModal}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading payment details...</span>
                </div>
              ) : detailsError ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-2">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">Error loading payment details</p>
                  <p className="text-gray-600 text-sm mt-1">{detailsError}</p>
                </div>
              ) : paymentDetails.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 font-medium">No payment details found</p>
                </div>
              ) : (
                <>
                  {/* Receipt Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Records:</span>
                        <div className="font-semibold">{selectedReceipt?.totalRecords}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Amount:</span>
                        <div className="font-semibold">₹{selectedReceipt?.totalAmount?.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div>{getStatusBadge(selectedReceipt?.status)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <div className="font-semibold">{formatDisplayDate(selectedReceipt?.createdAt)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pagination Summary */}
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        Showing {paymentDetails.length} of {detailsTotalElements} payment records
                      </div>
                      <div>
                        Page {detailsCurrentPage + 1} of {detailsTotalPages}
                      </div>
                    </div>
                  </div>

                  {/* Payment Details Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Worker Ref
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Toli
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Bank Account
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Request Ref
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentDetails.map((payment, index) => (
                          <tr key={payment.id || index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">
                              {payment.workerRef}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                              {payment.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                              {payment.toli}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900 border-b">
                              {payment.bankAccount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 border-b">
                              ₹{payment.paymentAmount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-700 border-b">
                              {payment.requestReferenceNumber}
                            </td>
                            <td className="px-4 py-3 text-sm border-b">
                              {getStatusBadge(payment.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4">
              {/* Pagination Controls */}
              {detailsTotalPages > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleDetailsPageChange(detailsCurrentPage - 1)}
                    disabled={detailsCurrentPage === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      detailsCurrentPage === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, detailsTotalPages) }, (_, i) => {
                      const pageNum = detailsCurrentPage < 3 ? i : detailsCurrentPage - 2 + i;
                      if (pageNum >= detailsTotalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handleDetailsPageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === detailsCurrentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handleDetailsPageChange(detailsCurrentPage + 1)}
                    disabled={detailsCurrentPage >= detailsTotalPages - 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      detailsCurrentPage >= detailsTotalPages - 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
              
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCloseDetailsModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkerProcessPaymentScreen;
