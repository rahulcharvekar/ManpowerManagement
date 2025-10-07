package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.dto.AuthResponse;
import com.example.paymentreconciliation.auth.dto.LoginRequest;
import com.example.paymentreconciliation.auth.dto.PermissionResponse;
import com.example.paymentreconciliation.auth.dto.RegisterRequest;
import com.example.paymentreconciliation.auth.entity.User;
import com.example.paymentreconciliation.auth.entity.UserRole;
import com.example.paymentreconciliation.auth.service.AuthService;
import com.example.paymentreconciliation.auth.service.PermissionApiEndpointService;
import com.example.paymentreconciliation.auth.service.UIConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication and registration APIs")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private UIConfigService uiConfigService;
    
    @Autowired
    private PermissionApiEndpointService permissionApiEndpointService;
    
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Login successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials"),
        @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("Login attempt for user: {}", loginRequest.getUsername());
            AuthResponse response = authService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Invalid username or password"));
        }
    }
    
    @PostMapping("/register")
    @Operation(summary = "User registration", description = "Register a new user account")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Registration successful"),
        @ApiResponse(responseCode = "400", description = "Registration failed - username or email already exists")
    })
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            logger.info("Registration attempt for user: {}", registerRequest.getUsername());
            AuthResponse response = authService.register(registerRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Registration failed for user: {}", registerRequest.getUsername(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user information with roles and permissions")
    @ApiResponse(responseCode = "200", description = "User information retrieved successfully")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
    @SuppressWarnings("deprecation")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        Optional<User> currentUser = authService.getCurrentUser();
        if (currentUser.isPresent()) {
            User user = currentUser.get();
            
            // Extract roles and permissions from authentication
            java.util.Set<String> roles = new java.util.HashSet<>();
            java.util.Set<String> permissions = new java.util.HashSet<>();
            
            if (authentication != null) {
                for (org.springframework.security.core.GrantedAuthority authority : authentication.getAuthorities()) {
                    String auth = authority.getAuthority();
                    if (auth.startsWith("ROLE_")) {
                        roles.add(auth.substring(5)); // Remove "ROLE_" prefix
                    } else if (auth.startsWith("PERM_")) {
                        permissions.add(auth.substring(5)); // Remove "PERM_" prefix
                    }
                }
            }
            
            // If no new roles, include legacy role for backward compatibility
            if (roles.isEmpty() && user.getLegacyRole() != null) {
                roles.add(user.getLegacyRole().name());
            }
            
            // Get API endpoints for user's permissions
            Map<String, List<String>> apiPermissions = permissionApiEndpointService.getUserApiEndpoints();
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("roles", roles);
            response.put("permissions", apiPermissions);
            response.put("legacyRole", user.getLegacyRole() != null ? user.getLegacyRole().name() : null);
            response.put("enabled", user.isEnabled());
            
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest()
            .body(new HashMap<String, Object>() {{ put("error", "User not authenticated"); }});
    }
    
    @GetMapping("/ui-config")
    @Operation(summary = "Get UI configuration", description = "Get complete UI configuration including navigation and permissions for current user")
    @ApiResponse(responseCode = "200", description = "UI configuration retrieved successfully")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getUserUIConfig() {
        try {
            PermissionResponse uiConfig = uiConfigService.getUserUIConfig();
            if (uiConfig != null) {
                return ResponseEntity.ok(uiConfig);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not authenticated"));
            }
        } catch (Exception e) {
            logger.error("Failed to get UI configuration", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to retrieve UI configuration"));
        }
    }
    
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Get list of all users (Admin only)")
    @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/users/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get users by role", description = "Get users filtered by role (Admin only)")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<List<User>> getUsersByRole(
        @Parameter(description = "User role") @PathVariable UserRole role) {
        List<User> users = authService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user status", description = "Enable or disable user account (Admin only)")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> updateUserStatus(
        @Parameter(description = "User ID") @PathVariable Long userId,
        @Parameter(description = "Enable/disable user") @RequestParam boolean enabled) {
        try {
            authService.updateUserStatus(userId, enabled);
            return ResponseEntity.ok(Map.of(
                "message", "User status updated successfully",
                "userId", userId,
                "enabled", enabled
            ));
        } catch (Exception e) {
            logger.error("Failed to update user status", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/roles")
    @Operation(summary = "Get available roles", description = "Get list of available user roles")
    public ResponseEntity<UserRole[]> getAvailableRoles() {
        return ResponseEntity.ok(UserRole.values());
    }
}
