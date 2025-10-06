package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.entity.Permission;
import com.example.paymentreconciliation.auth.entity.Role;
import com.example.paymentreconciliation.auth.entity.User;
import com.example.paymentreconciliation.auth.repository.PermissionRepository;
import com.example.paymentreconciliation.auth.repository.RoleRepository;
import com.example.paymentreconciliation.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoleService {
    
    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Role> getAllRoles() {
        logger.debug("Fetching all roles");
        return roleRepository.findAll();
    }
    
    public List<Role> getAllRolesWithPermissions() {
        logger.debug("Fetching all roles with permissions");
        return roleRepository.findAllWithPermissions();
    }
    
    public Optional<Role> getRoleById(Long id) {
        logger.debug("Fetching role by id: {}", id);
        return roleRepository.findById(id);
    }
    
    public Optional<Role> getRoleByName(String name) {
        logger.debug("Fetching role by name: {}", name);
        return roleRepository.findByName(name);
    }
    
    public Optional<Role> getRoleByNameWithPermissions(String name) {
        logger.debug("Fetching role by name with permissions: {}", name);
        return roleRepository.findByNameWithPermissions(name);
    }
    
    public List<Role> getRolesByUsername(String username) {
        logger.debug("Fetching roles for user: {}", username);
        return roleRepository.findByUsername(username);
    }
    
    public Role createRole(String name, String description) {
        logger.info("Creating new role: {}", name);
        
        if (roleRepository.existsByName(name)) {
            throw new IllegalArgumentException("Role with name '" + name + "' already exists");
        }
        
        Role role = new Role(name, description);
        return roleRepository.save(role);
    }
    
    public Role updateRole(Long id, String name, String description) {
        logger.info("Updating role with id: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + id));
        
        // Check if name is changing and if new name already exists
        if (!role.getName().equals(name) && roleRepository.existsByName(name)) {
            throw new IllegalArgumentException("Role with name '" + name + "' already exists");
        }
        
        role.setName(name);
        role.setDescription(description);
        
        return roleRepository.save(role);
    }
    
    public void deleteRole(Long id) {
        logger.info("Deleting role with id: {}", id);
        
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + id));
        
        // Check if role is assigned to any users
        if (!role.getUsers().isEmpty()) {
            throw new IllegalStateException("Cannot delete role '" + role.getName() + 
                    "' as it is assigned to " + role.getUsers().size() + " user(s)");
        }
        
        roleRepository.delete(role);
    }
    
    public Role addPermissionToRole(Long roleId, Long permissionId) {
        logger.info("Adding permission {} to role {}", permissionId, roleId);
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + permissionId));
        
        role.addPermission(permission);
        return roleRepository.save(role);
    }
    
    public Role removePermissionFromRole(Long roleId, Long permissionId) {
        logger.info("Removing permission {} from role {}", permissionId, roleId);
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new IllegalArgumentException("Permission not found with id: " + permissionId));
        
        role.removePermission(permission);
        return roleRepository.save(role);
    }
    
    public User assignRoleToUser(Long userId, Long roleId) {
        logger.info("Assigning role {} to user {}", roleId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        
        user.addRole(role);
        return userRepository.save(user);
    }
    
    public User revokeRoleFromUser(Long userId, Long roleId) {
        logger.info("Revoking role {} from user {}", roleId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found with id: " + roleId));
        
        user.removeRole(role);
        return userRepository.save(user);
    }
    
    public boolean existsByName(String name) {
        return roleRepository.existsByName(name);
    }
}
