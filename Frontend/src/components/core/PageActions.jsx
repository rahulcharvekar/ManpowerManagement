import React from 'react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { useCatalog } from '../../contexts/CatalogContext';

/**
 * PageActions - Renders action buttons for a page based on capabilities
 * Integrates with service catalog for endpoint resolution
 */
const PageActions = ({ pageId, onAction, className = '' }) => {
  const { getPageActions, can } = useEnhancedAuth();
  const { resolveEndpoint } = useCatalog();

  const actions = getPageActions(pageId);

  if (!actions || actions.length === 0) {
    return null;
  }

  const handleAction = async (action) => {
    // Check capability before executing
    if (!can(action.capability)) {
      console.warn(`User does not have capability: ${action.capability}`);
      return;
    }

    // Resolve endpoint from service catalog
    const endpoint = resolveEndpoint(action.policy);
    
    if (!endpoint) {
      console.error(`Could not resolve endpoint for policy: ${action.policy}`);
      return;
    }

    // Call the parent handler with action details and endpoint
    if (onAction) {
      onAction({
        action: action.action,
        capability: action.capability,
        policy: action.policy,
        endpoint: endpoint
      });
    }
  };

  const getActionIcon = (actionName) => {
    const icons = {
      create: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
      ),
      edit: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      delete: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      validate: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      upload: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      download: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
      approve: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      ),
      reject: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      view: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      process: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    };
    return icons[actionName.toLowerCase()] || icons.view;
  };

  const getActionColor = (actionName) => {
    const colors = {
      create: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      edit: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      delete: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      validate: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
      upload: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      download: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500',
      approve: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      reject: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      view: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
      process: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    };
    return colors[actionName.toLowerCase()] || colors.view;
  };

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {actions.map((action) => {
        const hasCapability = can(action.capability);
        
        return (
          <button
            key={action.action}
            onClick={() => handleAction(action)}
            disabled={!hasCapability}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg
              text-white font-medium text-sm
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-sm hover:shadow-md
              ${hasCapability ? getActionColor(action.action) : 'bg-gray-400 cursor-not-allowed'}
            `}
            title={!hasCapability ? `Requires ${action.capability} capability` : ''}
          >
            {getActionIcon(action.action)}
            <span className="capitalize">{action.action}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PageActions;
