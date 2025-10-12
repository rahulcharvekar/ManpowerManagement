package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.entity.*;
import com.example.paymentreconciliation.auth.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Authorization Service - Unified authorization flow implementation
 * 
 * ARCHITECTURE:
 * User → UserRoleAssignment → Role → Policy → {Capability, Endpoint}
 * PageAction → Capability ↑ (linked via PolicyCapability)
 * 
 * PRINCIPLE: Policy is the single source of truth
 * - If Policy grants Capability, it MUST grant required Endpoints
 * - User access is determined by: Role → Policy → {Capabilities + Endpoints}
 * 
 * Returns capabilities, policies, endpoints, and UI pages for authenticated users
 */
@Service
public class AuthorizationService {
    /**
     * Get all endpoints for a given UI page id (regardless of user)
     *
     * @param pageId the UI page id
     * @return List of endpoint details for the page
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEndpointsForPage(Long pageId) {
        List<PageAction> actions = pageActionRepository.findByPageIdAndIsActiveTrue(pageId);
        List<Map<String, Object>> endpoints = new ArrayList<>();
        for (PageAction action : actions) {
            if (action.getEndpoint() != null) {
                Map<String, Object> endpointData = new HashMap<>();
                endpointData.put("method", action.getEndpoint().getMethod());
                endpointData.put("path", action.getEndpoint().getPath());
                endpointData.put("service", action.getEndpoint().getService());
                endpointData.put("version", action.getEndpoint().getVersion());
                endpointData.put("description", action.getEndpoint().getDescription());
                endpointData.put("ui_type", action.getEndpoint().getUiType());
                endpoints.add(endpointData);
            }
        }
        return endpoints;
    }

    private static final Logger logger = LoggerFactory.getLogger(AuthorizationService.class);

    private final UserRepository userRepository;
    private final UserRoleAssignmentRepository userRoleRepository;
    private final PolicyRepository policyRepository;
    private final CapabilityRepository capabilityRepository;
    private final EndpointRepository endpointRepository;
    private final UIPageRepository uiPageRepository;
    private final PageActionRepository pageActionRepository;

    public AuthorizationService(
            UserRepository userRepository,
            UserRoleAssignmentRepository userRoleRepository,
            PolicyRepository policyRepository,
            CapabilityRepository capabilityRepository,
            EndpointRepository endpointRepository,
            UIPageRepository uiPageRepository,
            PageActionRepository pageActionRepository) {
        this.userRepository = userRepository;
        this.userRoleRepository = userRoleRepository;
        this.policyRepository = policyRepository;
        this.capabilityRepository = capabilityRepository;
        this.endpointRepository = endpointRepository;
        this.uiPageRepository = uiPageRepository;
        this.pageActionRepository = pageActionRepository;
    }

    /**
     * Get comprehensive authorization data for a user
     * 
     * @param userId The user ID
     * @return Map containing roles, capabilities, pages, and menu tree
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserAuthorizations(Long userId) {
        logger.debug("Building authorization response for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Get user's roles
        List<UserRoleAssignment> userRoles = userRoleRepository.findByUserId(userId);
        Set<String> roleNames = userRoles.stream()
                .map(ur -> ur.getRole().getName())
                .collect(Collectors.toSet());

        logger.debug("User {} has roles: {}", userId, roleNames);

    // Get capabilities for user's roles
    Set<String> capabilities = getCapabilitiesForRoles(roleNames);

    // Get accessible pages for user's roles, filtered by capabilities
    List<Map<String, Object>> pages = getAccessiblePagesFilteredByCapabilities(roleNames, capabilities);

    // Build response (without endpoints)
    Map<String, Object> response = new HashMap<>();
    response.put("userId", userId);
    response.put("username", user.getUsername());
    response.put("roles", roleNames);
    response.put("can", buildCapabilityMap(capabilities)); // { "USER_CREATE": true, ...}
    response.put("pages", pages);
    response.put("version", System.currentTimeMillis()); // For client-side cache invalidation

    logger.debug("Authorization response built successfully for user: {}", userId);
    return response;
    }

    /**
     * Get all capabilities granted to specific roles
     */
    private Set<String> getCapabilitiesForRoles(Set<String> roleNames) {
        Set<String> capabilities = new HashSet<>();

        for (String roleName : roleNames) {
            List<String> roleCapabilities = capabilityRepository.findCapabilityNamesByRoleName(roleName);
            capabilities.addAll(roleCapabilities);
        }

        logger.debug("Found {} capabilities for roles: {}", capabilities.size(), roleNames);
        return capabilities;
    }

    /**
     * Get accessible pages for user's roles
     */
    private List<Map<String, Object>> getAccessiblePagesFilteredByCapabilities(Set<String> roleNames, Set<String> capabilities) {
        List<UIPage> allPages = uiPageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        List<Map<String, Object>> accessiblePages = new ArrayList<>();
        Set<Long> accessiblePageIds = new HashSet<>();

        // First pass: collect pages with actions
        for (UIPage page : allPages) {
            List<PageAction> actions = pageActionRepository.findByPageIdAndIsActiveTrue(page.getId());
            // Only include actions the user can perform (has capability)
            List<Map<String, Object>> userActions = actions.stream()
                .filter(action -> action.getCapability() != null && capabilities.contains(action.getCapability().getName()))
                .map(action -> {
                    Map<String, Object> actionData = new HashMap<>();
                    actionData.put("name", action.getAction());
                    actionData.put("label", action.getLabel());
                    actionData.put("capability", action.getCapability().getName());
                    actionData.put("icon", action.getIcon());
                    actionData.put("variant", action.getVariant());
                    return actionData;
                })
                .collect(Collectors.toList());

            if (!userActions.isEmpty()) {
                Map<String, Object> pageData = new HashMap<>();
                pageData.put("id", page.getId());
                pageData.put("name", page.getLabel());
                pageData.put("path", page.getRoute());
                pageData.put("parentId", page.getParentId());
                pageData.put("icon", page.getIcon());
                pageData.put("displayOrder", page.getDisplayOrder());
                pageData.put("isMenuItem", page.getIsMenuItem());
                pageData.put("actions", userActions);

                accessiblePages.add(pageData);
                accessiblePageIds.add(page.getId());
            }
        }

        // Second pass: add parent pages that don't have actions but have accessible children
        Set<Long> parentIdsToAdd = new HashSet<>();
        for (Map<String, Object> pageData : accessiblePages) {
            Long parentId = (Long) pageData.get("parentId");
            if (parentId != null && !accessiblePageIds.contains(parentId)) {
                parentIdsToAdd.add(parentId);
            }
        }

        // Add parent pages
        for (Long parentId : parentIdsToAdd) {
            UIPage parentPage = allPages.stream()
                    .filter(p -> p.getId().equals(parentId))
                    .findFirst()
                    .orElse(null);
            
            if (parentPage != null) {
                Map<String, Object> parentData = new HashMap<>();
                parentData.put("id", parentPage.getId());
                parentData.put("name", parentPage.getLabel());
                parentData.put("path", parentPage.getRoute());
                parentData.put("parentId", parentPage.getParentId());
                parentData.put("icon", parentPage.getIcon());
                parentData.put("displayOrder", parentPage.getDisplayOrder());
                parentData.put("isMenuItem", parentPage.getIsMenuItem());
                parentData.put("actions", new ArrayList<>()); // No direct actions

                accessiblePages.add(parentData);
                accessiblePageIds.add(parentPage.getId());
            }
        }

        // Sort pages: parents first (by displayOrder), then children (by displayOrder)
        accessiblePages.sort((a, b) -> {
            Long parentIdA = (Long) a.get("parentId");
            Long parentIdB = (Long) b.get("parentId");
            Integer displayOrderA = (Integer) a.getOrDefault("displayOrder", 0);
            Integer displayOrderB = (Integer) b.getOrDefault("displayOrder", 0);
            
            // Both are root pages - sort by displayOrder
            if (parentIdA == null && parentIdB == null) {
                return Integer.compare(displayOrderA, displayOrderB);
            }
            
            // A is root, B is child - A comes first
            if (parentIdA == null && parentIdB != null) {
                return -1;
            }
            
            // A is child, B is root - B comes first
            if (parentIdA != null && parentIdB == null) {
                return 1;
            }
            
            // Both are children (neither is null at this point)
            // Check if same parent
            if (parentIdA != null && parentIdA.equals(parentIdB)) {
                return Integer.compare(displayOrderA, displayOrderB);
            }
            
            // Different parents - group by parent's display order
            Integer parentOrderA = accessiblePages.stream()
                    .filter(p -> p.get("id").equals(parentIdA))
                    .map(p -> (Integer) p.getOrDefault("displayOrder", 0))
                    .findFirst()
                    .orElse(0);
            Integer parentOrderB = accessiblePages.stream()
                    .filter(p -> p.get("id").equals(parentIdB))
                    .map(p -> (Integer) p.getOrDefault("displayOrder", 0))
                    .findFirst()
                    .orElse(0);
            
            return Integer.compare(parentOrderA, parentOrderB);
        });

        logger.debug("User has access to {} pages (including parent pages)", accessiblePages.size());
        return accessiblePages;
    }

    /**
     * Check if user has a specific capability through their roles
     */
    private boolean hasCapability(String capabilityName, Set<String> roleNames) {
        List<String> capabilitiesForRoles = new ArrayList<>();
        for (String roleName : roleNames) {
            capabilitiesForRoles.addAll(capabilityRepository.findCapabilityNamesByRoleName(roleName));
        }
        return capabilitiesForRoles.contains(capabilityName);
    }

    /**
     * Get accessible endpoints for user's roles
     */
    private List<Map<String, Object>> getAccessibleEndpoints(Set<String> roleNames) {
        List<Endpoint> allEndpoints = endpointRepository.findByIsActiveTrue();
        List<Map<String, Object>> accessibleEndpoints = new ArrayList<>();

        for (Endpoint endpoint : allEndpoints) {
            // Check if user has access to this endpoint
            if (hasEndpointAccess(endpoint.getId(), roleNames)) {
                Map<String, Object> endpointData = new HashMap<>();
                endpointData.put("id", endpoint.getId());
                endpointData.put("service", endpoint.getService());
                endpointData.put("version", endpoint.getVersion());
                endpointData.put("method", endpoint.getMethod());
                endpointData.put("path", endpoint.getPath());
                endpointData.put("description", endpoint.getDescription());

                accessibleEndpoints.add(endpointData);
            }
        }

        logger.debug("User has access to {} endpoints", accessibleEndpoints.size());
        return accessibleEndpoints;
    }

    /**
     * Check if user has access to an endpoint through unified authorization flow:
     * 
     * User → UserRoleAssignment → Role → Policy → Endpoint (via endpoint_policies)
     *                                          ↓
     *                                     Capability (via policy_capabilities)
     * 
     * This method checks BOTH paths:
     * 1. Direct endpoint access via endpoint_policies (Role → Policy → Endpoint)
     * 2. Capability-based access (Role → Policy → Capability, where Capability should have corresponding Endpoint)
     * 
     * The data synchronization script ensures that policies granting capabilities 
     * also grant access to the endpoints needed for those capabilities.
     * 
     * @param endpointId The endpoint to check access for
     * @param roleNames The roles the user has
     * @return true if user has access via any path, false otherwise
     */
    private boolean hasEndpointAccess(Long endpointId, Set<String> roleNames) {
        // PATH 1: Check direct endpoint access via endpoint_policies
        // User → Role → Policy (with role in expression) → EndpointPolicy → Endpoint
        List<Policy> endpointPolicies = policyRepository.findByEndpointId(endpointId);
        
        for (Policy policy : endpointPolicies) {
            if (!policy.getIsActive()) {
                continue;
            }
            
            // Check if user's role matches the policy expression
            if (policyMatchesUserRoles(policy, roleNames)) {
                logger.debug("Endpoint access GRANTED via direct policy '{}' for endpoint {}", 
                           policy.getName(), endpointId);
                return true;
            }
        }
        
        // PATH 2: Check capability-based access via PageActions
        // User → Role → Policy → Capability → PageAction → Endpoint
        // If user has a capability that requires this endpoint, grant access
        List<PageAction> pageActionsUsingEndpoint = pageActionRepository.findByEndpointId(endpointId);
        
        for (PageAction pageAction : pageActionsUsingEndpoint) {
            if (!pageAction.getIsActive()) {
                continue;
            }
            
            Capability capability = pageAction.getCapability();
            if (capability != null && capability.getIsActive()) {
                // Check if user has this capability through their roles
                if (hasCapability(capability.getName(), roleNames)) {
                    logger.debug("Endpoint access GRANTED via capability '{}' for endpoint {}", 
                               capability.getName(), endpointId);
                    return true;
                }
            }
        }
        
        logger.debug("Endpoint access DENIED for endpoint {} with roles: {}", endpointId, roleNames);
        return false;
    }
    
    /**
     * Check if a policy expression matches any of the user's roles
     * 
     * @param policy The policy to evaluate
     * @param roleNames The user's role names
     * @return true if policy grants access to user, false otherwise
     */
    private boolean policyMatchesUserRoles(Policy policy, Set<String> roleNames) {
        // Parse the policy expression JSON to check if user has required roles
        // Expression format: {"roles": ["ADMIN", "WORKER"], "conditions": []}
        try {
            String expression = policy.getExpression();
            if (expression == null || !expression.contains("\"roles\"")) {
                logger.debug("Policy '{}' has no roles defined in expression", policy.getName());
                return false;
            }
            
            // Simple JSON parsing - check if any of the user's roles match the policy roles
            for (String roleName : roleNames) {
                if (expression.contains("\"" + roleName + "\"")) {
                    logger.debug("User role '{}' matches policy '{}'", roleName, policy.getName());
                    return true;
                }
            }
            
            logger.debug("No user roles match policy '{}'", policy.getName());
            return false;
        } catch (Exception e) {
            logger.warn("Error parsing policy expression for policy '{}': {}", 
                       policy.getName(), e.getMessage());
            return false;
        }
    }

    /**
     * Build capability map for quick frontend checks
     * { "USER_CREATE": true, "USER_DELETE": true, ... }
     */
    private Map<String, Boolean> buildCapabilityMap(Set<String> capabilities) {
        Map<String, Boolean> capabilityMap = new HashMap<>();
        for (String capability : capabilities) {
            capabilityMap.put(capability, true);
        }
        return capabilityMap;
    }
}
