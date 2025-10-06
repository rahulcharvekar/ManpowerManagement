package com.example.paymentreconciliation.auth.dto;

import java.util.List;

public class ComponentNavigation {
    private String id;
    private String name;
    private String path;
    private String icon;
    private String category;
    private Integer displayOrder;
    private List<ComponentNavigation> children;
    
    // Constructors
    public ComponentNavigation() {}
    
    public ComponentNavigation(String id, String name, String path, String icon, 
                             String category, Integer displayOrder, List<ComponentNavigation> children) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.icon = icon;
        this.category = category;
        this.displayOrder = displayOrder;
        this.children = children;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    
    public List<ComponentNavigation> getChildren() { return children; }
    public void setChildren(List<ComponentNavigation> children) { this.children = children; }
}
