package com.example.paymentreconciliation.auth.service;

import com.example.paymentreconciliation.auth.entity.Role;
import com.example.paymentreconciliation.auth.entity.User;
import com.example.paymentreconciliation.auth.entity.UserRole;
import com.example.paymentreconciliation.auth.repository.PermissionRepository;
import com.example.paymentreconciliation.auth.repository.RoleRepository;
import com.example.paymentreconciliation.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@Order(1)
public class RbacDataInitializationService implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(RbacDataInitializationService.class);
    
    @Autowired
    private PermissionRepository permissionRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Initializing RBAC data...");
        
        // The database migration handles most of the initialization
        // This service handles any additional logic or validation
        
        // Ensure admin user exists with proper roles
        ensureAdminUserExists();
        
        // Validate that all roles have proper permissions
        validateRolePermissions();
        
        logger.info("RBAC data initialization completed");
    }
    
    @SuppressWarnings("deprecation")
    private void ensureAdminUserExists() {
        String adminUsername = "admin";
        Optional<User> adminUser = userRepository.findByUsername(adminUsername);
        
        if (adminUser.isEmpty()) {
            logger.info("Creating default admin user");
            
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail("admin@paymentreconciliation.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFullName("System Administrator");
            // Set legacy role for backward compatibility
            admin.setRole(UserRole.ADMIN);
            admin.setEnabled(true);
            
            admin = userRepository.save(admin);
            
            // Assign ADMIN role
            Optional<Role> adminRole = roleRepository.findByName("ADMIN");
            if (adminRole.isPresent()) {
                admin.addRole(adminRole.get());
                userRepository.save(admin);
                logger.info("Assigned ADMIN role to default admin user");
            }
        } else {
            // Ensure existing admin has the new ADMIN role
            User admin = adminUser.get();
            Optional<Role> adminRole = roleRepository.findByName("ADMIN");
            
            if (adminRole.isPresent() && !admin.getRoles().contains(adminRole.get())) {
                admin.addRole(adminRole.get());
                userRepository.save(admin);
                logger.info("Updated existing admin user with ADMIN role");
            }
        }
    }
    
    private void validateRolePermissions() {
        List<String> requiredRoles = Arrays.asList("ADMIN", "RECONCILIATION_OFFICER", "WORKER", "EMPLOYER", "BOARD");
        
        for (String roleName : requiredRoles) {
            Optional<Role> role = roleRepository.findByNameWithPermissions(roleName);
            if (role.isPresent()) {
                logger.debug("Role '{}' has {} permissions", roleName, role.get().getPermissions().size());
            } else {
                logger.warn("Required role '{}' not found in database", roleName);
            }
        }
        
        // Log permission statistics
        long totalPermissions = permissionRepository.count();
        long totalRoles = roleRepository.count();
        logger.info("RBAC system initialized with {} permissions and {} roles", totalPermissions, totalRoles);
    }
}
