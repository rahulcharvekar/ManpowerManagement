package com.example.paymentreconciliation.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a service catalog endpoint (API endpoint).
 * Defines WHERE authorization is enforced and maps to policies.
 */
@Entity
@Table(name = "endpoints")
public class Endpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String key; // Unique identifier like "user.list"

    @Column(nullable = false, length = 10)
    private String method; // GET, POST, PUT, DELETE

    @Column(nullable = false, length = 255)
    private String path; // /api/users

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(name = "required_capability", length = 100)
    private String requiredCapability; // The capability name required for this endpoint

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false; // Public endpoints don't require authentication

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Many-to-Many relationship with Policy through EndpointPolicy
    @OneToMany(mappedBy = "endpoint", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<EndpointPolicy> endpointPolicies = new HashSet<>();

    public Endpoint() {
    }

    public Endpoint(String key, String method, String path, String description, String module, String requiredCapability) {
        this.key = key;
        this.method = method;
        this.path = path;
        this.description = description;
        this.module = module;
        this.requiredCapability = requiredCapability;
        this.isPublic = false;
        this.isActive = true;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getRequiredCapability() {
        return requiredCapability;
    }

    public void setRequiredCapability(String requiredCapability) {
        this.requiredCapability = requiredCapability;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
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

    public Set<EndpointPolicy> getEndpointPolicies() {
        return endpointPolicies;
    }

    public void setEndpointPolicies(Set<EndpointPolicy> endpointPolicies) {
        this.endpointPolicies = endpointPolicies;
    }

    @Override
    public String toString() {
        return "Endpoint{" +
                "id=" + id +
                ", key='" + key + '\'' +
                ", method='" + method + '\'' +
                ", path='" + path + '\'' +
                ", module='" + module + '\'' +
                ", isPublic=" + isPublic +
                '}';
    }
}
