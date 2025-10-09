package com.example.paymentreconciliation.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents an action available on a UI page.
 * Actions are buttons/operations that users can perform on a page.
 * Each action requires a specific capability.
 */
@Entity
@Table(name = "page_actions")
public class PageAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String key; // e.g., "user.list.create"

    @Column(nullable = false, length = 100)
    private String label; // Display name like "Create User"

    @Column(nullable = false, length = 50)
    private String action; // Action type: CREATE, EDIT, DELETE, APPROVE, etc.

    @Column(name = "required_capability", nullable = false, length = 100)
    private String requiredCapability; // Capability needed for this action

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private UIPage page;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PageAction() {
    }

    public PageAction(String key, String label, String action, String requiredCapability, UIPage page) {
        this.key = key;
        this.label = label;
        this.action = action;
        this.requiredCapability = requiredCapability;
        this.page = page;
        this.isActive = true;
        this.displayOrder = 0;
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

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getRequiredCapability() {
        return requiredCapability;
    }

    public void setRequiredCapability(String requiredCapability) {
        this.requiredCapability = requiredCapability;
    }

    public UIPage getPage() {
        return page;
    }

    public void setPage(UIPage page) {
        this.page = page;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
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

    @Override
    public String toString() {
        return "PageAction{" +
                "id=" + id +
                ", key='" + key + '\'' +
                ", label='" + label + '\'' +
                ", action='" + action + '\'' +
                ", requiredCapability='" + requiredCapability + '\'' +
                ", pageId=" + (page != null ? page.getId() : null) +
                '}';
    }
}
