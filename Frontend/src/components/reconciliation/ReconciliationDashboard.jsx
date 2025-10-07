import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const ReconciliationDashboard = () => {
  const [reconciliationData, setReconciliationData] = useState({
    summary: {
      pendingReconciliations: 0,
      completedToday: 0,
      totalAmount: 0,
      successRate: 0
    },
    recentActivity: [],
    reconciliationQueue: [],
    discrepancies: []
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [processingItem, setProcessingItem] = useState(null);

  useEffect(() => {
    fetchReconciliationData();
  }, [selectedDateRange]);

  const fetchReconciliationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would fetch from backend
      // const response = await apiClient.get(`${API_ENDPOINTS.RECONCILIATION.DASHBOARD}?range=${selectedDateRange}`, token);
      
      // Mock data for demonstration
      setTimeout(() => {
        setReconciliationData({
          summary: {
            pendingReconciliations: 42,
            completedToday: 128,
            totalAmount: 2400000,
            successRate: 94.5
          },
          recentActivity: [
            {
              id: 'RA001',
              type: 'WORKER_RECEIPT_PROCESSED',
              description: 'Worker receipt WRK-001 processed successfully',
              timestamp: new Date().toISOString(),
              status: 'SUCCESS'
            },
            {
              id: 'RA002',
              type: 'EMPLOYER_VALIDATION',
              description: 'Employer receipt EMP-001 validated',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              status: 'SUCCESS'
            },
            {
              id: 'RA003',
              type: 'DISCREPANCY_FOUND',
              description: 'Amount mismatch in receipt WRK-002',
              timestamp: new Date(Date.now() - 600000).toISOString(),
              status: 'WARNING'
            }
          ],
          reconciliationQueue: [
            {
              id: 'WRK-003',
              type: 'WORKER_RECEIPT',
              amount: 125000,
              employerId: 'EMP001',
              status: 'PENDING_VALIDATION',
              priority: 'HIGH',
              submittedAt: new Date(Date.now() - 900000).toISOString()
            },
            {
              id: 'EMP-002',
              type: 'EMPLOYER_RECEIPT',
              amount: 89000,
              employerId: 'EMP002',
              status: 'PENDING_APPROVAL',
              priority: 'MEDIUM',
              submittedAt: new Date(Date.now() - 1200000).toISOString()
            }
          ],
          discrepancies: [
            {
              id: 'DISC001',
              receiptId: 'WRK-002',
              type: 'AMOUNT_MISMATCH',
              expectedAmount: 150000,
              actualAmount: 148000,
              difference: -2000,
              status: 'UNDER_REVIEW'
            }
          ]
        });
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fetch reconciliation data:', error);
      setLoading(false);
    }
  };

  const handleProcessReconciliation = async (itemId) => {
    try {
      setProcessingItem(itemId);
      
      // In real implementation, this would process via backend
      // await apiClient.post(`${API_ENDPOINTS.RECONCILIATION.PROCESS}/${itemId}`, {}, token);
      
      setTimeout(() => {
        setProcessingItem(null);
        fetchReconciliationData(); // Refresh data
      }, 2000);
      
    } catch (error) {
      console.error('Failed to process reconciliation:', error);
      setProcessingItem(null);
    }
  };

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would export via backend
      // const response = await apiClient.get(`${API_ENDPOINTS.RECONCILIATION.EXPORT}?range=${selectedDateRange}`, token);
      
      // Simulate export
      const exportData = {
        summary: reconciliationData.summary,
        dateRange: selectedDateRange,
        exportedAt: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation-report-${selectedDateRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-100';
      case 'WARNING': return 'text-yellow-600 bg-yellow-100';
      case 'ERROR': return 'text-red-600 bg-red-100';
      case 'PENDING': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="reconciliation-dashboard-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="reconciliation-dashboard-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            📊 <span className="ml-2">Reconciliation Dashboard</span>
          </h1>
          <p className="text-gray-600 mt-1">Track and manage payment reconciliation processes</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="form-select"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <ActionGate componentKey="reconciliation-dashboard" action="EXPORT">
            <button 
              onClick={handleExportReport}
              className="btn btn-secondary flex items-center"
            >
              📄 Export Report
            </button>
          </ActionGate>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
              ⏳
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{reconciliationData.summary.pendingReconciliations}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">{reconciliationData.summary.completedToday}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              💰
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(reconciliationData.summary.totalAmount)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
              📈
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{reconciliationData.summary.successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📋' },
              { id: 'queue', name: 'Processing Queue', icon: '⚡' },
              { id: 'discrepancies', name: 'Discrepancies', icon: '⚠️' },
              { id: 'activity', name: 'Recent Activity', icon: '📝' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        
        {/* Processing Queue Tab */}
        {activeTab === 'queue' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Queue</h3>
            
            {reconciliationData.reconciliationQueue.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📭</div>
                <p className="text-gray-600">No items in processing queue</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reconciliationData.reconciliationQueue.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">{item.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="text-sm text-gray-600">{item.type.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span> {formatCurrency(item.amount)}
                          </div>
                          <div>
                            <span className="font-medium">Employer:</span> {item.employerId}
                          </div>
                          <div>
                            <span className="font-medium">Submitted:</span> {formatTime(item.submittedAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <ActionGate componentKey="reconciliation-dashboard" action="APPROVE">
                          <button
                            onClick={() => handleProcessReconciliation(item.id)}
                            disabled={processingItem === item.id}
                            className="btn btn-sm btn-success flex items-center"
                          >
                            {processingItem === item.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              <>✅ Process</>
                            )}
                          </button>
                        </ActionGate>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discrepancies Tab */}
        {activeTab === 'discrepancies' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Discrepancies</h3>
            
            {reconciliationData.discrepancies.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-400 text-4xl mb-4">✅</div>
                <p className="text-gray-600">No discrepancies found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reconciliationData.discrepancies.map(disc => (
                  <div key={disc.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">{disc.receiptId}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        {disc.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Expected:</span>
                        <span className="text-gray-900 ml-2">{formatCurrency(disc.expectedAmount)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Actual:</span>
                        <span className="text-gray-900 ml-2">{formatCurrency(disc.actualAmount)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Difference:</span>
                        <span className={`ml-2 font-medium ${disc.difference < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(Math.abs(disc.difference))} {disc.difference < 0 ? 'Short' : 'Excess'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity Tab */}
        {activeTab === 'activity' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            
            <div className="space-y-4">
              {reconciliationData.recentActivity.map(activity => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-600">{formatTime(activity.timestamp)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overview Tab (Default) */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Processing Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Worker Receipts</span>
                    <span className="font-medium">24 pending</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Employer Receipts</span>
                    <span className="font-medium">18 pending</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Board Approvals</span>
                    <span className="font-medium">12 pending</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">System Health</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Response Time</span>
                    <span className="text-green-600 font-medium">245ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Database Status</span>
                    <span className="text-green-600 font-medium">Healthy</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Processing Queue</span>
                    <span className="text-green-600 font-medium">Normal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ReconciliationDashboard;
