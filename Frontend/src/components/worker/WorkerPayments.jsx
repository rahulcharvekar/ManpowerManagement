import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const WorkerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    dateRange: 'this_month',
    searchTerm: ''
  });
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would fetch from backend
      // const response = await apiClient.get(`${API_ENDPOINTS.WORKER_PAYMENTS}?${new URLSearchParams(filter)}`, token);
      
      // Mock data for demonstration
      setTimeout(() => {
        setPayments([
          {
            id: 'WP-001',
            workerRef: 'WRK-2024-001',
            regId: 'REG001234',
            workerName: 'Rajesh Kumar',
            aadhar: '1234-5678-9012',
            pan: 'ABCDE1234F',
            bankAccount: 'ICICI123456789',
            paymentAmount: 15000,
            status: 'UPLOADED',
            fileId: 'FILE001',
            uploadedFileRef: 'worker_data_oct2024.xlsx',
            requestReferenceNumber: 'WRK-REQ-001',
            receiptNumber: null,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            processedAt: null
          },
          {
            id: 'WP-002',
            workerRef: 'WRK-2024-002',
            regId: 'REG001235',
            workerName: 'Priya Sharma',
            aadhar: '2345-6789-0123',
            pan: 'BCDEF2345G',
            bankAccount: 'HDFC987654321',
            paymentAmount: 22000,
            status: 'VALIDATED',
            fileId: 'FILE001',
            uploadedFileRef: 'worker_data_oct2024.xlsx',
            requestReferenceNumber: 'WRK-REQ-002',
            receiptNumber: 'WRK-REC-001',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            processedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'WP-003',
            workerRef: 'WRK-2024-003',
            regId: 'REG001236',
            workerName: 'Mohammed Ali',
            aadhar: '3456-7890-1234',
            pan: 'CDEFG3456H',
            bankAccount: 'SBI456789123',
            paymentAmount: 18500,
            status: 'PAYMENT_INITIATED',
            fileId: 'FILE002',
            uploadedFileRef: 'worker_data_oct2024_batch2.xlsx',
            requestReferenceNumber: 'WRK-REQ-003',
            receiptNumber: 'WRK-REC-002',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            processedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'WP-004',
            workerRef: 'WRK-2024-004',
            regId: 'REG001237',
            workerName: 'Sunita Devi',
            aadhar: '4567-8901-2345',
            pan: 'DEFGH4567I',
            bankAccount: 'AXIS789123456',
            paymentAmount: 25000,
            status: 'REJECTED',
            fileId: 'FILE003',
            uploadedFileRef: 'worker_data_oct2024_batch3.xlsx',
            requestReferenceNumber: 'WRK-REQ-004',
            receiptNumber: null,
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            processedAt: null,
            rejectionReason: 'Invalid bank account number'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fetch worker payments:', error);
      setLoading(false);
    }
  };

  const handleBatchAction = async (action) => {
    if (selectedPayments.length === 0) {
      alert('Please select payments to process');
      return;
    }

    try {
      setProcessingBatch(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would process via backend
      // await apiClient.post(`${API_ENDPOINTS.WORKER_PAYMENTS.BATCH_ACTION}`, { paymentIds: selectedPayments, action }, token);
      
      // Simulate batch processing
      setTimeout(() => {
        setPayments(prev => prev.map(payment => {
          if (selectedPayments.includes(payment.id)) {
            const newStatus = action === 'validate' ? 'VALIDATED' : 
                            action === 'approve' ? 'PAYMENT_INITIATED' : 
                            action === 'reject' ? 'REJECTED' : payment.status;
            return {
              ...payment,
              status: newStatus,
              processedAt: new Date().toISOString()
            };
          }
          return payment;
        }));
        
        setSelectedPayments([]);
        setShowBatchModal(false);
        setProcessingBatch(false);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to process batch action:', error);
      setProcessingBatch(false);
    }
  };

  const handleExportPayments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would export via backend
      // const response = await apiClient.get(`${API_ENDPOINTS.WORKER_PAYMENTS.EXPORT}?${new URLSearchParams(filter)}`, token);
      
      // Simulate export
      const exportData = filteredPayments.map(payment => ({
        'Worker Ref': payment.workerRef,
        'Worker Name': payment.workerName,
        'Registration ID': payment.regId,
        'Payment Amount': payment.paymentAmount,
        'Status': payment.status,
        'Bank Account': payment.bankAccount,
        'Created At': new Date(payment.createdAt).toLocaleDateString('en-IN'),
        'Processed At': payment.processedAt ? new Date(payment.processedAt).toLocaleDateString('en-IN') : 'Not Processed'
      }));
      
      const csv = [
        Object.keys(exportData[0]).join(','),
        ...exportData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `worker-payments-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export payments:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not processed';
    return new Date(dateString).toLocaleString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPLOADED': return 'bg-blue-100 text-blue-800';
      case 'VALIDATED': return 'bg-yellow-100 text-yellow-800';
      case 'PAYMENT_INITIATED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'UPLOADED': return '📤';
      case 'VALIDATED': return '✅';
      case 'PAYMENT_INITIATED': return '💰';
      case 'REJECTED': return '❌';
      default: return '❓';
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const selectablePayments = filteredPayments
        .filter(p => ['UPLOADED', 'VALIDATED'].includes(p.status))
        .map(p => p.id);
      setSelectedPayments(selectablePayments);
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (paymentId, checked) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, paymentId]);
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId));
    }
  };

  // Apply filters
  let filteredPayments = payments;

  if (filter.status !== 'all') {
    filteredPayments = filteredPayments.filter(payment => payment.status === filter.status.toUpperCase());
  }

  if (filter.searchTerm) {
    const searchLower = filter.searchTerm.toLowerCase();
    filteredPayments = filteredPayments.filter(payment => 
      payment.workerName.toLowerCase().includes(searchLower) ||
      payment.workerRef.toLowerCase().includes(searchLower) ||
      payment.regId.toLowerCase().includes(searchLower) ||
      payment.bankAccount.toLowerCase().includes(searchLower)
    );
  }

  if (loading) {
    return (
      <div className="worker-payments-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-payments-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            💵 <span className="ml-2">Worker Payments</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage individual worker payment processing and validation</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {selectedPayments.length > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="btn btn-primary flex items-center"
            >
              ⚡ Batch Actions ({selectedPayments.length})
            </button>
          )}
          
          <ActionGate componentKey="worker-payments" action="EXPORT">
            <button 
              onClick={handleExportPayments}
              className="btn btn-secondary flex items-center"
            >
              📄 Export
            </button>
          </ActionGate>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Filter
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({...prev, status: e.target.value}))}
              className="form-select w-full"
            >
              <option value="all">All Status</option>
              <option value="uploaded">Uploaded</option>
              <option value="validated">Validated</option>
              <option value="payment_initiated">Payment Initiated</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter(prev => ({...prev, dateRange: e.target.value}))}
              className="form-select w-full"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filter.searchTerm}
              onChange={(e) => setFilter(prev => ({...prev, searchTerm: e.target.value}))}
              className="form-input w-full"
              placeholder="Search by name, ref, or account..."
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              📤
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Uploaded</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'UPLOADED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Validated</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'VALIDATED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'PAYMENT_INITIATED').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
              💵
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(payments.reduce((sum, p) => sum + p.paymentAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Worker Payments ({filteredPayments.length} records)
            </h3>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === filteredPayments.filter(p => ['UPLOADED', 'VALIDATED'].includes(p.status)).length && filteredPayments.filter(p => ['UPLOADED', 'VALIDATED'].includes(p.status)).length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-primary-600"
                />
                <span className="ml-2 text-sm text-gray-700">Select All</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">💵</div>
              <p className="text-gray-600">No worker payments found</p>
            </div>
          ) : (
            filteredPayments.map(payment => (
              <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  
                  {/* Selection Checkbox */}
                  {['UPLOADED', 'VALIDATED'].includes(payment.status) && (
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedPayments.includes(payment.id)}
                        onChange={(e) => handleSelectPayment(payment.id, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary-600"
                      />
                    </div>
                  )}
                  
                  {/* Payment Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getStatusIcon(payment.status)}</span>
                        <h4 className="font-semibold text-lg text-gray-900">{payment.workerName}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.paymentAmount)}</p>
                        <p className="text-sm text-gray-600">{payment.workerRef}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Registration:</span>
                        <p className="text-gray-900">{payment.regId}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Bank Account:</span>
                        <p className="text-gray-900 font-mono">{payment.bankAccount}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Aadhar:</span>
                        <p className="text-gray-900">{payment.aadhar}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">PAN:</span>
                        <p className="text-gray-900">{payment.pan}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Created:</span>
                        <p className="text-gray-900">{formatDateTime(payment.createdAt)}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Processed:</span>
                        <p className="text-gray-900">{formatDateTime(payment.processedAt)}</p>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Source File:</span>
                        <p className="text-gray-900">{payment.uploadedFileRef}</p>
                      </div>
                    </div>
                    
                    {payment.receiptNumber && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Receipt Number:</span>
                        <p className="text-sm text-gray-900 font-mono">{payment.receiptNumber}</p>
                      </div>
                    )}
                    
                    {payment.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-red-700">Rejection Reason:</span>
                        <p className="text-sm text-red-900">{payment.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Batch Actions Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Batch Actions for {selectedPayments.length} payments
              </h3>
              
              <div className="space-y-4">
                <ActionGate componentKey="worker-payments" action="EDIT">
                  <button
                    onClick={() => handleBatchAction('validate')}
                    disabled={processingBatch}
                    className="w-full btn btn-success flex items-center justify-center"
                  >
                    ✅ Validate Selected Payments
                  </button>
                </ActionGate>
                
                <ActionGate componentKey="worker-payments" action="EDIT">
                  <button
                    onClick={() => handleBatchAction('approve')}
                    disabled={processingBatch}
                    className="w-full btn btn-primary flex items-center justify-center"
                  >
                    💰 Approve for Payment
                  </button>
                </ActionGate>
                
                <ActionGate componentKey="worker-payments" action="EDIT">
                  <button
                    onClick={() => handleBatchAction('reject')}
                    disabled={processingBatch}
                    className="w-full btn btn-danger flex items-center justify-center"
                  >
                    ❌ Reject Selected Payments
                  </button>
                </ActionGate>
              </div>
              
              {processingBatch && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-3"></div>
                  <span className="text-gray-600">Processing batch action...</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowBatchModal(false);
                    setSelectedPayments([]);
                  }}
                  disabled={processingBatch}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerPayments;
