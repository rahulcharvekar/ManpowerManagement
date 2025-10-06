package com.example.paymentreconciliation.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "component_permissions")
public class ComponentPermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "component_id", nullable = false)
    private UIComponent component;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType action; // VIEW, CREATE, EDIT, DELETE, APPROVE, etc.
    
    @Column
    private String description; // Optional description for the permission
    
    @Column
    private Boolean isActive = true;
    
    // Constructors
    public ComponentPermission() {}
    
    public ComponentPermission(UIComponent component, ActionType action) {
        this.component = component;
        this.action = action;
    }
    
    public ComponentPermission(UIComponent component, ActionType action, String description) {
        this.component = component;
        this.action = action;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UIComponent getComponent() { return component; }
    public void setComponent(UIComponent component) { this.component = component; }
    
    public ActionType getAction() { return action; }
    public void setAction(ActionType action) { this.action = action; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    // Helper method to get permission key
    public String getPermissionKey() {
        return component.getComponentKey() + ":" + action.name().toLowerCase();
    }
    
    @Override
    public String toString() {
        return component.getComponentKey() + ":" + action;
    }
}
