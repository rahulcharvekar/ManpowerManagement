import { useState, useEffect } from "react";
import { getWorkerPaymentReceiptsPaginated, getWorkerPaymentsByRequestNumber } from "../api/workerPayments.js";

function WorkerPaymentScreen({ onGoBack }) {
  const [requests, setRequests] = useState([]);
  const [requestsData, setRequestsData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Details view state
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsPage, setDetailsPage] = useState(0);
  const [detailsPageSize] = useState(20);

  // Current view state
  const [currentView, setCurrentView] = useState('requests'); // 'requests' or 'details'

  // Load all payment requests
  const loadPaymentRequests = async (page = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getWorkerPaymentReceiptsPaginated({
        page,
        size: pageSize,
        status: 'GENERATED' // Only show generated receipts/requests
      });
      
      if (data && data.content) {
        setRequests(data.content);
        setRequestsData(data);
        setCurrentPage(page);
      } else {
        setRequests([]);
        setRequestsData(null);
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      setError(error?.message || 'Failed to load payment requests');
      setRequests([]);
      setRequestsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payment details for a specific request
  const loadPaymentDetails = async (receiptNumber, page = 0) => {
    setIsLoadingDetails(true);
    setError(null);
    
    try {
      const data = await getWorkerPaymentsByRequestNumber(receiptNumber, page, detailsPageSize);
      
      if (data && data.content) {
        setPaymentDetails(data);
        setDetailsPage(page);
      } else {
        setPaymentDetails(null);
      }
    } catch (error) {
      console.error('Error loading payment details:', error);
      setError(error?.message || 'Failed to load payment details');
      setPaymentDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle view details
  const handleViewDetails = async (request) => {
    setSelectedRequest(request);
    setCurrentView('details');
    await loadPaymentDetails(request.workerReceiptNumber, 0);
  };

  // Handle back to requests
  const handleBackToRequests = () => {
    setCurrentView('requests');
    setSelectedRequest(null);
    setPaymentDetails(null);
    setDetailsPage(0);
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    loadPaymentRequests(newPage);
  };

  const handleDetailsPageChange = (newPage) => {
    if (selectedRequest) {
      loadPaymentDetails(selectedRequest.workerReceiptNumber, newPage);
    }
  };

  // Initialize component
  useEffect(() => {
    loadPaymentRequests(0);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      'UPLOADED': 'bg-blue-100 text-blue-800',
      'VALIDATED': 'bg-green-100 text-green-800',
      'PROCESSED': 'bg-purple-100 text-purple-800',
      'GENERATED': 'bg-emerald-100 text-emerald-800',
      'PAYMENT_REQUESTED': 'bg-orange-100 text-orange-800',
      'PAYMENT_INITIATED': 'bg-indigo-100 text-indigo-800',
      'FAILED': 'bg-red-100 text-red-800',
      'ERROR': 'bg-red-100 text-red-800'
    };
    return statusColors[status?.toUpperCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={currentView === 'details' ? handleBackToRequests : onGoBack}
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {currentView === 'requests' ? 'Worker Payment Details' : 'Payment Details'}
                </h1>
                <p className="text-purple-100">
                  {currentView === 'requests' 
                    ? 'View and manage your payment requests'
                    : `Payment details for request: ${selectedRequest?.workerReceiptNumber || ''}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentView === 'requests' && (
                <button
                  onClick={() => loadPaymentRequests(currentPage)}
                  className="bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="font-medium text-white">Worker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'requests' ? (
          /* Requests List View */
          <div className="space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">{requestsData?.totalElements || 0}</div>
                    <div className="text-sm text-gray-600">Total Requests</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {formatCurrency(requests.reduce((sum, req) => sum + (req.totalAmount || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {requests.reduce((sum, req) => sum + (req.totalRecords || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Workers</div>
                  </div>
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

            {/* Payment Requests Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Payment Requests</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {isLoading ? 'Loading...' : `Showing ${requests.length} of ${requestsData?.totalElements || 0} requests`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
                  <span className="ml-4 text-gray-600">Loading payment requests...</span>
                </div>
              )}

              {/* Content */}
              {!isLoading && (
                <div>
                  {requests.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests Found</h3>
                      <p className="text-gray-500 mb-4">
                        No payment requests have been generated yet.
                      </p>
                      <button
                        onClick={onGoBack}
                        className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-lg font-medium transition-all duration-200"
                      >
                        Go Back to Generate Requests
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Request Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Records
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Generated Date
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
                          {requests.map((request, index) => (
                            <tr key={request.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 font-mono">
                                  {request.workerReceiptNumber}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {request.totalRecords || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                {formatCurrency(request.totalAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(request.generatedAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                                  {request.status || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewDetails(request)}
                                  className="text-purple-600 hover:text-purple-900 font-medium"
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
                  {requestsData && requestsData.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing page {requestsData.currentPage + 1} of {requestsData.totalPages}
                          ({requestsData.totalElements} total requests)
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!requestsData.hasPrevious}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                            {currentPage + 1}
                          </span>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!requestsData.hasNext}
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
        ) : (
          /* Payment Details View */
          <div className="space-y-6">
            
            {/* Request Info Card */}
            {selectedRequest && (
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Request Information</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment request details and worker information
                    </p>
                  </div>
                  
                  <button
                    onClick={handleBackToRequests}
                    className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Requests
                  </button>
                </div>

                {/* Request Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-800 font-mono">{selectedRequest.workerReceiptNumber}</div>
                    <div className="text-sm text-gray-600">Request Number</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-emerald-600">{formatCurrency(selectedRequest.totalAmount)}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">{selectedRequest.totalRecords || 0}</div>
                    <div className="text-sm text-gray-600">Total Workers</div>
                  </div>
                  <div>
                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Status</div>
                  </div>
                </div>
              </div>
            )}

            {/* Worker Payment Details Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Worker Payment Details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isLoadingDetails ? 'Loading...' : `Individual worker payment information`}
                </p>
              </div>

              {/* Loading State */}
              {isLoadingDetails && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
                  <span className="ml-4 text-gray-600">Loading worker details...</span>
                </div>
              )}

              {/* Content */}
              {!isLoadingDetails && (
                <div>
                  {!paymentDetails || paymentDetails.content?.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Worker Details Found</h3>
                      <p className="text-gray-500">
                        No worker payment details found for this request.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Worker Name
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
                              Bank Account
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(paymentDetails?.content || []).map((payment, index) => (
                            <tr key={payment.id || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{payment.name || '-'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                {formatCurrency(payment.amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {payment.toli || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                {payment.pan || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                                {payment.bankAccount || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                                  {payment.status || 'Unknown'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination for Details */}
                  {paymentDetails && paymentDetails.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing page {detailsPage + 1} of {paymentDetails.totalPages}
                          ({paymentDetails.totalElements} total workers)
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDetailsPageChange(detailsPage - 1)}
                            disabled={detailsPage === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                            {detailsPage + 1}
                          </span>
                          <button
                            onClick={() => handleDetailsPageChange(detailsPage + 1)}
                            disabled={detailsPage >= paymentDetails.totalPages - 1}
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
      </div>
    </div>
  );
}

export default WorkerPaymentScreen;
