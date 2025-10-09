package com.example.paymentreconciliation.auth.security;

import com.example.paymentreconciliation.auth.entity.User;
import com.example.paymentreconciliation.auth.service.PermissionApiEndpointService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.List;
import java.util.Map;

/**
 * Interceptor to validate API endpoint permissions based on permission_api_endpoints table
 * This enforces backend authorization even when @PreAuthorize is not used
 */
@Component
public class PermissionAuthorizationInterceptor implements HandlerInterceptor {
    
    private static final Logger logger = LoggerFactory.getLogger(PermissionAuthorizationInterceptor.class);
    
    @Autowired
    private PermissionApiEndpointService permissionApiEndpointService;
    
    // Endpoints that should skip permission check
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/me",
        "/swagger-ui",
        "/v3/api-docs",
        "/actuator"
    );
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String requestUri = request.getRequestURI();
        String httpMethod = request.getMethod();
        
        // Skip public endpoints
        if (isPublicEndpoint(requestUri)) {
            return true;
        }
        
        // Get authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthenticated request to: {} {}", httpMethod, requestUri);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return false;
        }
        
        // Get user's allowed API endpoints
        Map<String, List<String>> userApiEndpoints = permissionApiEndpointService.getUserApiEndpoints();
        
        // Check if user has permission to access this endpoint
        boolean hasPermission = checkPermission(userApiEndpoints, httpMethod, requestUri);
        
        if (!hasPermission) {
            Object principal = authentication.getPrincipal();
            String username = principal instanceof User ? ((User) principal).getUsername() : principal.toString();
            
            logger.warn("Access denied for user {} to endpoint: {} {}", username, httpMethod, requestUri);
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "You don't have permission to access this resource");
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if endpoint is public and should skip authorization
     */
    private boolean isPublicEndpoint(String requestUri) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(requestUri::startsWith);
    }
    
    /**
     * Check if user has permission to access the endpoint
     */
    private boolean checkPermission(Map<String, List<String>> userApiEndpoints, String httpMethod, String requestUri) {
        // Iterate through all permission categories
        for (Map.Entry<String, List<String>> entry : userApiEndpoints.entrySet()) {
            List<String> endpoints = entry.getValue();
            
            for (String endpoint : endpoints) {
                // Parse endpoint format: "GET /api/users" or "/api/users"
                String[] parts = endpoint.trim().split("\\s+", 2);
                String method;
                String path;
                
                if (parts.length == 2) {
                    method = parts[0];
                    path = parts[1];
                } else {
                    method = "*"; // Any method
                    path = parts[0];
                }
                
                // Match method and path
                boolean methodMatches = method.equals("*") || method.equalsIgnoreCase(httpMethod);
                boolean pathMatches = matchPath(path, requestUri);
                
                if (methodMatches && pathMatches) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Match path patterns with path variables like /api/users/{id}
     */
    private boolean matchPath(String pattern, String requestUri) {
        // Exact match
        if (pattern.equals(requestUri)) {
            return true;
        }
        
        // Pattern matching with path variables
        String[] patternParts = pattern.split("/");
        String[] uriParts = requestUri.split("/");
        
        if (patternParts.length != uriParts.length) {
            return false;
        }
        
        for (int i = 0; i < patternParts.length; i++) {
            String patternPart = patternParts[i];
            String uriPart = uriParts[i];
            
            // Skip path variables like {id}, {userId}, etc.
            if (patternPart.startsWith("{") && patternPart.endsWith("}")) {
                continue;
            }
            
            // Parts must match exactly
            if (!patternPart.equals(uriPart)) {
                return false;
            }
        }
        
        return true;
    }
}
