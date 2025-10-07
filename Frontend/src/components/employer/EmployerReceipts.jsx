import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const EmployerReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationData, setValidationData] = useState({
    transactionReference: '',
    bankReference: '',
    notes: ''
  });
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, [filter]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would fetch from backend
      // const response = await apiClient.get(`${API_ENDPOINTS.EMPLOYER.RECEIPTS}?status=${filter}`, token);
      
      // Mock data for demonstration
      setTimeout(() => {
        setReceipts([
          {
            id: 'EMP-REC-001',
            employerReceiptNumber: 'EMP-001-2024-001',
            workerReceiptNumber: 'WRK-001-2024-001',
            employerId: 'EMP001',
            employerName: 'ABC Construction Ltd.',
            toliId: 'TOLI001',
            totalRecords: 25,
            totalAmount: 125000,
            status: 'PENDING',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            validatedAt: null,
            transactionReference: null,
            bankReference: null,
            notes: null
          },
          {
            id: 'EMP-REC-002',
            employerReceiptNumber: 'EMP-002-2024-001',
            workerReceiptNumber: 'WRK-002-2024-001',
            employerId: 'EMP002',
            employerName: 'XYZ Infrastructure Pvt. Ltd.',
            toliId: 'TOLI002',
            totalRecords: 18,
            totalAmount: 89000,
            status: 'VALIDATED',
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            validatedAt: new Date(Date.now() - 1800000).toISOString(),
            transactionReference: 'TXN123456789',
            bankReference: 'BANK987654321',
            notes: 'Payment processed successfully'
          },
          {
            id: 'EMP-REC-003',
            employerReceiptNumber: 'EMP-003-2024-001',
            workerReceiptNumber: 'WRK-003-2024-001',
            employerId: 'EMP003',
            employerName: 'DEF Housing Corporation',
            toliId: 'TOLI003',
            totalRecords: 32,
            totalAmount: 160000,
            status: 'PROCESSED',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            validatedAt: new Date(Date.now() - 82800000).toISOString(),
            transactionReference: 'TXN987654321',
            bankReference: 'BANK123456789',
            notes: 'All payments completed'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fetch employer receipts:', error);
      setLoading(false);
    }
  };

  const handleValidateReceipt = async () => {
    try {
      setProcessingAction('validating');
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would validate via backend
      // await apiClient.post(`${API_ENDPOINTS.EMPLOYER.VALIDATE}/${selectedReceipt.id}`, validationData, token);
      
      // Simulate API call
      setTimeout(() => {
        setReceipts(prev => prev.map(receipt => 
          receipt.id === selectedReceipt.id 
            ? { 
                ...receipt, 
                status: 'VALIDATED',
                validatedAt: new Date().toISOString(),
                ...validationData
              }
            : receipt
        ));
        setShowValidationModal(false);
        setSelectedReceipt(null);
        setValidationData({ transactionReference: '', bankReference: '', notes: '' });
        setProcessingAction(null);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to validate receipt:', error);
      setProcessingAction(null);
    }
  };

  const handleRejectReceipt = async (receiptId, reason) => {
    try {
      setProcessingAction('rejecting');
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const rejectionReason = reason || window.prompt('Please provide a reason for rejection:');
      if (!rejectionReason) {
        setProcessingAction(null);
        return;
      }

      // In real implementation, this would reject via backend
      // await apiClient.post(`${API_ENDPOINTS.EMPLOYER.REJECT}/${receiptId}`, { reason: rejectionReason }, token);
      
      // Simulate API call
      setTimeout(() => {
        setReceipts(prev => prev.map(receipt => 
          receipt.id === receiptId 
            ? { 
                ...receipt, 
                status: 'REJECTED',
                notes: rejectionReason
              }
            : receipt
        ));
        setProcessingAction(null);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to reject receipt:', error);
      setProcessingAction(null);
    }
  };

  const handleGenerateReceipt = async (receiptId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would generate PDF via backend
      // const response = await apiClient.get(`${API_ENDPOINTS.EMPLOYER.GENERATE_PDF}/${receiptId}`, token);
      
      // Simulate PDF generation
      const receipt = receipts.find(r => r.id === receiptId);
      const pdfContent = `
Employer Receipt: ${receipt.employerReceiptNumber}
Employer: ${receipt.employerName}
Total Amount: ₹${receipt.totalAmount.toLocaleString('en-IN')}
Total Records: ${receipt.totalRecords}
Status: ${receipt.status}
Generated on: ${new Date().toLocaleString('en-IN')}
      `;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employer-receipt-${receipt.employerReceiptNumber}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to generate receipt:', error);
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
    return new Date(dateString).toLocaleString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'VALIDATED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    if (filter === 'all') return true;
    return receipt.status.toLowerCase() === filter.toLowerCase();
  });

  if (loading) {
    return (
      <div className="employer-receipts-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employer-receipts-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🧾 <span className="ml-2">Employer Receipts</span>
          </h1>
          <p className="text-gray-600 mt-1">Manage employer payment receipt validation and processing</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="validated">Validated</option>
            <option value="processed">Processed</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <ActionGate componentKey="employer-receipts" action="EXPORT">
            <button className="btn btn-secondary">
              📄 Export
            </button>
          </ActionGate>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
              ⏳
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {receipts.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Validated</p>
              <p className="text-2xl font-bold text-gray-900">
                {receipts.filter(r => r.status === 'VALIDATED').length}
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
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(receipts.reduce((sum, r) => sum + r.totalAmount, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
              📊
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Receipts</p>
              <p className="text-2xl font-bold text-gray-900">{receipts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employer Receipts</h3>
          
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600">No employer receipts found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReceipts.map(receipt => (
                <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold text-lg text-gray-900">{receipt.employerReceiptNumber}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(receipt.status)}`}>
                        {receipt.status}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <ActionGate componentKey="employer-receipts" action="VIEW">
                        <button
                          onClick={() => handleGenerateReceipt(receipt.id)}
                          className="btn btn-sm btn-secondary"
                        >
                          📄 Generate PDF
                        </button>
                      </ActionGate>
                      
                      {receipt.status === 'PENDING' && (
                        <>
                          <ActionGate componentKey="employer-receipts" action="APPROVE">
                            <button
                              onClick={() => {
                                setSelectedReceipt(receipt);
                                setShowValidationModal(true);
                              }}
                              disabled={processingAction === 'validating'}
                              className="btn btn-sm btn-success"
                            >
                              ✅ Validate
                            </button>
                          </ActionGate>
                          
                          <ActionGate componentKey="employer-receipts" action="REJECT">
                            <button
                              onClick={() => handleRejectReceipt(receipt.id)}
                              disabled={processingAction === 'rejecting'}
                              className="btn btn-sm btn-danger"
                            >
                              ❌ Reject
                            </button>
                          </ActionGate>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Employer:</span>
                      <p className="text-gray-900">{receipt.employerName}</p>
                      <p className="text-gray-600">{receipt.employerId}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Worker Receipt:</span>
                      <p className="text-gray-900">{receipt.workerReceiptNumber}</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Amount & Records:</span>
                      <p className="text-gray-900">{formatCurrency(receipt.totalAmount)}</p>
                      <p className="text-gray-600">{receipt.totalRecords} records</p>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Submitted:</span>
                      <p className="text-gray-900">{formatDateTime(receipt.submittedAt)}</p>
                      {receipt.validatedAt && (
                        <p className="text-green-600">Validated: {formatDateTime(receipt.validatedAt)}</p>
                      )}
                    </div>
                  </div>
                  
                  {receipt.transactionReference && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Transaction Ref:</span>
                          <p className="text-gray-900">{receipt.transactionReference}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Bank Ref:</span>
                          <p className="text-gray-900">{receipt.bankReference}</p>
                        </div>
                      </div>
                      {receipt.notes && (
                        <div className="mt-2">
                          <span className="font-medium text-gray-700">Notes:</span>
                          <p className="text-gray-900">{receipt.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Validate Receipt: {selectedReceipt.employerReceiptNumber}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Reference *
                  </label>
                  <input
                    type="text"
                    value={validationData.transactionReference}
                    onChange={(e) => setValidationData(prev => ({...prev, transactionReference: e.target.value}))}
                    className="form-input w-full"
                    placeholder="Enter transaction reference"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Reference
                  </label>
                  <input
                    type="text"
                    value={validationData.bankReference}
                    onChange={(e) => setValidationData(prev => ({...prev, bankReference: e.target.value}))}
                    className="form-input w-full"
                    placeholder="Enter bank reference"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={validationData.notes}
                    onChange={(e) => setValidationData(prev => ({...prev, notes: e.target.value}))}
                    className="form-textarea w-full"
                    rows="3"
                    placeholder="Enter any additional notes"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowValidationModal(false);
                    setSelectedReceipt(null);
                    setValidationData({ transactionReference: '', bankReference: '', notes: '' });
                  }}
                  disabled={processingAction === 'validating'}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleValidateReceipt}
                  disabled={!validationData.transactionReference || processingAction === 'validating'}
                  className="btn btn-success"
                >
                  {processingAction === 'validating' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validating...
                    </>
                  ) : (
                    'Validate Receipt'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerReceipts;
