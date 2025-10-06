package com.example.paymentreconciliation.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "role_component_permissions")
public class RoleComponentPermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_permission_id", nullable = false)
    private ComponentPermission componentPermission;
    
    @Column
    private Boolean isActive = true;
    
    // Constructors
    public RoleComponentPermission() {}
    
    public RoleComponentPermission(Role role, ComponentPermission componentPermission) {
        this.role = role;
        this.componentPermission = componentPermission;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public ComponentPermission getComponentPermission() { return componentPermission; }
    public void setComponentPermission(ComponentPermission componentPermission) { 
        this.componentPermission = componentPermission; 
    }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    // Helper methods
    public String getPermissionKey() {
        return componentPermission.getPermissionKey();
    }
    
    public String getComponentKey() {
        return componentPermission.getComponent().getComponentKey();
    }
    
    public ActionType getAction() {
        return componentPermission.getAction();
    }
    
    @Override
    public String toString() {
        return role.getName() + " -> " + componentPermission.toString();
    }
}
