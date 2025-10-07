package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.entity.Permission;
import com.example.paymentreconciliation.auth.entity.PermissionApiEndpoint;
import com.example.paymentreconciliation.auth.repository.PermissionApiEndpointRepository;
import com.example.paymentreconciliation.auth.repository.PermissionRepository;
import com.example.paymentreconciliation.auth.dao.PermissionQueryDao;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PermissionApiEndpointService {
    
    private static final Logger logger = LoggerFactory.getLogger(PermissionApiEndpointService.class);
    
    @Autowired
    private PermissionApiEndpointRepository permissionApiEndpointRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    @Autowired
    private PermissionQueryDao permissionQueryDao;
    
    @Autowired
    private AuthService authService;
    
    /**
     * Get API endpoints for current user's permissions in the requested format
     * Returns: { "PERMISSION_NAME": ["endpoint1", "endpoint2"] }
     */
    public Map<String, List<String>> getUserApiEndpoints() {
        try {
            // Get current user's permissions
            Set<String> userPermissions = authService.getCurrentUserPermissionNames();
            
            if (userPermissions.isEmpty()) {
                logger.warn("No permissions found for current user");
                return new HashMap<>();
            }
            
            logger.info("Getting API endpoints for user permissions: {}", userPermissions);
            
            // Get API endpoints for those permissions
            List<Object[]> results = permissionApiEndpointRepository
                .findEndpointsByPermissionNames(userPermissions);
            
            // Group by permission name
            Map<String, List<String>> permissionEndpoints = new HashMap<>();
            
            for (Object[] result : results) {
                String permissionName = (String) result[0];
                String apiEndpoint = (String) result[1];
                
                permissionEndpoints.computeIfAbsent(permissionName, k -> new ArrayList<>())
                    .add(apiEndpoint);
            }
            
            logger.info("Retrieved API endpoints for {} permissions", permissionEndpoints.size());
            return permissionEndpoints;
            
        } catch (Exception e) {
            logger.error("Failed to get user API endpoints", e);
            return new HashMap<>();
        }
    }
    
    /**
     * Get detailed API endpoints with HTTP methods for current user
     */
    public Map<String, List<Map<String, String>>> getUserDetailedApiEndpoints() {
        try {
            Set<String> userPermissions = authService.getCurrentUserPermissionNames();
            
            if (userPermissions.isEmpty()) {
                return new HashMap<>();
            }
            
            List<PermissionApiEndpoint> endpoints = permissionApiEndpointRepository
                .findActiveEndpointsByPermissionNames(userPermissions);
            
            Map<String, List<Map<String, String>>> result = new HashMap<>();
            
            for (PermissionApiEndpoint endpoint : endpoints) {
                String permissionName = endpoint.getPermission().getName();
                
                Map<String, String> endpointDetails = new HashMap<>();
                endpointDetails.put("endpoint", endpoint.getApiEndpoint());
                endpointDetails.put("method", endpoint.getHttpMethod());
                endpointDetails.put("description", endpoint.getDescription());
                
                result.computeIfAbsent(permissionName, k -> new ArrayList<>())
                    .add(endpointDetails);
            }
            
            return result;
            
        } catch (Exception e) {
            logger.error("Failed to get detailed user API endpoints", e);
            return new HashMap<>();
        }
    }
    
    /**
     * Check if user can access a specific API endpoint
     */
    public boolean canUserAccessEndpoint(String apiEndpoint, String httpMethod) {
        try {
            Set<String> userPermissions = authService.getCurrentUserPermissionNames();
            
            for (String permissionName : userPermissions) {
                if (permissionApiEndpointRepository.existsByPermissionNameAndEndpointAndMethod(
                    permissionName, apiEndpoint, httpMethod)) {
                    return true;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            logger.error("Failed to check endpoint access for {}", apiEndpoint, e);
            return false;
        }
    }
    
    // CRUD Operations for Admin
    
    /**
     * Get all permission API endpoints
     */
    @Transactional(readOnly = true)
    public List<PermissionApiEndpoint> getAllEndpoints() {
        return permissionApiEndpointRepository.findAll();
    }
    
    /**
     * Get endpoint by ID
     */
    @Transactional(readOnly = true)
    public Optional<PermissionApiEndpoint> getEndpointById(Long id) {
        return permissionApiEndpointRepository.findById(id);
    }
    
    /**
     * Create new permission API endpoint
     */
    public PermissionApiEndpoint createEndpoint(String permissionName, String apiEndpoint, 
                                              String httpMethod, String description) {
        logger.info("Creating new API endpoint mapping: {} -> {} {}", permissionName, httpMethod, apiEndpoint);
        
        // Find permission by name
        Permission permission = permissionQueryDao.findByName(permissionName)
            .orElseThrow(() -> new EntityNotFoundException("Permission not found: " + permissionName));
        
        PermissionApiEndpoint endpoint = new PermissionApiEndpoint();
        endpoint.setPermissionId(permission.getId());
        endpoint.setApiEndpoint(apiEndpoint);
        endpoint.setHttpMethod(httpMethod.toUpperCase());
        endpoint.setDescription(description);
        endpoint.setCreatedAt(LocalDateTime.now());
        
        return permissionApiEndpointRepository.save(endpoint);
    }
    
    /**
     * Update permission API endpoint
     */
    public PermissionApiEndpoint updateEndpoint(Long id, String permissionName, String apiEndpoint,
                                              String httpMethod, String description, Boolean isActive) {
        logger.info("Updating API endpoint mapping with ID: {}", id);
        
        PermissionApiEndpoint endpoint = permissionApiEndpointRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("API endpoint mapping not found with ID: " + id));
        
        // Find permission by name if changed
        if (!permissionName.equals(endpoint.getPermission().getName())) {
            Permission permission = permissionQueryDao.findByName(permissionName)
                .orElseThrow(() -> new EntityNotFoundException("Permission not found: " + permissionName));
            endpoint.setPermissionId(permission.getId());
        }
        
        endpoint.setApiEndpoint(apiEndpoint);
        endpoint.setHttpMethod(httpMethod.toUpperCase());
        endpoint.setDescription(description);
        endpoint.setIsActive(isActive);
        endpoint.setUpdatedAt(LocalDateTime.now());
        
        return permissionApiEndpointRepository.save(endpoint);
    }
    
    /**
     * Delete permission API endpoint
     */
    public void deleteEndpoint(Long id) {
        logger.info("Deleting API endpoint mapping with ID: {}", id);
        
        if (!permissionApiEndpointRepository.existsById(id)) {
            throw new EntityNotFoundException("API endpoint mapping not found with ID: " + id);
        }
        
        permissionApiEndpointRepository.deleteById(id);
    }
    
    /**
     * Deactivate permission API endpoint (soft delete)
     */
    public void deactivateEndpoint(Long id) {
        logger.info("Deactivating API endpoint mapping with ID: {}", id);
        
        PermissionApiEndpoint endpoint = permissionApiEndpointRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("API endpoint mapping not found with ID: " + id));
        
        endpoint.setIsActive(false);
        endpoint.setUpdatedAt(LocalDateTime.now());
        permissionApiEndpointRepository.save(endpoint);
    }
    
    /**
     * Activate permission API endpoint
     */
    public void activateEndpoint(Long id) {
        logger.info("Activating API endpoint mapping with ID: {}", id);
        
        PermissionApiEndpoint endpoint = permissionApiEndpointRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("API endpoint mapping not found with ID: " + id));
        
        endpoint.setIsActive(true);
        endpoint.setUpdatedAt(LocalDateTime.now());
        permissionApiEndpointRepository.save(endpoint);
    }
    
    /**
     * Get endpoints by permission name
     */
    @Transactional(readOnly = true)
    public List<PermissionApiEndpoint> getEndpointsByPermissionName(String permissionName) {
        return permissionApiEndpointRepository.findActiveEndpointsByPermissionName(permissionName);
    }
    
    /**
     * Get endpoint statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getEndpointStatistics() {
        List<Object[]> stats = permissionApiEndpointRepository.getEndpointCountByPermission();
        
        Map<String, Long> endpointCounts = stats.stream()
            .collect(Collectors.toMap(
                stat -> (String) stat[0],
                stat -> (Long) stat[1]
            ));
        
        long totalEndpoints = endpointCounts.values().stream().mapToLong(Long::longValue).sum();
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalEndpoints", totalEndpoints);
        result.put("endpointsByPermission", endpointCounts);
        result.put("permissionCount", endpointCounts.size());
        
        return result;
    }
}
