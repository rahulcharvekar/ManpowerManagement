package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.entity.Permission;
import com.example.paymentreconciliation.auth.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/permissions")
@Tag(name = "Permission Management", description = "APIs for managing permissions")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionController {
    
    @Autowired
    private PermissionService permissionService;
    
    @GetMapping
    @Operation(summary = "Get all permissions")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        List<Permission> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(permissions);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get permission by ID")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long id) {
        return permissionService.getPermissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/by-module/{module}")
    @Operation(summary = "Get permissions by module")
    public ResponseEntity<List<Permission>> getPermissionsByModule(@PathVariable String module) {
        List<Permission> permissions = permissionService.getPermissionsByModule(module);
        return ResponseEntity.ok(permissions);
    }
    
    @GetMapping("/modules")
    @Operation(summary = "Get all permission modules")
    public ResponseEntity<List<String>> getAllModules() {
        List<String> modules = permissionService.getAllModules();
        return ResponseEntity.ok(modules);
    }
    
    @PostMapping
    @Operation(summary = "Create new permission")
    public ResponseEntity<Permission> createPermission(@RequestBody CreatePermissionRequest request) {
        try {
            Permission permission = permissionService.createPermission(
                    request.getName(), request.getDescription(), request.getModule());
            return ResponseEntity.ok(permission);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update permission")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long id, 
                                                       @RequestBody UpdatePermissionRequest request) {
        try {
            Permission permission = permissionService.updatePermission(
                    id, request.getName(), request.getDescription(), request.getModule());
            return ResponseEntity.ok(permission);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete permission")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        try {
            permissionService.deletePermission(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Request DTOs
    public static class CreatePermissionRequest {
        private String name;
        private String description;
        private String module;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getModule() { return module; }
        public void setModule(String module) { this.module = module; }
    }
    
    public static class UpdatePermissionRequest {
        private String name;
        private String description;
        private String module;
        
        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getModule() { return module; }
        public void setModule(String module) { this.module = module; }
    }
}
