// Capability-Based Authorization System - Exports
// Central export file for all capability system components

// Contexts
export { EnhancedAuthProvider, useEnhancedAuth } from './contexts/EnhancedAuthContext';
export { CatalogProvider, useCatalog } from './contexts/CatalogContext';

// Core Components
export { default as RouteGuard } from './components/core/RouteGuard';
export { default as PermissionGate } from './components/core/PermissionGate';
export { default as PageActions } from './components/core/PageActions';
export { default as SidebarMenu } from './components/core/SidebarMenu';
export { default as CapabilityLayout } from './components/core/CapabilityLayout';

// UI Components
export { default as CapabilityDashboard } from './components/CapabilityDashboard';
export { default as UnauthorizedPage } from './components/UnauthorizedPage';

// Hooks
export { default as useCapabilityAPI } from './hooks/useCapabilityAPI';

// API Services
export { authorizationService } from './api/authorizationApi';
export { catalogApi } from './api/catalogApi';

// App
export { default as CapabilityApp } from './CapabilityApp';
