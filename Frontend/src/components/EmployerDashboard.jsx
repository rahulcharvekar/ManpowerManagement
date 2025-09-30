import React, { useState, useEffect } from 'react';
import { getAvailableReceipts, getAvailableReceiptsPaginated, getWorkerPaymentsByWorkerReceiptNumber, validateWorkerReceipt } from '../api/workerPayments';

function EmployerDashboard({ onGoBack }) {
  // Helper function to ensure date is in YYYY-MM-DD format
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

  // Receipts list state
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: formatDateForAPI(new Date()),
    endDate: formatDateForAPI(new Date()),
    status: 'ALL'
  });
  
  // Pagination for receipts
  const [receiptsData, setReceiptsData] = useState(null);
  const [receiptsPage, setReceiptsPage] = useState(0);
  const [receiptsPageSize] = useState(20);
  
  // Worker payments view state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [workerPayments, setWorkerPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedReceiptNumber, setSelectedReceiptNumber] = useState(null);
  const [currentView, setCurrentView] = useState('receipts'); // 'receipts' or 'workerPayments'
  const [paymentsData, setPaymentsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  
  // Validation states
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [transactionReference, setTransactionReference] = useState('');
  const [validatedBy, setValidatedBy] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);
  const [showValidationSuccess, setShowValidationSuccess] = useState(false);
  const [validationResponse, setValidationResponse] = useState(null);

  // Load receipts on component mount
  useEffect(() => {
    loadAvailableReceipts();
  }, []);

  // Load receipts with pagination and filters
  const loadAvailableReceipts = async (page = 0) => {
    setLoading(true);
    setError(null);
    
    try {
      const filterParams = {
        page,
        size: receiptsPageSize,
        status: filters.status,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      // Use single date if start and end dates are the same
      if (filters.startDate === filters.endDate) {
        filterParams.singleDate = filters.startDate;
        delete filterParams.startDate;
        delete filterParams.endDate;
      }

      const response = await getAvailableReceiptsPaginated(filterParams);
      
      // Handle paginated response
      if (response && response.content && Array.isArray(response.content)) {
        setReceiptsData(response);
        setReceipts(response.content);
        setReceiptsPage(page);
      } else {
        console.warn('Unexpected receipts API response format:', response);
        setReceiptsData(null);
        setReceipts([]);
      }
    } catch (error) {
      console.error('Error loading receipts:', error);
      setError(error.message);
      setReceipts([]);
      setReceiptsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  // Apply filters - reload data when filters change
  useEffect(() => {
    if (currentView === 'receipts') {
      loadAvailableReceipts(0);
    }
  }, [filters]);

  // Handle pagination for receipts
  const handleReceiptsPageChange = (newPage) => {
    setReceiptsPage(newPage);
    loadAvailableReceipts(newPage);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'validated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'generated': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to check if a receipt can be validated
  const canValidateReceipt = (receiptStatus, paymentStatuses = []) => {
    const finalizedReceiptStatuses = ['VALIDATED', 'PROCESSED', 'GENERATED', 'COMPLETE', 'COMPLETED'];
    const finalizedPaymentStatuses = ['VALIDATED', 'PROCESSED', 'GENERATED', 'COMPLETE', 'COMPLETED'];
    
    // If receipt is already finalized, can't validate
    if (finalizedReceiptStatuses.includes(receiptStatus?.toUpperCase())) {
      return false;
    }
    
    // If any worker payment is already processed/validated, can't validate
    if (Array.isArray(paymentStatuses) && paymentStatuses.length > 0) {
      const hasProcessedPayments = paymentStatuses.some(status => 
        finalizedPaymentStatuses.includes(status?.toUpperCase())
      );
      if (hasProcessedPayments) {
        return false;
      }
    }
    
    return true;
  };

  // Handle view details - fetch worker payments by worker receipt number
  const handleViewDetails = async (receipt, page = 0) => {
    setLoadingPayments(true);
    setSelectedReceipt(receipt);
    setSelectedReceiptNumber(receipt.workerReceiptNumber);
    setCurrentView('workerPayments');
    setCurrentPage(page);
    
    try {
      const response = await getWorkerPaymentsByWorkerReceiptNumber(receipt.workerReceiptNumber, page, pageSize);
      console.log('Worker payments API response:', response);
      
      // Handle paginated response structure
      if (response && response.content && Array.isArray(response.content)) {
        setPaymentsData(response);
        setWorkerPayments(response.content);
      } else {
        console.warn('Unexpected API response format for worker payments:', response);
        setPaymentsData(null);
        setWorkerPayments([]);
      }
    } catch (error) {
      console.error('Error fetching worker payments:', error);
      setError('Failed to load worker payment details');
      setPaymentsData(null);
      setWorkerPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (selectedReceipt) {
      handleViewDetails(selectedReceipt, newPage);
    }
  };

  // Handle back to receipts
  const handleBackToReceipts = () => {
    setCurrentView('receipts');
    setWorkerPayments([]);
    setPaymentsData(null);
    setSelectedReceiptNumber(null);
    setError(null);
  };

  // Handle validation
  const handleValidation = () => {
    setShowValidationModal(true);
  };

  // Submit validation
  const submitValidation = async () => {
    if (!transactionReference.trim()) {
      alert('Transaction Reference is required');
      return;
    }
    if (!validatedBy.trim()) {
      alert('Validated By is required');
      return;
    }

    setValidationLoading(true);
    try {
      const response = await validateWorkerReceipt(selectedReceiptNumber, transactionReference, validatedBy);
      console.log('Validation response:', response);
      
      // Store the validation response and show success modal
      setValidationResponse(response);
      setShowValidationModal(false);
      setShowValidationSuccess(true);
      setTransactionReference('');
      setValidatedBy('');
      
      // Update the selected receipt status immediately
      if (selectedReceipt) {
        setSelectedReceipt({
          ...selectedReceipt,
          status: 'VALIDATED' // or use response.status if available
        });
      }
      
      // Refresh the receipts list
      loadAvailableReceipts();
    } catch (error) {
      console.error('Error validating receipt:', error);
      alert('Failed to validate receipt: ' + error.message);
    } finally {
      setValidationLoading(false);
    }
  };

  // Handle validation success modal close
  const handleValidationSuccessClose = () => {
    setShowValidationSuccess(false);
    setValidationResponse(null);
    // Refresh the available receipts to get updated status
    loadAvailableReceipts(receiptsPage);
  };

  // Render receipts view with filters and compact grid
  const renderReceiptsView = () => (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VALIDATED">Validated</option>
              <option value="PROCESSED">Processed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generated Receipts Grid */}
      {receipts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-lg text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No receipts found</h3>
          <p className="text-gray-600 mb-6">
            No receipts match the selected filters. Try adjusting the date range or status filter.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Compact Grid Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employer Receipt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receipts.map((receipt, index) => (
                  <tr key={receipt.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receipt.employerReceiptNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {receipt.transactionReference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {receipt.totalRecords || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      {formatCurrency(receipt.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{formatDate(receipt.validatedAt)}</div>
                      {receipt.validatedBy && (
                        <div className="text-xs text-gray-500">By: {receipt.validatedBy}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(receipt.status)}`}>
                        {receipt.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewDetails(receipt)}
                        className="text-emerald-600 hover:text-emerald-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {receiptsData && receiptsData.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {receiptsData.currentPage + 1} of {receiptsData.totalPages} 
                  ({receiptsData.totalElements} total receipts)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReceiptsPageChange(receiptsData.currentPage - 1)}
                    disabled={!receiptsData.hasPrevious}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-gray-700">
                    Page {receiptsData.currentPage + 1}
                  </span>
                  <button
                    onClick={() => handleReceiptsPageChange(receiptsData.currentPage + 1)}
                    disabled={!receiptsData.hasNext}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );  // Render worker payments view
  const renderWorkerPaymentsView = () => (
    <>
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Worker Payments Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {Array.isArray(workerPayments) ? workerPayments.length : 0} of {paymentsData?.totalElements || 0} payments
              </p>
              {selectedReceipt && (
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReceipt.status)}`}>
                    Status: {selectedReceipt.status || 'Unknown'}
                  </span>
                </div>
              )}
            </div>

            {/* Receipt Number Display in Grid Header */}
            {selectedReceiptNumber && (
              <div className="bg-emerald-100 border border-emerald-300 rounded-lg px-4 py-2 mr-4">
                <div className="text-sm font-medium text-emerald-800">Receipt Number</div>
                <div className="text-lg font-bold text-emerald-900">{selectedReceiptNumber}</div>
              </div>
            )}
            
            {/* Only show validate button if receipt can be validated */}
            {selectedReceipt && canValidateReceipt(
              selectedReceipt.status, 
              Array.isArray(workerPayments) ? workerPayments.map(payment => payment.status) : []
            ) && (
              <button
                onClick={handleValidation}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validate Receipt
              </button>
            )}

            {/* Show status message for already processed receipts */}
            {selectedReceipt && !canValidateReceipt(
              selectedReceipt.status, 
              Array.isArray(workerPayments) ? workerPayments.map(payment => payment.status) : []
            ) && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">
                  {(() => {
                    const finalizedStatuses = ['VALIDATED', 'PROCESSED', 'GENERATED', 'COMPLETE', 'COMPLETED'];
                    const receiptFinalized = finalizedStatuses.includes(selectedReceipt.status?.toUpperCase());
                    const paymentStatuses = Array.isArray(workerPayments) ? workerPayments.map(payment => payment.status) : [];
                    const hasProcessedPayments = paymentStatuses.some(status => 
                      finalizedStatuses.includes(status?.toUpperCase())
                    );
                    
                    if (receiptFinalized) {
                      if (selectedReceipt.status === 'VALIDATED') return 'Receipt Already Validated';
                      if (selectedReceipt.status === 'PROCESSED') return 'Receipt Already Processed';
                      if (selectedReceipt.status === 'GENERATED') return 'Receipt Generated & Complete';
                      return 'Receipt Already Finalized';
                    } else if (hasProcessedPayments) {
                      return 'Worker Payments Already Processed - Cannot Validate';
                    }
                    return 'Validation Not Available';
                  })()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {loadingPayments ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <span className="ml-4 text-gray-600">Loading worker payments...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
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
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toli
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PAN
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Validation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(workerPayments) && workerPayments.length > 0 ? (
                      workerPayments.map((payment, index) => (
                        <tr key={payment.id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{payment.workerRef}</div>
                              <div className="text-xs text-gray-500">Bank: {payment.bankAccount || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{payment.name}</div>
                              <div className="text-xs text-gray-500">Aadhar: {payment.aadhar}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">₹{payment.paymentAmount?.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-500">Ref: {payment.requestRefNumber || payment.regId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.toli || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.pan || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              payment.validationStatus === 'Pending validation'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.validationStatus === 'Validated'
                                ? 'bg-green-100 text-green-800'
                                : payment.validationStatus === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.validationStatus || 'Unknown'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                          No worker payment data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paymentsData && paymentsData.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page {paymentsData.number + 1} of {paymentsData.totalPages} 
                    ({paymentsData.totalElements} total records)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={paymentsData.first}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-md">
                      {paymentsData.number + 1}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={paymentsData.last}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={currentView === 'workerPayments' ? handleBackToReceipts : onGoBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {currentView === 'receipts' ? 'Employer Dashboard' : 'Worker Payments Details'}
                </h1>
                <p className="text-emerald-100">
                  {currentView === 'receipts' 
                    ? filters.startDate === filters.endDate 
                      ? `Receipts for ${filters.startDate}`
                      : `Receipts from ${filters.startDate} to ${filters.endDate}`
                    : `Worker Payments for Receipt #${selectedReceiptNumber}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentView === 'receipts' && (
                <button
                  onClick={() => loadAvailableReceipts(receiptsPage)}
                  className="bg-white text-emerald-600 hover:bg-emerald-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              )}

              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-medium text-white">Employer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && currentView === 'receipts' && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            <span className="ml-4 text-gray-600">Loading receipts...</span>
          </div>
        )}

        {/* Conditional View Rendering */}
        {!loading && currentView === 'receipts' && renderReceiptsView()}
        {currentView === 'workerPayments' && renderWorkerPaymentsView()}
      </div>

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Validate Receipt</h3>
                <button
                  onClick={() => {
                    setShowValidationModal(false);
                    setTransactionReference('');
                    setValidatedBy('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Number
                  </label>
                  <input
                    type="text"
                    value={selectedReceiptNumber || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    placeholder="Enter transaction reference number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validated By <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={validatedBy}
                    onChange={(e) => setValidatedBy(e.target.value)}
                    placeholder="Enter validator name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowValidationModal(false);
                      setTransactionReference('');
                      setValidatedBy('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitValidation}
                    disabled={validationLoading || !transactionReference.trim() || !validatedBy.trim()}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validationLoading ? 'Validating...' : 'Validate Receipt'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Success Modal */}
      {showValidationSuccess && validationResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Receipt Validated Successfully!</h3>
                </div>
                <button
                  onClick={handleValidationSuccessClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium text-green-800">{validationResponse.message}</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    The receipt has been validated and sent to the board for processing.
                  </p>
                </div>

                {/* Employer Receipt Number */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-blue-800">Employer Receipt Number</span>
                  </div>
                  <p className="text-blue-900 font-mono text-lg font-bold">
                    {validationResponse.employerReceiptNumber}
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    Please save this number for your records
                  </p>
                </div>

                {/* Validation Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Worker Receipt Number:</span>
                      <div className="text-gray-800 font-mono">{validationResponse.workerReceiptNumber}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Transaction Reference:</span>
                      <div className="text-gray-800 font-mono">{validationResponse.transactionReference}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                      <div className="text-gray-800 font-semibold">{formatCurrency(validationResponse.totalAmount)}</div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Total Records:</span>
                      <div className="text-gray-800">{validationResponse.totalRecords}</div>
                    </div>
                  </div>
                </div>

                {/* Validation Timestamp */}
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Validated At:</span>
                  <div className="text-gray-800">{formatDate(validationResponse.validatedAt)}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleValidationSuccessClose}
                    className="flex-1 btn-primary"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      // Copy employer receipt number to clipboard
                      navigator.clipboard.writeText(validationResponse.employerReceiptNumber);
                      alert('Employer receipt number copied to clipboard!');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Receipt #
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;
