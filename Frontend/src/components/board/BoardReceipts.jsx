import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const BoardReceipts = () => {
  const [boardReceipts, setBoardReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalData, setApprovalData] = useState({
    approvalNotes: '',
    paymentSchedule: 'immediate',
    paymentMethod: 'bank_transfer'
  });
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    fetchBoardReceipts();
  }, [filter]);

  const fetchBoardReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would fetch from backend
      // const response = await apiClient.get(`${API_ENDPOINTS.BOARD.RECEIPTS}?status=${filter}`, token);
      
      // Mock data for demonstration
      setTimeout(() => {
        setBoardReceipts([
          {
            id: 'BRD-REC-001',
            boardReceiptNumber: 'BRD-001-2024-001',
            employerReceiptNumber: 'EMP-001-2024-001',
            workerReceiptNumber: 'WRK-001-2024-001',
            employerId: 'EMP001',
            employerName: 'ABC Construction Ltd.',
            toliId: 'TOLI001',
            totalRecords: 25,
            totalAmount: 125000,
            status: 'PENDING_APPROVAL',
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            validatedAt: new Date(Date.now() - 1800000).toISOString(),
            approvedAt: null,
            paymentScheduledAt: null,
            approvalNotes: null,
            paymentMethod: null,
            transactionReference: 'TXN123456789',
            bankReference: 'BANK987654321'
          },
          {
            id: 'BRD-REC-002',
            boardReceiptNumber: 'BRD-002-2024-001',
            employerReceiptNumber: 'EMP-002-2024-001',
            workerReceiptNumber: 'WRK-002-2024-001',
            employerId: 'EMP002',
            employerName: 'XYZ Infrastructure Pvt. Ltd.',
            toliId: 'TOLI002',
            totalRecords: 18,
            totalAmount: 89000,
            status: 'APPROVED',
            submittedAt: new Date(Date.now() - 86400000).toISOString(),
            validatedAt: new Date(Date.now() - 82800000).toISOString(),
            approvedAt: new Date(Date.now() - 3600000).toISOString(),
            paymentScheduledAt: new Date(Date.now() + 86400000).toISOString(),
            approvalNotes: 'Payment approved for immediate processing',
            paymentMethod: 'bank_transfer',
            transactionReference: 'TXN987654321',
            bankReference: 'BANK123456789'
          },
          {
            id: 'BRD-REC-003',
            boardReceiptNumber: 'BRD-003-2024-001',
            employerReceiptNumber: 'EMP-003-2024-001',
            workerReceiptNumber: 'WRK-003-2024-001',
            employerId: 'EMP003',
            employerName: 'DEF Housing Corporation',
            toliId: 'TOLI003',
            totalRecords: 32,
            totalAmount: 160000,
            status: 'PAYMENT_INITIATED',
            submittedAt: new Date(Date.now() - 172800000).toISOString(),
            validatedAt: new Date(Date.now() - 169200000).toISOString(),
            approvedAt: new Date(Date.now() - 86400000).toISOString(),
            paymentScheduledAt: new Date(Date.now() - 7200000).toISOString(),
            approvalNotes: 'Expedited payment processing approved',
            paymentMethod: 'rtgs',
            transactionReference: 'TXN456789123',
            bankReference: 'BANK789123456'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fetch board receipts:', error);
      setLoading(false);
    }
  };

  const handleApproveReceipt = async () => {
    try {
      setProcessingAction('approving');
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would approve via backend
      // await apiClient.post(`${API_ENDPOINTS.BOARD.APPROVE}/${selectedReceipt.id}`, approvalData, token);
      
      // Simulate API call
      setTimeout(() => {
        setBoardReceipts(prev => prev.map(receipt => 
          receipt.id === selectedReceipt.id 
            ? { 
                ...receipt, 
                status: 'APPROVED',
                approvedAt: new Date().toISOString(),
                paymentScheduledAt: approvalData.paymentSchedule === 'immediate' 
                  ? new Date(Date.now() + 3600000).toISOString() 
                  : new Date(Date.now() + 86400000).toISOString(),
                ...approvalData
              }
            : receipt
        ));
        setShowApprovalModal(false);
        setSelectedReceipt(null);
        setApprovalData({ approvalNotes: '', paymentSchedule: 'immediate', paymentMethod: 'bank_transfer' });
        setProcessingAction(null);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to approve receipt:', error);
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
      // await apiClient.post(`${API_ENDPOINTS.BOARD.REJECT}/${receiptId}`, { reason: rejectionReason }, token);
      
      // Simulate API call
      setTimeout(() => {
        setBoardReceipts(prev => prev.map(receipt => 
          receipt.id === receiptId 
            ? { 
                ...receipt, 
                status: 'REJECTED',
                approvalNotes: rejectionReason
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

  const handleInitiatePayment = async (receiptId) => {
    try {
      setProcessingAction('initiating_payment');
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would initiate payment via backend
      // await apiClient.post(`${API_ENDPOINTS.BOARD.INITIATE_PAYMENT}/${receiptId}`, {}, token);
      
      // Simulate API call
      setTimeout(() => {
        setBoardReceipts(prev => prev.map(receipt => 
          receipt.id === receiptId 
            ? { 
                ...receipt, 
                status: 'PAYMENT_INITIATED'
              }
            : receipt
        ));
        setProcessingAction(null);
      }, 2000);
      
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setProcessingAction(null);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would generate report via backend
      // const response = await apiClient.get(`${API_ENDPOINTS.BOARD.REPORT}?status=${filter}`, token);
      
      // Simulate report generation
      const reportData = {
        totalReceipts: boardReceipts.length,
        totalAmount: boardReceipts.reduce((sum, r) => sum + r.totalAmount, 0),
        byStatus: {
          pending: boardReceipts.filter(r => r.status === 'PENDING_APPROVAL').length,
          approved: boardReceipts.filter(r => r.status === 'APPROVED').length,
          initiated: boardReceipts.filter(r => r.status === 'PAYMENT_INITIATED').length,
          rejected: boardReceipts.filter(r => r.status === 'REJECTED').length
        },
        receipts: boardReceipts,
        generatedAt: new Date().toISOString(),
        generatedBy: 'Board Admin'
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-receipts-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
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
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'PAYMENT_INITIATED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL': return '⏳';
      case 'APPROVED': return '✅';
      case 'PAYMENT_INITIATED': return '💰';
      case 'REJECTED': return '❌';
      default: return '❓';
    }
  };

  const filteredReceipts = boardReceipts.filter(receipt => {
    if (filter === 'all') return true;
    return receipt.status.toLowerCase().replace('_', '_') === filter.toLowerCase().replace('-', '_');
  });

  if (loading) {
    return (
      <div className="board-receipts-page">
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
    <div className="board-receipts-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            📄 <span className="ml-2">Board Receipts</span>
          </h1>
          <p className="text-gray-600 mt-1">Final approval and payment processing for validated employer receipts</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Status</option>
            <option value="pending-approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="payment-initiated">Payment Initiated</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <ActionGate componentKey="board-receipts" action="EXPORT">
            <button 
              onClick={handleGenerateReport}
              className="btn btn-secondary flex items-center"
            >
              📊 Generate Report
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
                {boardReceipts.filter(r => r.status === 'PENDING_APPROVAL').length}
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
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {boardReceipts.filter(r => r.status === 'APPROVED').length}
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
                {formatCurrency(boardReceipts.reduce((sum, r) => sum + r.totalAmount, 0))}
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
              <p className="text-2xl font-bold text-gray-900">{boardReceipts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Board Receipts List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Board Receipts for Final Approval</h3>
          
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600">No board receipts found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReceipts.map(receipt => (
                <div key={receipt.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  
                  {/* Receipt Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{getStatusIcon(receipt.status)}</div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900">{receipt.boardReceiptNumber}</h4>
                        <p className="text-sm text-gray-600">
                          From: {receipt.employerReceiptNumber} → {receipt.workerReceiptNumber}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(receipt.status)}`}>
                        {receipt.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {receipt.status === 'PENDING_APPROVAL' && (
                        <>
                          <ActionGate componentKey="board-receipts" action="APPROVE">
                            <button
                              onClick={() => {
                                setSelectedReceipt(receipt);
                                setShowApprovalModal(true);
                              }}
                              disabled={processingAction === 'approving'}
                              className="btn btn-sm btn-success"
                            >
                              ✅ Approve
                            </button>
                          </ActionGate>
                          
                          <ActionGate componentKey="board-receipts" action="REJECT">
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
                      
                      {receipt.status === 'APPROVED' && (
                        <ActionGate componentKey="board-receipts" action="APPROVE">
                          <button
                            onClick={() => handleInitiatePayment(receipt.id)}
                            disabled={processingAction === 'initiating_payment'}
                            className="btn btn-sm btn-primary"
                          >
                            {processingAction === 'initiating_payment' ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Initiating...
                              </>
                            ) : (
                              <>💰 Initiate Payment</>
                            )}
                          </button>
                        </ActionGate>
                      )}
                    </div>
                  </div>
                  
                  {/* Receipt Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Employer Details</span>
                      <p className="text-gray-900 font-medium">{receipt.employerName}</p>
                      <p className="text-gray-600 text-sm">{receipt.employerId}</p>
                      <p className="text-gray-600 text-sm">TOLI: {receipt.toliId}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Payment Details</span>
                      <p className="text-gray-900 font-bold text-lg">{formatCurrency(receipt.totalAmount)}</p>
                      <p className="text-gray-600 text-sm">{receipt.totalRecords} records</p>
                      {receipt.paymentMethod && (
                        <p className="text-gray-600 text-sm">Method: {receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Timeline</span>
                      <p className="text-gray-600 text-sm">Submitted: {formatDateTime(receipt.submittedAt)}</p>
                      <p className="text-gray-600 text-sm">Validated: {formatDateTime(receipt.validatedAt)}</p>
                      {receipt.approvedAt && (
                        <p className="text-green-600 text-sm">Approved: {formatDateTime(receipt.approvedAt)}</p>
                      )}
                      {receipt.paymentScheduledAt && (
                        <p className="text-blue-600 text-sm">Scheduled: {formatDateTime(receipt.paymentScheduledAt)}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Transaction References */}
                  {receipt.transactionReference && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-gray-900 mb-2">Transaction References</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Transaction Ref:</span>
                          <p className="text-gray-900 font-mono">{receipt.transactionReference}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Bank Ref:</span>
                          <p className="text-gray-900 font-mono">{receipt.bankReference}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Approval Notes */}
                  {receipt.approvalNotes && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Approval Notes</h5>
                      <p className="text-gray-900 text-sm">{receipt.approvalNotes}</p>
                    </div>
                  )}
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Approve Board Receipt: {selectedReceipt.boardReceiptNumber}
              </h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Employer:</span>
                    <p>{selectedReceipt.employerName}</p>
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span>
                    <p className="font-bold text-lg">{formatCurrency(selectedReceipt.totalAmount)}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Schedule *
                  </label>
                  <select
                    value={approvalData.paymentSchedule}
                    onChange={(e) => setApprovalData(prev => ({...prev, paymentSchedule: e.target.value}))}
                    className="form-select w-full"
                  >
                    <option value="immediate">Immediate (within 1 hour)</option>
                    <option value="next_business_day">Next Business Day</option>
                    <option value="scheduled">Scheduled Date</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={approvalData.paymentMethod}
                    onChange={(e) => setApprovalData(prev => ({...prev, paymentMethod: e.target.value}))}
                    className="form-select w-full"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="rtgs">RTGS</option>
                    <option value="neft">NEFT</option>
                    <option value="imps">IMPS</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Notes
                  </label>
                  <textarea
                    value={approvalData.approvalNotes}
                    onChange={(e) => setApprovalData(prev => ({...prev, approvalNotes: e.target.value}))}
                    className="form-textarea w-full"
                    rows="3"
                    placeholder="Enter approval notes (optional)"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setSelectedReceipt(null);
                    setApprovalData({ approvalNotes: '', paymentSchedule: 'immediate', paymentMethod: 'bank_transfer' });
                  }}
                  disabled={processingAction === 'approving'}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleApproveReceipt}
                  disabled={processingAction === 'approving'}
                  className="btn btn-success"
                >
                  {processingAction === 'approving' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    '✅ Approve Receipt'
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

export default BoardReceipts;
