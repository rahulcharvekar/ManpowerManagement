import React, { useState, useEffect } from 'react';
import ActionGate from '../core/ActionGate';
import { API_ENDPOINTS, apiClient } from '../../api/apiConfig';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(null);
  const [reportFilters, setReportFilters] = useState({
    reportType: 'payment_summary',
    dateRange: 'this_month',
    startDate: '',
    endDate: '',
    employerId: '',
    status: 'all'
  });

  const reportTypes = [
    {
      id: 'payment_summary',
      name: 'Payment Summary Report',
      description: 'Overview of all payments by status and employer',
      icon: '💰',
      category: 'Financial'
    },
    {
      id: 'worker_payments',
      name: 'Worker Payments Report',
      description: 'Detailed worker payment transactions',
      icon: '👷',
      category: 'Worker Management'
    },
    {
      id: 'employer_receipts',
      name: 'Employer Receipts Report',
      description: 'Employer receipt validation and processing status',
      icon: '🧾',
      category: 'Employer Management'
    },
    {
      id: 'board_approvals',
      name: 'Board Approvals Report',
      description: 'Board receipt approvals and payment initiation',
      icon: '📄',
      category: 'Board Management'
    },
    {
      id: 'reconciliation',
      name: 'Reconciliation Report',
      description: 'Payment reconciliation status and discrepancies',
      icon: '📊',
      category: 'Reconciliation'
    },
    {
      id: 'system_audit',
      name: 'System Audit Report',
      description: 'User activities and system operations log',
      icon: '🔍',
      category: 'System'
    },
    {
      id: 'performance_analytics',
      name: 'Performance Analytics',
      description: 'System performance metrics and trends',
      icon: '📈',
      category: 'Analytics'
    },
    {
      id: 'compliance_report',
      name: 'Compliance Report',
      description: 'Regulatory compliance and documentation status',
      icon: '⚖️',
      category: 'Compliance'
    }
  ];

  useEffect(() => {
    fetchRecentReports();
  }, []);

  const fetchRecentReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would fetch from backend
      // const response = await apiClient.get(API_ENDPOINTS.REPORTS.RECENT, token);
      
      // Mock data for demonstration
      setTimeout(() => {
        setReports([
          {
            id: 'RPT-001',
            name: 'Payment Summary - October 2024',
            type: 'payment_summary',
            generatedAt: new Date(Date.now() - 3600000).toISOString(),
            generatedBy: 'Admin User',
            fileSize: '2.3 MB',
            format: 'PDF',
            status: 'completed',
            downloadUrl: '#'
          },
          {
            id: 'RPT-002',
            name: 'Worker Payments - Week 40',
            type: 'worker_payments',
            generatedAt: new Date(Date.now() - 86400000).toISOString(),
            generatedBy: 'Reconciliation Officer',
            fileSize: '5.7 MB',
            format: 'Excel',
            status: 'completed',
            downloadUrl: '#'
          },
          {
            id: 'RPT-003',
            name: 'Reconciliation Report - September',
            type: 'reconciliation',
            generatedAt: new Date(Date.now() - 172800000).toISOString(),
            generatedBy: 'Board Admin',
            fileSize: '1.8 MB',
            format: 'PDF',
            status: 'completed',
            downloadUrl: '#'
          }
        ]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(reportFilters.reportType);
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would generate report via backend
      // const response = await apiClient.post(API_ENDPOINTS.REPORTS.GENERATE, reportFilters, token);
      
      // Simulate report generation
      setTimeout(() => {
        const reportType = reportTypes.find(r => r.id === reportFilters.reportType);
        const newReport = {
          id: `RPT-${String(reports.length + 1).padStart(3, '0')}`,
          name: `${reportType.name} - ${new Date().toLocaleDateString('en-IN')}`,
          type: reportFilters.reportType,
          generatedAt: new Date().toISOString(),
          generatedBy: 'Current User',
          fileSize: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
          format: reportFilters.reportType.includes('analytics') ? 'Excel' : 'PDF',
          status: 'completed',
          downloadUrl: '#'
        };
        
        setReports(prev => [newReport, ...prev]);
        setGeneratingReport(null);
        
        // Trigger download simulation
        handleDownloadReport(newReport);
      }, 3000);
      
    } catch (error) {
      console.error('Failed to generate report:', error);
      setGeneratingReport(null);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      // In real implementation, this would download from backend
      // const response = await apiClient.get(`${API_ENDPOINTS.REPORTS.DOWNLOAD}/${report.id}`, token);
      
      // Simulate download
      const reportContent = `
${report.name}
Generated: ${new Date(report.generatedAt).toLocaleString('en-IN')}
Generated By: ${report.generatedBy}
Format: ${report.format}

[This is a simulated report download]

Report Details:
- Type: ${report.type}
- Status: ${report.status}
- File Size: ${report.fileSize}

Content would include actual report data based on the selected filters and criteria.
      `;
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.name.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleScheduleReport = async (reportType) => {
    const schedule = window.prompt('Enter schedule (e.g., "daily", "weekly", "monthly"):');
    if (!schedule) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      // In real implementation, this would schedule via backend
      // await apiClient.post(`${API_ENDPOINTS.REPORTS.SCHEDULE}`, { reportType, schedule }, token);
      
      alert(`Report "${reportType}" scheduled for ${schedule} generation.`);
      
    } catch (error) {
      console.error('Failed to schedule report:', error);
    }
  };

  const formatFileSize = (size) => {
    return size || 'Unknown';
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN');
  };

  const getReportIcon = (reportType) => {
    const report = reportTypes.find(r => r.id === reportType);
    return report ? report.icon : '📄';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group report types by category
  const reportsByCategory = reportTypes.reduce((acc, report) => {
    if (!acc[report.category]) acc[report.category] = [];
    acc[report.category].push(report);
    return acc;
  }, {});

  return (
    <div className="reports-page">
      {/* Page Header */}
      <div className="page-header flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            📈 <span className="ml-2">Reports & Analytics</span>
          </h1>
          <p className="text-gray-600 mt-1">Generate and manage system reports and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Report Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Report Type Selection */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
            
            {/* Report Types by Category */}
            <div className="space-y-6">
              {Object.entries(reportsByCategory).map(([category, categoryReports]) => (
                <div key={category}>
                  <h4 className="text-md font-medium text-gray-700 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryReports.map(report => (
                      <div
                        key={report.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          reportFilters.reportType === report.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setReportFilters(prev => ({...prev, reportType: report.id}))}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{report.icon}</span>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{report.name}</h5>
                            <p className="text-sm text-gray-600">{report.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Report Filters */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-700 mb-4">Report Filters</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={reportFilters.dateRange}
                    onChange={(e) => setReportFilters(prev => ({...prev, dateRange: e.target.value}))}
                    className="form-select w-full"
                  >
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this_week">This Week</option>
                    <option value="last_week">Last Week</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Filter
                  </label>
                  <select
                    value={reportFilters.status}
                    onChange={(e) => setReportFilters(prev => ({...prev, status: e.target.value}))}
                    className="form-select w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="validated">Validated</option>
                    <option value="approved">Approved</option>
                    <option value="processed">Processed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                {reportFilters.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={reportFilters.startDate}
                        onChange={(e) => setReportFilters(prev => ({...prev, startDate: e.target.value}))}
                        className="form-input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={reportFilters.endDate}
                        onChange={(e) => setReportFilters(prev => ({...prev, endDate: e.target.value}))}
                        className="form-input w-full"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employer ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportFilters.employerId}
                    onChange={(e) => setReportFilters(prev => ({...prev, employerId: e.target.value}))}
                    className="form-input w-full"
                    placeholder="Filter by specific employer"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <ActionGate componentKey="reports" action="EXPORT">
                  <button
                    onClick={() => handleScheduleReport(reportFilters.reportType)}
                    className="btn btn-secondary flex items-center"
                  >
                    ⏰ Schedule Report
                  </button>
                </ActionGate>
                
                <ActionGate componentKey="reports" action="EXPORT">
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport === reportFilters.reportType}
                    className="btn btn-primary flex items-center"
                  >
                    {generatingReport === reportFilters.reportType ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>📊 Generate Report</>
                    )}
                  </button>
                </ActionGate>
              </div>
            </div>
          </div>
          
        </div>

        {/* Recent Reports Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Reports</span>
                <span className="font-semibold text-gray-900">{reports.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold text-gray-900">
                  {reports.filter(r => new Date(r.generatedAt).getMonth() === new Date().getMonth()).length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Size</span>
                <span className="font-semibold text-gray-900">
                  {(reports.reduce((sum, r) => sum + parseFloat(r.fileSize), 0)).toFixed(1)} MB
                </span>
              </div>
            </div>
          </div>
          
          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-3xl mb-2">📄</div>
                  <p className="text-gray-600 text-sm">No reports generated yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map(report => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">{getReportIcon(report.type)}</span>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{report.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDateTime(report.generatedAt)}
                          </p>
                          <p className="text-xs text-gray-600">
                            By {report.generatedBy} • {formatFileSize(report.fileSize)}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                            
                            <ActionGate componentKey="reports" action="VIEW">
                              <button
                                onClick={() => handleDownloadReport(report)}
                                className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                              >
                                Download
                              </button>
                            </ActionGate>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Reports;
