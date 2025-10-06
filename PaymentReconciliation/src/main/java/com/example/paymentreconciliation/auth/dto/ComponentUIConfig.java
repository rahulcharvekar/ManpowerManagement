package com.example.paymentreconciliation.auth.dto;

import java.util.List;
import java.util.Set;
import java.util.Map;

public class ComponentUIConfig {
    private Long userId;
    private String username;
    private String fullName;
    private Set<String> roles;
    private Map<String, Set<String>> componentPermissions; // componentKey -> actions
    private Map<String, Object> uiConfig;
    private List<ComponentNavigation> navigation;
    
    // Constructors
    public ComponentUIConfig() {}
    
    public ComponentUIConfig(Long userId, String username, String fullName, 
                           Set<String> roles, Map<String, Set<String>> componentPermissions,
                           Map<String, Object> uiConfig, List<ComponentNavigation> navigation) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.roles = roles;
        this.componentPermissions = componentPermissions;
        this.uiConfig = uiConfig;
        this.navigation = navigation;
    }
    
    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    
    public Map<String, Set<String>> getComponentPermissions() { return componentPermissions; }
    public void setComponentPermissions(Map<String, Set<String>> componentPermissions) { 
        this.componentPermissions = componentPermissions; 
    }
    
    public Map<String, Object> getUiConfig() { return uiConfig; }
    public void setUiConfig(Map<String, Object> uiConfig) { this.uiConfig = uiConfig; }
    
    public List<ComponentNavigation> getNavigation() { return navigation; }
    public void setNavigation(List<ComponentNavigation> navigation) { this.navigation = navigation; }
}
