package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.entity.Role;
import com.example.paymentreconciliation.auth.entity.User;
import com.example.paymentreconciliation.auth.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@Tag(name = "Role Management", description = "APIs for managing roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {
    
    @Autowired
    private RoleService roleService;
    
    @GetMapping
    @Operation(summary = "Get all roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        List<Role> roles = roleService.getAllRoles();
        return ResponseEntity.ok(roles);
    }
    
    @GetMapping("/with-permissions")
    @Operation(summary = "Get all roles with permissions")
    public ResponseEntity<List<Role>> getAllRolesWithPermissions() {
        List<Role> roles = roleService.getAllRolesWithPermissions();
        return ResponseEntity.ok(roles);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        return roleService.getRoleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/by-name/{name}")
    @Operation(summary = "Get role by name with permissions")
    public ResponseEntity<Role> getRoleByName(@PathVariable String name) {
        return roleService.getRoleByNameWithPermissions(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @Operation(summary = "Create new role")
    public ResponseEntity<Role> createRole(@RequestBody CreateRoleRequest request) {
        try {
            Role role = roleService.createRole(request.getName(), request.getDescription());
            return ResponseEntity.ok(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update role")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, 
                                           @RequestBody UpdateRoleRequest request) {
        try {
            Role role = roleService.updateRole(id, request.getName(), request.getDescription());
            return ResponseEntity.ok(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        try {
            roleService.deleteRole(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/{roleId}/permissions/{permissionId}")
    @Operation(summary = "Add permission to role")
    public ResponseEntity<Role> addPermissionToRole(@PathVariable Long roleId, 
                                                     @PathVariable Long permissionId) {
        try {
            Role role = roleService.addPermissionToRole(roleId, permissionId);
            return ResponseEntity.ok(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{roleId}/permissions/{permissionId}")
    @Operation(summary = "Remove permission from role")
    public ResponseEntity<Role> removePermissionFromRole(@PathVariable Long roleId, 
                                                          @PathVariable Long permissionId) {
        try {
            Role role = roleService.removePermissionFromRole(roleId, permissionId);
            return ResponseEntity.ok(role);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/assign")
    @Operation(summary = "Assign role to user")
    public ResponseEntity<User> assignRoleToUser(@RequestBody AssignRoleRequest request) {
        try {
            User user = roleService.assignRoleToUser(request.getUserId(), request.getRoleId());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/revoke")
    @Operation(summary = "Revoke role from user")
    public ResponseEntity<User> revokeRoleFromUser(@RequestBody RevokeRoleRequest request) {
        try {
            User user = roleService.revokeRoleFromUser(request.getUserId(), request.getRoleId());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Request DTOs
    public static class CreateRoleRequest {
        private String name;
        private String description;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class UpdateRoleRequest {
        private String name;
        private String description;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class AssignRoleRequest {
        private Long userId;
        private Long roleId;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getRoleId() { return roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
    }
    
    public static class RevokeRoleRequest {
        private Long userId;
        private Long roleId;
        
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getRoleId() { return roleId; }
        public void setRoleId(Long roleId) { this.roleId = roleId; }
    }
}
