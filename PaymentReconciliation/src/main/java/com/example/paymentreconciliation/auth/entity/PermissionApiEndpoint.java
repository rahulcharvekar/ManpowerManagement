package com.example.paymentreconciliation.auth.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "permission_api_endpoints")
public class PermissionApiEndpoint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "permission_id", nullable = false)
    private Long permissionId;
    
    @NotBlank(message = "API endpoint is required")
    @Size(max = 255, message = "API endpoint must not exceed 255 characters")
    @Column(name = "api_endpoint", nullable = false, length = 255)
    private String apiEndpoint;
    
    @NotBlank(message = "HTTP method is required")
    @Size(max = 10, message = "HTTP method must not exceed 10 characters")
    @Column(name = "http_method", nullable = false, length = 10)
    private String httpMethod = "GET";
    
    @Size(max = 255, message = "Description must not exceed 255 characters")
    @Column(name = "description", length = 255)
    private String description;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Foreign key relationship to Permission
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", insertable = false, updatable = false)
    private Permission permission;
    
    // Constructors
    public PermissionApiEndpoint() {
        this.createdAt = LocalDateTime.now();
    }
    
    public PermissionApiEndpoint(Long permissionId, String apiEndpoint, String httpMethod) {
        this();
        this.permissionId = permissionId;
        this.apiEndpoint = apiEndpoint;
        this.httpMethod = httpMethod;
    }
    
    public PermissionApiEndpoint(Long permissionId, String apiEndpoint, String httpMethod, String description) {
        this(permissionId, apiEndpoint, httpMethod);
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getPermissionId() {
        return permissionId;
    }
    
    public void setPermissionId(Long permissionId) {
        this.permissionId = permissionId;
    }
    
    public String getApiEndpoint() {
        return apiEndpoint;
    }
    
    public void setApiEndpoint(String apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }
    
    public String getHttpMethod() {
        return httpMethod;
    }
    
    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Permission getPermission() {
        return permission;
    }
    
    public void setPermission(Permission permission) {
        this.permission = permission;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public String toString() {
        return "PermissionApiEndpoint{" +
                "id=" + id +
                ", permissionId=" + permissionId +
                ", apiEndpoint='" + apiEndpoint + '\'' +
                ", httpMethod='" + httpMethod + '\'' +
                ", description='" + description + '\'' +
                ", isActive=" + isActive +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        PermissionApiEndpoint that = (PermissionApiEndpoint) o;
        
        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        if (permissionId != null ? !permissionId.equals(that.permissionId) : that.permissionId != null) return false;
        if (apiEndpoint != null ? !apiEndpoint.equals(that.apiEndpoint) : that.apiEndpoint != null) return false;
        return httpMethod != null ? httpMethod.equals(that.httpMethod) : that.httpMethod == null;
    }
    
    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (permissionId != null ? permissionId.hashCode() : 0);
        result = 31 * result + (apiEndpoint != null ? apiEndpoint.hashCode() : 0);
        result = 31 * result + (httpMethod != null ? httpMethod.hashCode() : 0);
        return result;
    }
}
