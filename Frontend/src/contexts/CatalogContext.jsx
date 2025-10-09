import React, { createContext, useContext, useState, useEffect } from 'react';
import { catalogApi } from '../api/catalogApi';

const CatalogContext = createContext();

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};

export const CatalogProvider = ({ children }) => {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [etag, setEtag] = useState(null);

  // Load catalog on mount
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      if (!forceRefresh) {
        const cachedData = getCachedCatalog();
        if (cachedData) {
          setCatalog(cachedData.catalog);
          setEtag(cachedData.etag);
          setLoading(false);
          
          // Validate cache in background
          validateCache(cachedData.etag);
          return;
        }
      }

      // Fetch from server
      const response = await catalogApi.getServiceCatalog(forceRefresh ? null : etag);
      
      if (response.notModified && catalog) {
        // Cache is still valid
        setLoading(false);
        return;
      }

      // Update state and cache
      setCatalog(response.catalog);
      setEtag(response.etag);
      cacheCatalog(response.catalog, response.etag);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load service catalog:', err);
      setError(err.message || 'Failed to load service catalog');
      setLoading(false);
      
      // Try to use cached data as fallback
      const cachedData = getCachedCatalog();
      if (cachedData) {
        console.warn('Using cached catalog as fallback');
        setCatalog(cachedData.catalog);
        setEtag(cachedData.etag);
      }
    }
  };

  const validateCache = async (currentEtag) => {
    try {
      const response = await catalogApi.getServiceCatalog(currentEtag);
      
      if (!response.notModified) {
        // Cache is stale, update it
        setCatalog(response.catalog);
        setEtag(response.etag);
        cacheCatalog(response.catalog, response.etag);
      }
    } catch (err) {
      console.warn('Cache validation failed:', err);
    }
  };

  const getCachedCatalog = () => {
    try {
      const cached = localStorage.getItem('serviceCatalog');
      const cachedEtag = localStorage.getItem('serviceCatalogEtag');
      
      if (cached && cachedEtag) {
        return {
          catalog: JSON.parse(cached),
          etag: cachedEtag
        };
      }
    } catch (err) {
      console.warn('Failed to read cached catalog:', err);
    }
    return null;
  };

  const cacheCatalog = (catalogData, etagValue) => {
    try {
      localStorage.setItem('serviceCatalog', JSON.stringify(catalogData));
      localStorage.setItem('serviceCatalogEtag', etagValue);
    } catch (err) {
      console.warn('Failed to cache catalog:', err);
    }
  };

  const clearCache = () => {
    localStorage.removeItem('serviceCatalog');
    localStorage.removeItem('serviceCatalogEtag');
    setCatalog(null);
    setEtag(null);
  };

  /**
   * Resolve endpoint by policy name
   * @param {string} policyName - The policy name to look up
   * @returns {Object|null} - Endpoint with method and path, or null
   */
  const resolveEndpoint = (policyName) => {
    if (!catalog || !catalog.services) {
      console.warn('Service catalog not loaded');
      return null;
    }

    for (const service of catalog.services) {
      for (const endpoint of service.endpoints) {
        if (endpoint.policies && endpoint.policies.includes(policyName)) {
          return {
            service: service.name,
            method: endpoint.method,
            path: endpoint.path,
            policies: endpoint.policies
          };
        }
      }
    }

    console.warn(`No endpoint found for policy: ${policyName}`);
    return null;
  };

  /**
   * Get all endpoints for a service
   * @param {string} serviceName - The service name
   * @returns {Array} - List of endpoints
   */
  const getServiceEndpoints = (serviceName) => {
    if (!catalog || !catalog.services) {
      return [];
    }

    const service = catalog.services.find(s => s.name === serviceName);
    return service ? service.endpoints : [];
  };

  /**
   * Get catalog version
   * @returns {string|null} - Catalog version
   */
  const getCatalogVersion = () => {
    return catalog?.version || null;
  };

  const value = {
    catalog,
    loading,
    error,
    etag,
    loadCatalog,
    clearCache,
    resolveEndpoint,
    getServiceEndpoints,
    getCatalogVersion
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
};

export default CatalogContext;
