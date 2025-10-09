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
 * Authorization Service - Builds comprehensive authorization response
 * Returns capabilities, policies, endpoints, and UI pages for authenticated users
 */
@Service
public class AuthorizationService {

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

        // Get accessible pages for user's roles
        List<Map<String, Object>> pages = getAccessiblePages(roleNames);

        // Build menu tree
        Map<String, Object> menuTree = buildMenuTree(pages);

        // Get accessible endpoints
        List<Map<String, Object>> endpoints = getAccessibleEndpoints(roleNames);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("username", user.getUsername());
        response.put("roles", roleNames);
        response.put("capabilities", capabilities);
        response.put("can", buildCapabilityMap(capabilities)); // { "USER_CREATE": true, ...}
        response.put("pages", pages);
        response.put("menuTree", menuTree);
        response.put("endpoints", endpoints);
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
    private List<Map<String, Object>> getAccessiblePages(Set<String> roleNames) {
        List<UIPage> allPages = uiPageRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        List<Map<String, Object>> accessiblePages = new ArrayList<>();

        for (UIPage page : allPages) {
            // Check if user has access to this page
            List<PageAction> actions = pageActionRepository.findByPageIdAndIsActiveTrue(page.getId());
            
            // Get actions user can perform on this page
            List<String> userActions = actions.stream()
                    .filter(action -> hasCapability(action.getRequiredCapability(), roleNames))
                    .map(PageAction::getRequiredCapability)
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
            }
        }

        logger.debug("User has access to {} pages", accessiblePages.size());
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
     * Build hierarchical menu tree from flat pages list
     */
    private Map<String, Object> buildMenuTree(List<Map<String, Object>> pages) {
        Map<String, Object> menuTree = new HashMap<>();
        List<Map<String, Object>> menuItems = pages.stream()
                .filter(page -> (Boolean) page.getOrDefault("isMenuItem", false))
                .collect(Collectors.toList());

        // Build tree structure
        List<Map<String, Object>> rootItems = new ArrayList<>();
        Map<Long, List<Map<String, Object>>> childrenMap = new HashMap<>();

        for (Map<String, Object> page : menuItems) {
            Long parentId = (Long) page.get("parentId");
            if (parentId == null) {
                rootItems.add(page);
            } else {
                childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(page);
            }
        }

        // Attach children to parents
        for (Map<String, Object> item : menuItems) {
            Long itemId = (Long) item.get("id");
            if (childrenMap.containsKey(itemId)) {
                item.put("children", childrenMap.get(itemId));
            }
        }

        menuTree.put("items", rootItems);
        return menuTree;
    }

    /**
     * Get accessible endpoints for user's roles
     */
    private List<Map<String, Object>> getAccessibleEndpoints(Set<String> roleNames) {
        List<Endpoint> allEndpoints = endpointRepository.findByIsActiveTrueOrderByModuleAscKeyAsc();
        List<Map<String, Object>> accessibleEndpoints = new ArrayList<>();

        for (Endpoint endpoint : allEndpoints) {
            // Check if user has access to this endpoint
            if (hasEndpointAccess(endpoint.getId(), roleNames)) {
                Map<String, Object> endpointData = new HashMap<>();
                endpointData.put("id", endpoint.getId());
                endpointData.put("key", endpoint.getKey());
                endpointData.put("method", endpoint.getMethod());
                endpointData.put("path", endpoint.getPath());
                endpointData.put("description", endpoint.getDescription());
                endpointData.put("module", endpoint.getModule());

                accessibleEndpoints.add(endpointData);
            }
        }

        logger.debug("User has access to {} endpoints", accessibleEndpoints.size());
        return accessibleEndpoints;
    }

    /**
     * Check if user has access to an endpoint
     */
    private boolean hasEndpointAccess(Long endpointId, Set<String> roleNames) {
        List<Policy> policies = policyRepository.findByEndpointId(endpointId);
        
        for (Policy policy : policies) {
            // Simple role check - can be enhanced with PolicyEngineService
            if (roleNames.contains(policy.getName().replace("_POLICY", ""))) {
                return true;
            }
        }
        
        return false;
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
