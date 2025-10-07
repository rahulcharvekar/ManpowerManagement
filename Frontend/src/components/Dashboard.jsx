import React, { useState, useEffect } from 'react';
import { usePermissions } from '../contexts/PermissionContext';
import ActionGate from './core/ActionGate';

const Dashboard = () => {
  const { getUserInfo, canPerformAction } = usePermissions();
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalPayments: 0,
    pendingApprovals: 0,
    totalWorkers: 0
  });

  const userInfo = getUserInfo();

  useEffect(() => {
    // Simulate fetching dashboard data
    // In real implementation, this would be API calls
    const fetchDashboardData = async () => {
      // Mock data for demonstration
      setDashboardData({
        totalUsers: 125,
        totalPayments: 1250,
        pendingApprovals: 23,
        totalWorkers: 850
      });
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      componentKey: 'user-management'
    },
    {
      title: 'Total Payments',
      value: dashboardData.totalPayments,
      icon: '💳',
      color: 'bg-green-500',
      componentKey: 'payment-processing'
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.pendingApprovals,
      icon: '⏳',
      color: 'bg-orange-500',
      componentKey: 'payment-processing'
    },
    {
      title: 'Total Workers',
      value: dashboardData.totalWorkers,
      icon: '👷',
      color: 'bg-purple-500',
      componentKey: 'worker-payments'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              🏠 <span className="ml-2">Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userInfo?.fullName || userInfo?.username}!
            </p>
          </div>
          
          <ActionGate componentKey="dashboard" action="ANALYTICS">
            <button className="btn btn-primary">
              📊 View Analytics
            </button>
          </ActionGate>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <ActionGate componentKey="user-management" action="CREATE">
            <div className="action-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white mr-3">
                  👥
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add New User</h3>
                  <p className="text-sm text-gray-600">Create a new system user</p>
                </div>
              </div>
            </div>
          </ActionGate>

          <ActionGate componentKey="payment-processing" action="CREATE">
            <div className="action-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mr-3">
                  💳
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Process Payment</h3>
                  <p className="text-sm text-gray-600">Create new payment record</p>
                </div>
              </div>
            </div>
          </ActionGate>

          <ActionGate componentKey="worker-upload" action="UPLOAD">
            <div className="action-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white mr-3">
                  📁
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Upload Worker Data</h3>
                  <p className="text-sm text-gray-600">Bulk upload worker information</p>
                </div>
              </div>
            </div>
          </ActionGate>

          <ActionGate componentKey="reports" action="VIEW">
            <div className="action-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white mr-3">
                  📈
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-600">Access system reports</p>
                </div>
              </div>
            </div>
          </ActionGate>

        </div>
      </div>

      {/* Recent Activity */}
      <ActionGate componentKey="dashboard" action="ANALYTICS">
        <div className="recent-activity">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    👤
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">New user <span className="font-medium">john.doe</span> created</p>
                    <p className="text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    💰
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Payment of $1,250 approved</p>
                    <p className="text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                
                <div className="flex items-center text-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    📄
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Worker data uploaded - 45 records</p>
                    <p className="text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ActionGate>
    </div>
  );
};

export default Dashboard;
