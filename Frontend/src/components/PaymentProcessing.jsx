import React, { useState, useEffect } from 'react';
import ActionGate from './ActionGate';
import { API_ENDPOINTS, apiClient, ValidationUtils } from '../api/apiConfig';

const PaymentProcessing = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [paginationSession, setPaginationSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async (page = 0, size = 20) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // For worker payments, we need to use date range for security
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      const dateRange = ValidationUtils.validateDateRange(
        thirtyDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Create pagination session if needed
      if (!paginationSession) {
        const sessionResponse = await apiClient.post(
          API_ENDPOINTS.WORKER_PAYMENTS_V1.PAGINATION_SESSION,
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            ...ValidationUtils.validatePagination(page, size)
          },
          token
        );
        setPaginationSession(sessionResponse.sessionId);
        
        // Fetch payments by session
        const paymentsResponse = await apiClient.get(
          `${API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_SESSION}?sessionId=${sessionResponse.sessionId}&page=${page}&size=${size}`,
          token
        );
        
        setPayments(paymentsResponse.content || []);
        setCurrentPage(paymentsResponse.number || 0);
        setTotalPages(paymentsResponse.totalPages || 0);
      } else {
        // Use existing session
        const paymentsResponse = await apiClient.get(
          `${API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_SESSION}?sessionId=${paginationSession}&page=${page}&size=${size}`,
          token
        );
        
        setPayments(paymentsResponse.content || []);
        setCurrentPage(paymentsResponse.number || 0);
        setTotalPages(paymentsResponse.totalPages || 0);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setError(error.message || 'Failed to fetch payments');
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await apiClient.post(API_ENDPOINTS.WORKER_PAYMENTS_V1.BASE, paymentData, token);
      await fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Failed to create payment:', error);
      setError(error.message || 'Failed to create payment');
    }
  };

  const handleEditPayment = async (paymentId, updatedData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await apiClient.put(API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_ID(paymentId), updatedData, token);
      await fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('Failed to edit payment:', error);
      setError(error.message || 'Failed to edit payment');
    }
  };

  const handleApprovePayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to approve this payment?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await apiClient.put(
          API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_ID(paymentId), 
          { status: 'APPROVED' }, 
          token
        );
        await fetchPayments(); // Refresh the list
      } catch (error) {
        console.error('Failed to approve payment:', error);
        setError(error.message || 'Failed to approve payment');
      }
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (window.confirm('Are you sure you want to reject this payment?')) {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        await apiClient.put(
          API_ENDPOINTS.WORKER_PAYMENTS_V1.BY_ID(paymentId), 
          { status: 'REJECTED' }, 
          token
        );
        await fetchPayments(); // Refresh the list
      } catch (error) {
        console.error('Failed to reject payment:', error);
        setError(error.message || 'Failed to reject payment');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status.toLowerCase() === filter;
  });

  if (loading) {
    return (
      <div className="payment-processing-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-processing-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            💳 <span className="ml-2">Payment Processing</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage and process payment transactions</p>
        </div>
        
        <ActionGate componentKey="payment-processing" action="CREATE">
          <button 
            onClick={handleCreatePayment}
            className="btn btn-primary flex items-center"
          >
            <span className="mr-2">+</span>
            New Payment
          </button>
        </ActionGate>
      </div>

      {/* Payment Statistics */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              📊
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              ⏳
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              ✅
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'Approved').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl mr-4">
              💰
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ${payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="payment-filters mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="text-sm text-gray-500">
              Showing {filteredPayments.length} of {payments.length} payments
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="payments-list space-y-4">
        {filteredPayments.map(payment => (
          <div key={payment.id} className="payment-card bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              
              {/* Payment Info */}
              <div className="payment-info flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 mr-3">
                    {payment.reference}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <p><strong>Payee:</strong> {payment.payee}</p>
                    <p><strong>Category:</strong> {payment.category}</p>
                  </div>
                  <div>
                    <p><strong>Amount:</strong> ${payment.amount.toLocaleString()} {payment.currency}</p>
                    <p><strong>Due Date:</strong> {new Date(payment.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> {payment.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Payment Actions */}
              <div className="payment-actions flex flex-col space-y-2 ml-6">
                
                <ActionGate componentKey="payment-processing" action="EDIT">
                  <button 
                    onClick={() => handleEditPayment(payment.id)}
                    className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-sm font-medium"
                  >
                    Edit
                  </button>
                </ActionGate>
                
                {payment.status === 'Pending' && (
                  <>
                    <ActionGate componentKey="payment-processing" action="APPROVE">
                      <button 
                        onClick={() => handleApprovePayment(payment.id)}
                        className="px-4 py-2 text-green-600 bg-green-50 border border-green-200 rounded hover:bg-green-100 text-sm font-medium"
                      >
                        Approve
                      </button>
                    </ActionGate>
                    
                    <ActionGate componentKey="payment-processing" action="REJECT">
                      <button 
                        onClick={() => handleRejectPayment(payment.id)}
                        className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </ActionGate>
                  </>
                )}
                
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'No payments have been created yet.' 
              : `No payments with status "${filter}" found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentProcessing;
