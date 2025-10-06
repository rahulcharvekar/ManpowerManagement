package com.example.paymentreconciliation.auth.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "ui_components")
public class UIComponent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String componentKey; // e.g., "user-management-form", "payment-processing-panel"
    
    @Column(nullable = false)
    private String displayName; // e.g., "User Management", "Payment Processing"
    
    @Column
    private String description; // e.g., "Manage system users and their roles"
    
    @Column
    private String category; // e.g., "Administration", "Reconciliation", "Worker"
    
    @Column
    private String route; // e.g., "/admin/users", "/reconciliation/payments"
    
    @Column
    private String icon; // e.g., "👥", "💰", "📋"
    
    @Column
    private Integer displayOrder; // For sorting in UI
    
    @Column
    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "component", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ComponentPermission> permissions = new HashSet<>();
    
    // Constructors
    public UIComponent() {}
    
    public UIComponent(String componentKey, String displayName, String category, String route, String icon) {
        this.componentKey = componentKey;
        this.displayName = displayName;
        this.category = category;
        this.route = route;
        this.icon = icon;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getComponentKey() { return componentKey; }
    public void setComponentKey(String componentKey) { this.componentKey = componentKey; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Set<ComponentPermission> getPermissions() { return permissions; }
    public void setPermissions(Set<ComponentPermission> permissions) { this.permissions = permissions; }
}
