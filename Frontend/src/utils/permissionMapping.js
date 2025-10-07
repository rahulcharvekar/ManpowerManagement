/**
 * Permission-API Mapping Utility
 * 
 * This file provides utility functions and constants for mapping permissions
 * to their corresponding API endpoints and UI components.
 * 
 * Based on the permission matrix from the database structure.
 */

// Permission to API endpoint mapping
export const PERMISSION_API_MAP = {
  // Worker Module Permissions
  READ_WORKER_DATA: [
    '/api/v1/worker-payments',
    '/api/worker/uploaded-data/files/summaries'
  ],
  UPLOAD_WORKER_DATA: [
    '/api/worker/uploaded-data/upload'
  ],
  VALIDATE_WORKER_DATA: [
    '/api/worker/uploaded-data/file/{fileId}/validate'
  ],
  GENERATE_WORKER_PAYMENTS: [
    '/api/v1/worker-payments'
  ],
  DELETE_WORKER_DATA: [
    '/api/v1/worker-payments/{id}',
    '/api/worker/uploaded-data/{id}'
  ],

  // Payment Module Permissions
  READ_PAYMENTS: [
    '/api/v1/worker-payments',
    '/api/payment-processing'
  ],
  PROCESS_PAYMENTS: [
    '/api/payment-processing/process'
  ],
  APPROVE_PAYMENTS: [
    '/api/payment-processing/{id}/approve',
    '/api/v1/worker-payments/{id}/approve'
  ],
  REJECT_PAYMENTS: [
    '/api/payment-processing/{id}/reject',
    '/api/v1/worker-payments/{id}/reject'
  ],
  GENERATE_PAYMENT_REPORTS: [
    '/api/v1/worker-payments/reports',
    '/api/payment-processing/reports'
  ],

  // Employer Module Permissions
  READ_EMPLOYER_RECEIPTS: [
    '/api/employer/receipts'
  ],
  VALIDATE_EMPLOYER_RECEIPTS: [
    '/api/employer/receipts/{id}/validate'
  ],
  SEND_TO_BOARD: [
    '/api/employer/receipts/{id}/send-to-board'
  ],

  // Board Module Permissions
  READ_BOARD_RECEIPTS: [
    '/api/v1/board-receipts'
  ],
  APPROVE_BOARD_RECEIPTS: [
    '/api/v1/board-receipts/{id}/approve'
  ],
  REJECT_BOARD_RECEIPTS: [
    '/api/v1/board-receipts/{id}/reject'
  ],
  GENERATE_BOARD_REPORTS: [
    '/api/v1/board-receipts/reports'
  ],

  // Reconciliation Module Permissions
  READ_RECONCILIATIONS: [
    '/api/v1/reconciliations'
  ],
  PERFORM_RECONCILIATION: [
    '/api/v1/reconciliations/perform'
  ],
  GENERATE_RECONCILIATION_REPORTS: [
    '/api/v1/reconciliations/export',
    '/api/v1/reconciliations/reports'
  ],

  // System Module Permissions
  MANAGE_USERS: [
    '/api/auth/users',
    '/api/auth/register',
    '/api/auth/users/{id}'
  ],
  MANAGE_ROLES: [
    '/api/admin/roles',
    '/api/admin/permissions',
    '/api/admin/roles/assign'
  ],
  VIEW_SYSTEM_LOGS: [
    '/api/debug/*',
    '/api/admin/logs'
  ],
  SYSTEM_MAINTENANCE: [
    '/api/system/config',
    '/api/system/info'
  ],
  DATABASE_CLEANUP: [
    '/api/system/database/cleanup'
  ]
};

// Module to permissions mapping
export const MODULE_PERMISSIONS = {
  WORKER: [
    'READ_WORKER_DATA',
    'UPLOAD_WORKER_DATA', 
    'VALIDATE_WORKER_DATA',
    'GENERATE_WORKER_PAYMENTS',
    'DELETE_WORKER_DATA'
  ],
  PAYMENT: [
    'READ_PAYMENTS',
    'PROCESS_PAYMENTS',
    'APPROVE_PAYMENTS', 
    'REJECT_PAYMENTS',
    'GENERATE_PAYMENT_REPORTS'
  ],
  EMPLOYER: [
    'READ_EMPLOYER_RECEIPTS',
    'VALIDATE_EMPLOYER_RECEIPTS',
    'SEND_TO_BOARD'
  ],
  BOARD: [
    'READ_BOARD_RECEIPTS',
    'APPROVE_BOARD_RECEIPTS',
    'REJECT_BOARD_RECEIPTS', 
    'GENERATE_BOARD_REPORTS'
  ],
  RECONCILIATION: [
    'READ_RECONCILIATIONS',
    'PERFORM_RECONCILIATION',
    'GENERATE_RECONCILIATION_REPORTS'
  ],
  SYSTEM: [
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'VIEW_SYSTEM_LOGS',
    'SYSTEM_MAINTENANCE',
    'DATABASE_CLEANUP'
  ]
};

// Role to typical permissions mapping (for reference)
export const ROLE_PERMISSION_MAP = {
  ADMIN: [
    // All permissions - admins have access to everything
    ...MODULE_PERMISSIONS.WORKER,
    ...MODULE_PERMISSIONS.PAYMENT,
    ...MODULE_PERMISSIONS.EMPLOYER,
    ...MODULE_PERMISSIONS.BOARD,
    ...MODULE_PERMISSIONS.RECONCILIATION,
    ...MODULE_PERMISSIONS.SYSTEM
  ],
  RECONCILIATION_OFFICER: [
    'READ_WORKER_DATA',
    'VALIDATE_WORKER_DATA',
    'READ_PAYMENTS',
    'PROCESS_PAYMENTS',
    'APPROVE_PAYMENTS',
    'REJECT_PAYMENTS',
    'GENERATE_PAYMENT_REPORTS',
    'READ_RECONCILIATIONS',
    'PERFORM_RECONCILIATION',
    'GENERATE_RECONCILIATION_REPORTS'
  ],
  WORKER: [
    'READ_WORKER_DATA',
    'UPLOAD_WORKER_DATA',
    'READ_PAYMENTS'
  ],
  EMPLOYER: [
    'READ_EMPLOYER_RECEIPTS',
    'VALIDATE_EMPLOYER_RECEIPTS',
    'SEND_TO_BOARD',
    'READ_PAYMENTS'
  ],
  BOARD: [
    'READ_BOARD_RECEIPTS',
    'APPROVE_BOARD_RECEIPTS', 
    'REJECT_BOARD_RECEIPTS',
    'GENERATE_BOARD_REPORTS'
  ]
};

// Component to required permissions mapping
export const COMPONENT_PERMISSIONS = {
  // Dashboard Components
  'worker-dashboard': ['READ_WORKER_DATA'],
  'worker-upload': ['UPLOAD_WORKER_DATA'],
  'worker-payments': ['READ_PAYMENTS'],
  
  // Employer Components
  'employer-dashboard': ['READ_EMPLOYER_RECEIPTS'],
  'employer-receipts': ['READ_EMPLOYER_RECEIPTS'],
  
  // Board Components
  'board-dashboard': ['READ_BOARD_RECEIPTS'],
  'board-receipts': ['READ_BOARD_RECEIPTS'],
  
  // Reconciliation Components
  'reconciliation-dashboard': ['READ_RECONCILIATIONS'],
  'payment-processing': ['PROCESS_PAYMENTS'],
  
  // Admin Components
  'user-management': ['MANAGE_USERS'],
  'system-settings': ['SYSTEM_MAINTENANCE'],
  'system-logs': ['VIEW_SYSTEM_LOGS'],
  
  // Reports
  'reports': ['GENERATE_PAYMENT_REPORTS', 'GENERATE_BOARD_REPORTS', 'GENERATE_RECONCILIATION_REPORTS']
};

// Utility functions
export const getPermissionsForModule = (module) => {
  return MODULE_PERMISSIONS[module] || [];
};

export const getAPIEndpointsForPermission = (permission) => {
  return PERMISSION_API_MAP[permission] || [];
};

export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSION_MAP[role] || [];
};

export const getRequiredPermissionsForComponent = (componentKey) => {
  return COMPONENT_PERMISSIONS[componentKey] || [];
};

export const hasRequiredPermissionForAPI = (userPermissions, apiEndpoint) => {
  // Find which permission is required for this API endpoint
  for (const [permission, endpoints] of Object.entries(PERMISSION_API_MAP)) {
    if (endpoints.some(endpoint => {
      // Handle wildcard matching for endpoints like /api/debug/*
      if (endpoint.includes('*')) {
        const baseEndpoint = endpoint.replace('*', '');
        return apiEndpoint.startsWith(baseEndpoint);
      }
      // Handle parameter placeholders like {id}
      const regex = endpoint.replace(/\{[^}]+\}/g, '[^/]+');
      return new RegExp(`^${regex}$`).test(apiEndpoint);
    })) {
      return userPermissions.includes(permission);
    }
  }
  return false;
};

// Navigation configuration based on permissions
export const getNavigationConfig = (userPermissions) => {
  const navigation = [];

  // Dashboard (always available)
  navigation.push({
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
    requiredPermissions: []
  });

  // Worker section
  const workerPermissions = userPermissions.filter(p => MODULE_PERMISSIONS.WORKER.includes(p));
  if (workerPermissions.length > 0) {
    const workerNav = {
      id: 'worker',
      label: 'Worker Management',
      icon: 'users',
      children: []
    };

    if (userPermissions.includes('READ_WORKER_DATA')) {
      workerNav.children.push({
        id: 'worker-data',
        label: 'Worker Data',
        path: '/worker/data'
      });
    }

    if (userPermissions.includes('UPLOAD_WORKER_DATA')) {
      workerNav.children.push({
        id: 'worker-upload',
        label: 'Upload Data',
        path: '/worker/upload'
      });
    }

    if (workerNav.children.length > 0) {
      navigation.push(workerNav);
    }
  }

  // Payment section
  const paymentPermissions = userPermissions.filter(p => MODULE_PERMISSIONS.PAYMENT.includes(p));
  if (paymentPermissions.length > 0) {
    const paymentNav = {
      id: 'payments',
      label: 'Payments',
      icon: 'credit-card',
      children: []
    };

    if (userPermissions.includes('READ_PAYMENTS')) {
      paymentNav.children.push({
        id: 'payment-list',
        label: 'View Payments',
        path: '/payments'
      });
    }

    if (userPermissions.includes('PROCESS_PAYMENTS')) {
      paymentNav.children.push({
        id: 'payment-processing',
        label: 'Process Payments',
        path: '/payments/process'
      });
    }

    if (paymentNav.children.length > 0) {
      navigation.push(paymentNav);
    }
  }

  // Add more sections based on other modules...

  return navigation;
};

export default {
  PERMISSION_API_MAP,
  MODULE_PERMISSIONS,
  ROLE_PERMISSION_MAP,
  COMPONENT_PERMISSIONS,
  getPermissionsForModule,
  getAPIEndpointsForPermission,
  getPermissionsForRole,
  getRequiredPermissionsForComponent,
  hasRequiredPermissionForAPI,
  getNavigationConfig
};
