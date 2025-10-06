package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.entity.Permission;
import com.example.paymentreconciliation.auth.repository.PermissionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PermissionService {
    
    private static final Logger logger = LoggerFactory.getLogger(PermissionService.class);
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    public List<Permission> getAllPermissions() {
        logger.debug("Fetching all permissions");
        return permissionRepository.findAll();
    }
    
    public Optional<Permission> getPermissionById(Long id) {
        logger.debug("Fetching permission by id: {}", id);
        return permissionRepository.findById(id);
    }
    
    public Optional<Permission> getPermissionByName(String name) {
        logger.debug("Fetching permission by name: {}", name);
        return permissionRepository.findByName(name);
    }
    
    public List<Permission> getPermissionsByModule(String module) {
        logger.debug("Fetching permissions by module: {}", module);
        return permissionRepository.findByModule(module);
    }
    
    public List<String> getAllModules() {
        logger.debug("Fetching all permission modules");
        return permissionRepository.findAllModules();
    }
    
    public Permission createPermission(String name, String description, String module) {
        logger.info("Creating new permission: {} in module: {}", name, module);
        
        if (permissionRepository.existsByName(name)) {
            throw new IllegalArgumentException("Permission with name '" + name + "' already exists");
        }
        
        Permission permission = new Permission(name, description, module);
        return permissionRepository.save(permission);
    }
    
    public Permission updatePermission(Long id, String name, String description, String module) {
        logger.info("Updating permission with id: {}", id);
        
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + id));
        
        // Check if name is changing and if new name already exists
        if (!permission.getName().equals(name) && permissionRepository.existsByName(name)) {
            throw new IllegalArgumentException("Permission with name '" + name + "' already exists");
        }
        
        permission.setName(name);
        permission.setDescription(description);
        permission.setModule(module);
        
        return permissionRepository.save(permission);
    }
    
    public void deletePermission(Long id) {
        logger.info("Deleting permission with id: {}", id);
        
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + id));
        
        // Check if permission is used by any roles
        if (!permission.getRoles().isEmpty()) {
            throw new IllegalStateException("Cannot delete permission '" + permission.getName() + 
                    "' as it is assigned to " + permission.getRoles().size() + " role(s)");
        }
        
        permissionRepository.delete(permission);
    }
    
    public List<Permission> getPermissionsByRoleName(String roleName) {
        logger.debug("Fetching permissions for role: {}", roleName);
        return permissionRepository.findByRoleName(roleName);
    }
    
    public boolean existsByName(String name) {
        return permissionRepository.existsByName(name);
    }
}
