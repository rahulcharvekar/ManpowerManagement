package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.dto.ComponentNavigation;
import com.example.paymentreconciliation.auth.dto.ComponentUIConfig;
import com.example.paymentreconciliation.auth.entity.*;
import com.example.paymentreconciliation.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ComponentPermissionService {
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Get UI configuration based on component permissions
     */
    public ComponentUIConfig getUserComponentConfig() {
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            return null;
        }
        
        User user = currentUser.get();
        
        // Get all component permissions for user's roles
        Map<String, Set<ActionType>> componentPermissions = getUserComponentPermissions(user);
        
        // Generate navigation from components
        List<ComponentNavigation> navigation = generateNavigationFromComponents(componentPermissions);
        
        // Generate UI configuration
        Map<String, Object> uiConfig = generateUIConfig(componentPermissions);
        
        // Convert ActionType sets to String sets
        Map<String, Set<String>> stringPermissions = componentPermissions.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                entry -> entry.getValue().stream()
                    .map(ActionType::name)
                    .collect(Collectors.toSet())
            ));
        
        return new ComponentUIConfig(
            user.getId(),
            user.getUsername(),
            user.getFullName(),
            extractUserRoles(user),
            stringPermissions,
            uiConfig,
            navigation
        );
    }
    
    /**
     * Check if user can perform action on component
     */
    public boolean canPerformAction(String componentKey, ActionType action) {
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty()) {
            return false;
        }
        
        Map<String, Set<ActionType>> permissions = getUserComponentPermissions(currentUser.get());
        Set<ActionType> componentActions = permissions.get(componentKey);
        
        return componentActions != null && componentActions.contains(action);
    }
    
    /**
     * Check if user can access component (has VIEW permission)
     */
    public boolean canAccessComponent(String componentKey) {
        return canPerformAction(componentKey, ActionType.VIEW);
    }
    
    /**
     * Get all component permissions for a user based on their roles
     */
    private Map<String, Set<ActionType>> getUserComponentPermissions(User user) {
        Map<String, Set<ActionType>> componentPermissions = new HashMap<>();
        
        // Get permissions from user's roles
        for (Role role : user.getRoles()) {
            if (role != null && role.getRoleComponentPermissions() != null) {
                for (RoleComponentPermission roleCompPerm : role.getRoleComponentPermissions()) {
                    if (roleCompPerm.getIsActive()) {
                        String componentKey = roleCompPerm.getComponentKey();
                        ActionType action = roleCompPerm.getAction();
                        
                        componentPermissions
                            .computeIfAbsent(componentKey, k -> new HashSet<>())
                            .add(action);
                    }
                }
            }
        }
        
        return componentPermissions;
    }
    
    /**
     * Generate navigation structure from component permissions
     */
    private List<ComponentNavigation> generateNavigationFromComponents(Map<String, Set<ActionType>> permissions) {
        List<ComponentNavigation> navigation = new ArrayList<>();
        
        // Group components by category and generate navigation
        Map<String, List<ComponentNavigation>> categorizedComponents = new HashMap<>();
        
        for (Map.Entry<String, Set<ActionType>> entry : permissions.entrySet()) {
            String componentKey = entry.getKey();
            Set<ActionType> actions = entry.getValue();
            
            // Only include components user can view
            if (actions.contains(ActionType.VIEW)) {
                ComponentNavigation navItem = createNavigationItem(componentKey, actions);
                if (navItem != null) {
                    categorizedComponents
                        .computeIfAbsent(navItem.getCategory(), k -> new ArrayList<>())
                        .add(navItem);
                }
            }
        }
        
        // Convert to structured navigation
        for (Map.Entry<String, List<ComponentNavigation>> categoryEntry : categorizedComponents.entrySet()) {
            String category = categoryEntry.getKey();
            List<ComponentNavigation> items = categoryEntry.getValue();
            
            // Sort items by display order
            items.sort(Comparator.comparing(ComponentNavigation::getDisplayOrder));
            
            // Create category header if needed
            if (items.size() > 1) {
                ComponentNavigation categoryNav = new ComponentNavigation(
                    category.toLowerCase() + "-section",
                    getCategoryDisplayName(category),
                    "",
                    getCategoryIcon(category),
                    category,
                    0,
                    items
                );
                navigation.add(categoryNav);
            } else {
                navigation.addAll(items);
            }
        }
        
        // Sort navigation by category order
        navigation.sort(Comparator.comparing(ComponentNavigation::getDisplayOrder));
        
        return navigation;
    }
    
    /**
     * Create navigation item from component
     */
    private ComponentNavigation createNavigationItem(String componentKey, Set<ActionType> actions) {
        // This would typically come from database, but for demo purposes:
        return switch (componentKey) {
            case "user-management" -> new ComponentNavigation(
                "user-management", "User Management", "/admin/users", "👥", "Administration", 10, null
            );
            case "payment-processing" -> new ComponentNavigation(
                "payment-processing", "Payment Processing", "/payments", "💳", "Reconciliation", 20, null
            );
            case "worker-payments" -> new ComponentNavigation(
                "worker-payments", "Worker Payments", "/worker/payments", "💵", "Worker", 30, null
            );
            case "worker-upload" -> new ComponentNavigation(
                "worker-upload", "Worker Upload", "/worker/upload", "📤", "Worker", 25, null
            );
            case "employer-receipts" -> new ComponentNavigation(
                "employer-receipts", "Employer Receipts", "/employer/receipts", "🧾", "Employer", 40, null
            );
            case "board-receipts" -> new ComponentNavigation(
                "board-receipts", "Board Receipts", "/board/receipts", "📄", "Board", 45, null
            );
            case "reconciliation-dashboard" -> new ComponentNavigation(
                "reconciliation-dashboard", "Reconciliation", "/reconciliation", "📊", "Reconciliation", 15, null
            );
            case "system-settings" -> new ComponentNavigation(
                "system-settings", "System Settings", "/admin/settings", "⚙️", "Administration", 50, null
            );
            case "system-logs" -> new ComponentNavigation(
                "system-logs", "System Logs", "/admin/logs", "📋", "Administration", 60, null
            );
            case "reports" -> new ComponentNavigation(
                "reports", "Reports", "/reports", "📈", "Reporting", 70, null
            );
            default -> null;
        };
    }
    
    /**
     * Generate UI configuration map
     */
    private Map<String, Object> generateUIConfig(Map<String, Set<ActionType>> permissions) {
        Map<String, Object> config = new HashMap<>();
        
        // Component-based feature flags
        Map<String, Map<String, Boolean>> componentFeatures = new HashMap<>();
        for (Map.Entry<String, Set<ActionType>> entry : permissions.entrySet()) {
            String componentKey = entry.getKey();
            Set<ActionType> actions = entry.getValue();
            
            Map<String, Boolean> actionMap = new HashMap<>();
            for (ActionType action : ActionType.values()) {
                actionMap.put("can" + capitalizeFirst(action.name().toLowerCase()), actions.contains(action));
            }
            componentFeatures.put(componentKey, actionMap);
        }
        config.put("components", componentFeatures);
        
        // UI behavior
        Map<String, Object> behavior = new HashMap<>();
        behavior.put("defaultRoute", getDefaultRoute(permissions));
        config.put("behavior", behavior);
        
        return config;
    }
    
    // Helper methods
    private Optional<User> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        
        String username = auth.getName();
        return userRepository.findByUsername(username);
    }
    
    private Set<String> extractUserRoles(User user) {
        return user.getRoles().stream()
            .map(Role::getName)
            .collect(Collectors.toSet());
    }
    
    private String getDefaultRoute(Map<String, Set<ActionType>> permissions) {
        if (permissions.containsKey("user-management")) return "/admin/users";
        if (permissions.containsKey("reconciliation-dashboard")) return "/reconciliation";
        if (permissions.containsKey("worker-payments")) return "/worker/payments";
        return "/dashboard";
    }
    
    private String getCategoryDisplayName(String category) {
        return switch (category) {
            case "Administration" -> "Administration";
            case "Reconciliation" -> "Reconciliation";
            case "Worker" -> "Worker Management";
            case "Employer" -> "Employer Management";
            default -> category;
        };
    }
    
    private String getCategoryIcon(String category) {
        return switch (category) {
            case "Administration" -> "⚙️";
            case "Reconciliation" -> "💰";
            case "Worker" -> "👷";
            case "Employer" -> "🏢";
            default -> "📋";
        };
    }
    
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
