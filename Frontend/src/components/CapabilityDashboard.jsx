import React, { useState, useEffect } from 'react';
import { useEnhancedAuth } from '../contexts/EnhancedAuthContext';
import { useCatalog } from '../contexts/CatalogContext';
import PageActions from '../components/core/PageActions';
import PermissionGate from '../components/core/PermissionGate';
import useCapabilityAPI from '../hooks/useCapabilityAPI';

/**
 * CapabilityDashboard - Sample dashboard using the new capability system
 * Demonstrates how to use capabilities, policies, and service catalog
 */
const CapabilityDashboard = () => {
  const { user, can, getPages, auth } = useEnhancedAuth();
  const { getCatalogVersion, catalog } = useCatalog();
  const { call } = useCapabilityAPI();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Example: Load dashboard stats if user has capability
      // const response = await call({
      //   capability: 'DASHBOARD.READ',
      //   policy: 'policy.dashboard.read'
      // });
      // setStats(response);
      
      // For demo, set mock stats
      setStats({
        totalUsers: 125,
        activeWorkers: 89,
        pendingPayments: 12,
        completedTasks: 247
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageAction = async (actionDetails) => {
    console.log('Action triggered:', actionDetails);
    
    try {
      // Use the capability API to make the call
      await call({
        capability: actionDetails.capability,
        policy: actionDetails.policy,
        data: { /* action data */ }
      });
      
      // Refresh data after action
      await loadDashboardData();
    } catch (error) {
      console.error('Action failed:', error);
      alert(`Action failed: ${error.message}`);
    }
  };

  const pages = getPages();
  const dashboardPage = pages.find(p => p.pageId === 'DASHBOARD') || pages[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, <span className="font-medium text-gray-700">{user?.fullName || user?.username}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Catalog Version</div>
                <div className="text-sm font-mono font-medium text-gray-700">
                  {getCatalogVersion() || 'Loading...'}
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Actions */}
        {dashboardPage && (
          <div className="mb-6">
            <PageActions 
              pageId={dashboardPage.pageId} 
              onAction={handlePageAction}
            />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon="users"
            color="blue"
            loading={loading}
            capability="USER_MANAGEMENT.READ"
          />
          <StatCard
            title="Active Workers"
            value={stats?.activeWorkers || 0}
            icon="worker"
            color="green"
            loading={loading}
            capability="WORKER.READ"
          />
          <StatCard
            title="Pending Payments"
            value={stats?.pendingPayments || 0}
            icon="payment"
            color="yellow"
            loading={loading}
            capability="PAYMENT.READ"
          />
          <StatCard
            title="Completed Tasks"
            value={stats?.completedTasks || 0}
            icon="check"
            color="purple"
            loading={loading}
            capability="DASHBOARD.READ"
          />
        </div>

        {/* Capabilities Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CapabilitiesCard auth={auth} />
          <ServiceCatalogCard catalog={catalog} />
        </div>

        {/* Recent Activity - Only for users with specific capability */}
        <PermissionGate capability="AUDIT.READ">
          <div className="mt-6">
            <RecentActivityCard />
          </div>
        </PermissionGate>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color, loading, capability }) => {
  const { can } = useEnhancedAuth();
  const hasAccess = can(capability);

  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  const icons = {
    users: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    worker: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    payment: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    check: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-50">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-400">{icons[icon]}</div>
          <div className="text-xs text-gray-400">No Access</div>
        </div>
        <div className="text-2xl font-bold text-gray-300">***</div>
        <div className="text-sm text-gray-400 mt-1">{title}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`bg-gradient-to-br ${colors[color]} text-white p-3 rounded-lg`}>
          {icons[icon]}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900">
        {loading ? (
          <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-gray-500 mt-1">{title}</div>
    </div>
  );
};

// Capabilities Card Component
const CapabilitiesCard = ({ auth }) => {
  const capabilities = auth?.can ? Object.keys(auth.can).filter(key => auth.can[key]) : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Your Capabilities</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {capabilities.length > 0 ? (
          capabilities.map(cap => (
            <div key={cap} className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <code className="text-gray-700 font-mono">{cap}</code>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No capabilities loaded</p>
        )}
      </div>
    </div>
  );
};

// Service Catalog Card Component
const ServiceCatalogCard = ({ catalog }) => {
  const services = catalog?.services || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Service Catalog</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {services.length > 0 ? (
          services.map(service => (
            <div key={service.name} className="border-l-4 border-blue-500 pl-3">
              <div className="font-medium text-gray-900">{service.name}</div>
              <div className="text-xs text-gray-500">
                {service.endpoints?.length || 0} endpoints
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">Service catalog not loaded</p>
        )}
      </div>
    </div>
  );
};

// Recent Activity Card Component
const RecentActivityCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        <ActivityItem 
          action="User login"
          user="admin@example.com"
          time="2 minutes ago"
          icon="login"
        />
        <ActivityItem 
          action="Worker data uploaded"
          user="operator@example.com"
          time="15 minutes ago"
          icon="upload"
        />
        <ActivityItem 
          action="Payment processed"
          user="finance@example.com"
          time="1 hour ago"
          icon="payment"
        />
      </div>
    </div>
  );
};

const ActivityItem = ({ action, user, time, icon }) => {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{user} • {time}</p>
      </div>
    </div>
  );
};

export default CapabilityDashboard;
