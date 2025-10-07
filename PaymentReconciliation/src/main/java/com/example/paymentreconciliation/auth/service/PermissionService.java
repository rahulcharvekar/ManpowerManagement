package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.entity.Permission;
import com.example.paymentreconciliation.auth.repository.PermissionRepository;
import com.example.paymentreconciliation.auth.dao.PermissionQueryDao;
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
    
    @Autowired
    private PermissionQueryDao permissionQueryDao;
    
    // READ OPERATIONS - Using Query DAO
    @Transactional(readOnly = true)
    public List<Permission> getAllPermissions() {
        logger.debug("Fetching all permissions using query DAO");
        return permissionQueryDao.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Permission> getPermissionById(Long id) {
        logger.debug("Fetching permission by id: {} using query DAO", id);
        return permissionQueryDao.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Permission> getPermissionByName(String name) {
        logger.debug("Fetching permission by name: {} using query DAO", name);
        return permissionQueryDao.findByName(name);
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByModule(String module) {
        logger.debug("Fetching permissions by module: {} using query DAO", module);
        return permissionQueryDao.findByModule(module);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllModules() {
        logger.debug("Fetching all permission modules using query DAO");
        return permissionQueryDao.findAllModules();
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
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByRoleName(String roleName) {
        logger.debug("Fetching permissions for role: {} using query DAO", roleName);
        return permissionQueryDao.findByRoleName(roleName);
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByUserId(Long userId) {
        logger.debug("Fetching permissions for user id: {} using query DAO", userId);
        return permissionQueryDao.findByUserId(userId);
    }
    
    @Transactional(readOnly = true)
    public List<Permission> getPermissionsByUsername(String username) {
        logger.debug("Fetching permissions for username: {} using query DAO", username);
        return permissionQueryDao.findByUsername(username);
    }
    
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return permissionQueryDao.existsByName(name);
    }
}
