import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    level: 'all',
    category: 'all',
    dateRange: 'today',
    searchTerm: ''
  });
  const [realTimeEnabled, setRealTimeEnabled] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);

  const logLevels = [
    { id: 'all', name: 'All Levels', color: 'text-gray-600' },
    { id: 'error', name: 'Error', color: 'text-red-600' },
    { id: 'warning', name: 'Warning', color: 'text-yellow-600' },
    { id: 'info', name: 'Info', color: 'text-blue-600' },
    { id: 'debug', name: 'Debug', color: 'text-gray-600' }
  ];

  const logCategories = [
    { id: 'all', name: 'All Categories' },
    { id: 'authentication', name: 'Authentication' },
    { id: 'authorization', name: 'Authorization' },
    { id: 'file_upload', name: 'File Upload' },
    { id: 'payment_processing', name: 'Payment Processing' },
    { id: 'user_management', name: 'User Management' },
    { id: 'system', name: 'System' },
    { id: 'api', name: 'API' },
    { id: 'database', name: 'Database' }
  ];

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  useEffect(() => {
    let interval;
    if (realTimeEnabled) {
      interval = setInterval(() => {
        fetchLogs(true); // Real-time update without loading state
      }, 5000); // Update every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled, filters]);

  const fetchLogs = async (isRealTimeUpdate = false) => {
    try {
      if (!isRealTimeUpdate) setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would fetch from backend
      // const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM.LOGS}?${new URLSearchParams(filters)}`, token);
      
      // Mock data for demonstration
      const mockLogs = [
        {
          id: 'LOG-001',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          level: 'info',
          category: 'authentication',
          message: 'User login successful',
          details: {
            userId: 'user123',
            username: 'john.doe',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          },
          source: 'AuthController.java:45',
          requestId: 'req-12345'
        },
        {
          id: 'LOG-002',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          level: 'warning',
          category: 'file_upload',
          message: 'Large file upload detected',
          details: {
            fileName: 'worker_data_large.xlsx',
            fileSize: '15MB',
            userId: 'user456',
            maxAllowedSize: '10MB'
          },
          source: 'FileUploadController.java:89',
          requestId: 'req-12346'
        },
        {
          id: 'LOG-003',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          level: 'error',
          category: 'payment_processing',
          message: 'Payment processing failed',
          details: {
            paymentId: 'PAY-789',
            errorCode: 'INSUFFICIENT_FUNDS',
            amount: '₹50,000',
            employerId: 'EMP001',
            stackTrace: 'java.lang.RuntimeException: Insufficient funds...'
          },
          source: 'PaymentService.java:156',
          requestId: 'req-12347'
        },
        {
          id: 'LOG-004',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          level: 'info',
          category: 'api',
          message: 'API endpoint accessed',
          details: {
            endpoint: '/api/worker/payments',
            method: 'GET',
            responseTime: '245ms',
            statusCode: 200,
            userId: 'user123'
          },
          source: 'ApiController.java:23',
          requestId: 'req-12348'
        },
        {
          id: 'LOG-005',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          level: 'debug',
          category: 'database',
          message: 'Database query executed',
          details: {
            query: 'SELECT * FROM worker_payments WHERE status = ?',
            parameters: ['PENDING'],
            executionTime: '23ms',
            rowCount: 42
          },
          source: 'PaymentRepository.java:67',
          requestId: 'req-12349'
        },
        {
          id: 'LOG-006',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          level: 'warning',
          category: 'authorization',
          message: 'Access denied to restricted resource',
          details: {
            userId: 'user789',
            username: 'jane.smith',
            requestedResource: '/admin/users',
            userRoles: ['WORKER_DATA_OPERATOR'],
            requiredRoles: ['ADMIN']
          },
          source: 'AuthorizationFilter.java:78',
          requestId: 'req-12350'
        }
      ];

      // Apply filters
      let filteredLogs = mockLogs;
      
      if (filters.level !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.level === filters.level);
      }
      
      if (filters.category !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.category === filters.category);
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(searchLower) ||
          log.source.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.details).toLowerCase().includes(searchLower)
        );
      }

      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setTimeout(() => {
        setLogs(filteredLogs);
        if (!isRealTimeUpdate) setLoading(false);
      }, isRealTimeUpdate ? 0 : 1000);
      
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      if (!isRealTimeUpdate) setLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would export via backend
      // const response = await apiClient.get(`${API_ENDPOINTS.SYSTEM.EXPORT_LOGS}?${new URLSearchParams(filters)}`, token);
      
      // Simulate export
      const exportData = {
        exportInfo: {
          generatedAt: new Date().toISOString(),
          filters: filters,
          totalLogs: logs.length
        },
        logs: logs
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear old logs? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would clear via backend
      // await apiClient.delete(API_ENDPOINTS.SYSTEM.CLEAR_LOGS, token);
      
      // Simulate clearing logs older than 30 days
      setTimeout(() => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        setLogs(prev => prev.filter(log => new Date(log.timestamp) > thirtyDaysAgo));
        alert('Old logs cleared successfully');
      }, 1000);
      
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN');
  };

  const getLevelColor = (level) => {
    const levelObj = logLevels.find(l => l.id === level);
    return levelObj ? levelObj.color : 'text-gray-600';
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'debug': return '🔍';
      default: return '📝';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'authentication': return '🔐';
      case 'authorization': return '🛡️';
      case 'file_upload': return '📁';
      case 'payment_processing': return '💳';
      case 'user_management': return '👥';
      case 'system': return '⚙️';
      case 'api': return '🌐';
      case 'database': return '💾';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="system-logs-page">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="system-logs-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            📋 <span className="ml-2">System Logs</span>
          </h1>
          <p className="text-gray-600 mt-1">Monitor system activity and audit trail</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="realTime"
              checked={realTimeEnabled}
              onChange={(e) => setRealTimeEnabled(e.target.checked)}
              className="form-checkbox h-4 w-4 text-primary-600"
            />
            <label htmlFor="realTime" className="text-sm text-gray-700">
              Real-time
            </label>
            {realTimeEnabled && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          
          <ActionGate componentKey="system-logs" action="EXPORT">
            <button 
              onClick={handleExportLogs}
              className="btn btn-secondary flex items-center"
            >
              📄 Export
            </button>
          </ActionGate>
          
          <ActionGate componentKey="system-logs" action="MANAGE">
            <button 
              onClick={handleClearLogs}
              className="btn btn-danger flex items-center"
            >
              🗑️ Clear Old Logs
            </button>
          </ActionGate>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Level
            </label>
            <select
              value={filters.level}
              onChange={(e) => setFilters(prev => ({...prev, level: e.target.value}))}
              className="form-select w-full"
            >
              {logLevels.map(level => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
              className="form-select w-full"
            >
              {logCategories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({...prev, dateRange: e.target.value}))}
              className="form-select w-full"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({...prev, searchTerm: e.target.value}))}
              className="form-input w-full"
              placeholder="Search logs..."
            />
          </div>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {logLevels.slice(1).map(level => {
          const count = logs.filter(log => log.level === level.id).length;
          return (
            <div key={level.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center">
                <div className={`text-2xl mr-3 ${level.color}`}>
                  {getLevelIcon(level.id)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{level.name}</p>
                  <p className={`text-2xl font-bold ${level.color}`}>{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            System Logs ({logs.length} entries)
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-600">No logs found matching the current filters</p>
            </div>
          ) : (
            logs.map(log => (
              <div 
                key={log.id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedLog(log);
                  setShowLogModal(true);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`text-xl ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      
                      <span className="flex items-center text-xs text-gray-600">
                        {getCategoryIcon(log.category)}
                        <span className="ml-1">{log.category.replace('_', ' ').toUpperCase()}</span>
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-900 font-medium mb-1">{log.message}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{log.source}</span>
                      <span>Request ID: {log.requestId}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Detail Modal */}
      {showLogModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className={`text-xl mr-2 ${getLevelColor(selectedLog.level)}`}>
                    {getLevelIcon(selectedLog.level)}
                  </span>
                  Log Details
                </h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">Timestamp:</span>
                  <p className="text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Level:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedLog.level === 'error' ? 'bg-red-100 text-red-800' :
                    selectedLog.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    selectedLog.level === 'info' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedLog.level.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Category:</span>
                  <p className="text-sm text-gray-900">{selectedLog.category.replace('_', ' ')}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-700">Source:</span>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.source}</p>
                </div>
                
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-700">Request ID:</span>
                  <p className="text-sm text-gray-900 font-mono">{selectedLog.requestId}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Message:</span>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg">{selectedLog.message}</p>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-700">Details:</span>
                <pre className="text-xs text-gray-900 mt-1 p-3 bg-gray-50 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
