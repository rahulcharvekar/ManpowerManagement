import { useState, useEffect } from 'react';
import { 
  getBoardReceiptsPaginated, 
  processBoardReceipt, 
  getEmployerReceiptsByEmpRef 
} from '../api/workerPayments';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function BoardDashboard({ onGoBack }) {
  // State for board receipts view
  const [receipts, setReceipts] = useState([]);
  const [receiptsData, setReceiptsData] = useState(null);
  const [receiptsPage, setReceiptsPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for employer receipts view
  const [employerReceipts, setEmployerReceipts] = useState([]);
  const [employerReceiptsData, setEmployerReceiptsData] = useState(null);
  const [employerReceiptsPage, setEmployerReceiptsPage] = useState(0);
  const [loadingEmployerReceipts, setLoadingEmployerReceipts] = useState(false);
  const [selectedBoardReceipt, setSelectedBoardReceipt] = useState(null);

  // View state
  const [currentView, setCurrentView] = useState('receipts'); // 'receipts' or 'employerReceipts'

  // Reconciliation state
  const [reconciliationResult, setReconciliationResult] = useState(null);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  
  // Payment processing state
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processedFileUrl, setProcessedFileUrl] = useState(null);
  
  // Storage for processed payment reports by transaction reference
  const [processedReports, setProcessedReports] = useState(new Map());

  // Filter state
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: ''
  });

  // Load board receipts
  const loadBoardReceipts = async (page = 0) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await getBoardReceiptsPaginated(
        filters.startDate,
        filters.endDate,
        filters.status,
        page
      );
      
      if (data && data.content) {
        setReceipts(data.content);
        setReceiptsData(data);
        setReceiptsPage(page);
      } else {
        setReceipts([]);
        setReceiptsData(null);
      }
    } catch (err) {
      console.error('Error loading board receipts:', err);
      setError('Failed to load board receipts. Please try again.');
      setReceipts([]);
      setReceiptsData(null);
    } finally {
      setLoading(false);
    }
  };

  // Load employer receipts by employer reference
  const loadEmployerReceipts = async (employerRef, page = 0) => {
    setLoadingEmployerReceipts(true);
    
    try {
      const data = await getEmployerReceiptsByEmpRef(employerRef, page);
      
      if (data && data.content) {
        setEmployerReceipts(data.content);
        setEmployerReceiptsData(data);
        setEmployerReceiptsPage(page);
      } else {
        setEmployerReceipts([]);
        setEmployerReceiptsData(null);
      }
    } catch (err) {
      console.error('Error loading employer receipts:', err);
      setEmployerReceipts([]);
      setEmployerReceiptsData(null);
    } finally {
      setLoadingEmployerReceipts(false);
    }
  };

  // Handle view details - switch to employer receipts view
  const handleViewDetails = async (receipt) => {
    setSelectedBoardReceipt(receipt);
    setCurrentView('employerReceipts');
    await loadEmployerReceipts(receipt.employerRef);
  };

  // Handle back to board receipts
  const handleBackToBoard = () => {
    setCurrentView('receipts');
    setSelectedBoardReceipt(null);
    setEmployerReceipts([]);
    setEmployerReceiptsData(null);
  };

  // Handle reconcile with bank
  const handleReconcileWithBank = async (receipt) => {
    if (!receipt.transactionReference || !receipt.totalAmount) {
      alert('Transaction reference and amount are required for reconciliation');
      return;
    }

    setReconciliationLoading(true);
    setProcessedFileUrl(null); // Reset processed file URL
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/reconciliations/mt940?txnRef=${encodeURIComponent(receipt.transactionReference)}&amount=${receipt.totalAmount}`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json'
          },
          body: ''
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setReconciliationResult(result);
      setShowReconciliationModal(true);
      
    } catch (error) {
      console.error('Error during reconciliation:', error);
      setReconciliationResult({
        error: true,
        message: `Failed to reconcile: ${error.message}`,
        transactionReference: receipt.transactionReference,
        requestAmount: receipt.totalAmount
      });
      setShowReconciliationModal(true);
    } finally {
      setReconciliationLoading(false);
    }
  };

  // Handle payment processing
  const handleProcessPayment = async () => {
    if (!reconciliationResult?.transactionReference) {
      alert('Transaction reference is required for payment processing');
      return;
    }

    setPaymentProcessing(true);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/payment-processing/process-and-report/${encodeURIComponent(reconciliationResult.transactionReference)}?processedBy=RAHUL`,
        {
          method: 'POST',
          headers: {
            'accept': '*/*'
          },
          body: ''
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle file response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setProcessedFileUrl(url);
      
      // Store the processed report for this transaction reference
      setProcessedReports(prev => {
        const newMap = new Map(prev.set(reconciliationResult.transactionReference, url));
        // Persist to localStorage
        try {
          localStorage.setItem('processedPaymentReports', JSON.stringify([...newMap]));
        } catch (error) {
          console.warn('Failed to save payment reports to localStorage:', error);
        }
        return newMap;
      });
      
    } catch (error) {
      console.error('Error during payment processing:', error);
      alert(`Failed to process payment: ${error.message}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle board receipt processing
  const handleProcessReceipt = async (boardRef) => {
    try {
      setLoading(true);
      await processBoardReceipt(boardRef);
      
      // Reload the current page to reflect changes
      await loadBoardReceipts(receiptsPage);
    } catch (err) {
      console.error('Error processing board receipt:', err);
      setError('Failed to process board receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    loadBoardReceipts(newPage);
  };

  const handleEmployerReceiptsPageChange = (newPage) => {
    if (selectedBoardReceipt) {
      loadEmployerReceipts(selectedBoardReceipt.employerRef, newPage);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setReceiptsPage(0);
  };

  // Auto-apply filters when filters change
  useEffect(() => {
    loadBoardReceipts(0);
  }, [filters]);

  // Load initial data
  useEffect(() => {
    // Initial load is handled by the filters useEffect above
    
    // Initialize processed reports from localStorage
    try {
      const storedReports = localStorage.getItem('processedPaymentReports');
      if (storedReports) {
        const reportsData = JSON.parse(storedReports);
        setProcessedReports(new Map(reportsData));
      }
    } catch (error) {
      console.warn('Failed to load stored payment reports:', error);
    }
  }, []);

  // Check if payment processing is completed and should show report link instead of reconcile button
  const isPaymentProcessingCompleted = (receipt) => {
    // Check if board receipt status is PROCESSED and employer receipt status is ACCEPTED
    const boardReceiptProcessed = selectedBoardReceipt?.status === 'PROCESSED';
    const employerReceiptAccepted = receipt?.status === 'ACCEPTED';
    
    return boardReceiptProcessed && employerReceiptAccepted;
  };

  // Get stored payment report URL for a transaction reference
  const getStoredPaymentReportUrl = (transactionRef) => {
    return processedReports.get(transactionRef);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSED': 'bg-green-100 text-green-800',
      'FAILED': 'bg-red-100 text-red-800',
      'VALIDATED': 'bg-blue-100 text-blue-800',
      'FINALIZED': 'bg-purple-100 text-purple-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onGoBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {currentView === 'receipts' ? 'Board Dashboard' : 'Employer Receipts Details'}
                </h1>
                <p className="text-orange-100">
                  {currentView === 'receipts' 
                    ? (filters.startDate === filters.endDate 
                        ? `Board receipts for ${filters.startDate}`
                        : `Board receipts from ${filters.startDate} to ${filters.endDate}`)
                    : `Employer receipts for ${selectedBoardReceipt?.employerRef || selectedBoardReceipt?.boardRef}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentView === 'receipts' && (
                <button
                  onClick={() => loadBoardReceipts(receiptsPage)}
                  className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              )}

              {currentView === 'employerReceipts' && (
                <button
                  onClick={handleBackToBoard}
                  className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Board
                </button>
              )}

              <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-white">Board</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          
          {/* Board Receipts View */}
          {currentView === 'receipts' && (
            <div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSED">Processed</option>
                      <option value="FAILED">Failed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Board Receipts Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Board Receipts</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {loading ? 'Loading...' : `Showing ${receipts.length} of ${receiptsData?.totalElements || 0} receipts`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
                    <span className="ml-4 text-gray-600">Loading board receipts...</span>
                  </div>
                )}

                {/* Content */}
                {!loading && (
                  <div>
                    {receipts.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Board Receipts Found</h3>
                        <p className="text-gray-500">
                          No board receipts found for the selected date range and filters.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Board Ref
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {receipt.boardRef}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                  {formatCurrency(receipt.totalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(receipt.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(receipt.status)}`}>
                                    {receipt.status || 'Unknown'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleViewDetails(receipt)}
                                    className="text-orange-600 hover:text-orange-900 font-medium"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination */}
                    {receiptsData && receiptsData.totalPages > 1 && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Showing page {receiptsData.currentPage + 1} of {receiptsData.totalPages}
                            ({receiptsData.totalElements} total receipts)
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePageChange(receiptsPage - 1)}
                              disabled={!receiptsData.hasPrevious}
                              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                              {receiptsPage + 1}
                            </span>
                            <button
                              onClick={() => handlePageChange(receiptsPage + 1)}
                              disabled={!receiptsData.hasNext}
                              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          )}

          {/* Employer Receipts View */}
          {currentView === 'employerReceipts' && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Employer Receipts</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {loadingEmployerReceipts ? 'Loading...' : `Showing ${employerReceipts.length} of ${employerReceiptsData?.totalElements || 0} receipts`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loadingEmployerReceipts && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
                  <span className="ml-4 text-gray-600">Loading employer receipts...</span>
                </div>
              )}

              {/* Content */}
              {!loadingEmployerReceipts && (
                <div>
                  {employerReceipts.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Employer Receipts Found</h3>
                      <p className="text-gray-500">
                        No employer receipts found for this reference.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employer Receipt Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Worker Receipt Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction Ref
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employerReceipts.map((receipt, index) => (
                            <tr key={receipt.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {receipt.employerReceiptNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {receipt.workerReceiptNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                {formatCurrency(receipt.totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {receipt.transactionReference || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {isPaymentProcessingCompleted(receipt) ? (
                                  // Show payment report link if processing is completed
                                  getStoredPaymentReportUrl(receipt.transactionReference) ? (
                                    <a
                                      href={getStoredPaymentReportUrl(receipt.transactionReference)}
                                      download={`payment_report_${receipt.transactionReference}.pdf`}
                                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Download Report
                                    </a>
                                  ) : (
                                    <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Processing Completed
                                    </span>
                                  )
                                ) : (
                                  // Show reconcile button if processing is not completed
                                  <button
                                    onClick={() => handleReconcileWithBank(receipt)}
                                    disabled={reconciliationLoading}
                                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {reconciliationLoading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                    )}
                                    {reconciliationLoading ? 'Reconciling...' : 'Reconcile with Bank'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination for Employer Receipts */}
                  {employerReceiptsData && employerReceiptsData.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing page {employerReceiptsData.currentPage + 1} of {employerReceiptsData.totalPages}
                          ({employerReceiptsData.totalElements} total receipts)
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEmployerReceiptsPageChange(employerReceiptsPage - 1)}
                            disabled={!employerReceiptsData.hasPrevious}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                            {employerReceiptsPage + 1}
                          </span>
                          <button
                            onClick={() => handleEmployerReceiptsPageChange(employerReceiptsPage + 1)}
                            disabled={!employerReceiptsData.hasNext}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
          )}
        </div>
      </div>

      {/* Reconciliation Modal */}
      {showReconciliationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-rose-700 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Bank Reconciliation Result</h3>
                <button
                  onClick={() => {
                    setShowReconciliationModal(false);
                    setProcessedFileUrl(null);
                    setReconciliationResult(null);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {reconciliationResult?.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 15c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-red-800 font-semibold">Reconciliation Failed</h4>
                      <p className="text-red-700 mt-1">{reconciliationResult.message}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-center mb-4">
                    <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-full ${
                      reconciliationResult?.status === 'RECONCILED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reconciliationResult?.status || 'UNKNOWN'}
                    </span>
                  </div>

                  {/* Message */}
                  {reconciliationResult?.message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-blue-800">{reconciliationResult.message}</p>
                    </div>
                  )}

                  {/* Reconciliation Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Request Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Transaction Ref:</span>
                          <span className="ml-2 font-medium">{reconciliationResult?.transactionReference || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Request Amount:</span>
                          <span className="ml-2 font-medium">{formatCurrency(reconciliationResult?.requestAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">MT940 Bank Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Bank Ref:</span>
                          <span className="ml-2 font-medium">{reconciliationResult?.mt940TransactionReference || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bank Amount:</span>
                          <span className="ml-2 font-medium">{reconciliationResult?.mt940Amount ? formatCurrency(reconciliationResult.mt940Amount) : '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Value Date:</span>
                          <span className="ml-2 font-medium">{reconciliationResult?.mt940ValueDate || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Match Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-gray-700">Amount Match:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reconciliationResult?.amountMatch === 'MATCHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reconciliationResult?.amountMatch || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-gray-700">Reference Match:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        reconciliationResult?.referenceMatch === 'MATCHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {reconciliationResult?.referenceMatch || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Processing Section */}
              {reconciliationResult?.status === 'RECONCILED' && !reconciliationResult?.error && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-green-800 font-semibold mb-3">Payment Processing</h4>
                  
                  {processedFileUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium">Payment processed successfully!</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a
                          href={processedFileUrl}
                          download={`payment_report_${reconciliationResult.transactionReference}.pdf`}
                          className="text-green-600 hover:text-green-800 font-medium underline"
                        >
                          Download Payment Report
                        </a>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleProcessPayment}
                      disabled={paymentProcessing}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentProcessing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      )}
                      {paymentProcessing ? 'Processing Payment...' : 'Process Payment'}
                    </button>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => {
                    setShowReconciliationModal(false);
                    setProcessedFileUrl(null); // Reset file URL when closing
                    setReconciliationResult(null); // Reset reconciliation result
                  }}
                  className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all duration-200"
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

export default BoardDashboard;
