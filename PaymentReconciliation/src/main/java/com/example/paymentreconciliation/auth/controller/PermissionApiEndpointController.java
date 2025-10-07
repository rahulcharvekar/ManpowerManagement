package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.entity.PermissionApiEndpoint;
import com.example.paymentreconciliation.auth.service.PermissionApiEndpointService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/permission-endpoints")
@Tag(name = "Permission API Endpoint Management", description = "CRUD operations for permission-API mappings")
@SecurityRequirement(name = "Bearer Authentication")
public class PermissionApiEndpointController {

    private static final Logger logger = LoggerFactory.getLogger(PermissionApiEndpointController.class);

    @Autowired
    private PermissionApiEndpointService permissionApiEndpointService;

    @GetMapping
    @Operation(summary = "Get all permission-API endpoint mappings")
    public ResponseEntity<List<PermissionApiEndpoint>> getAllEndpoints() {
        logger.info("Getting all permission-API endpoint mappings");
        List<PermissionApiEndpoint> endpoints = permissionApiEndpointService.getAllEndpoints();
        return ResponseEntity.ok(endpoints);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get permission-API endpoint mapping by ID")
    public ResponseEntity<PermissionApiEndpoint> getEndpointById(@PathVariable Long id) {
        logger.info("Getting permission-API endpoint mapping by ID: {}", id);
        Optional<PermissionApiEndpoint> endpoint = permissionApiEndpointService.getEndpointById(id);
        return endpoint.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-permission/{permissionName}")
    @Operation(summary = "Get API endpoints by permission name")
    public ResponseEntity<List<PermissionApiEndpoint>> getEndpointsByPermissionName(@PathVariable String permissionName) {
        logger.info("Getting API endpoints for permission: {}", permissionName);
        List<PermissionApiEndpoint> endpoints = permissionApiEndpointService.getEndpointsByPermissionName(permissionName);
        return ResponseEntity.ok(endpoints);
    }

    @GetMapping("/statistics")
    @Operation(summary = "Get endpoint statistics")
    public ResponseEntity<Map<String, Object>> getEndpointStatistics() {
        logger.info("Getting permission-API endpoint statistics");
        Map<String, Object> stats = permissionApiEndpointService.getEndpointStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    @Operation(summary = "Create new permission-API endpoint mapping")
    public ResponseEntity<?> createEndpoint(@Valid @RequestBody CreateEndpointRequest request) {
        logger.info("Creating new permission-API endpoint mapping: {} -> {} {}", 
                   request.getPermissionName(), request.getHttpMethod(), request.getApiEndpoint());
        
        try {
            PermissionApiEndpoint endpoint = permissionApiEndpointService.createEndpoint(
                request.getPermissionName(),
                request.getApiEndpoint(),
                request.getHttpMethod(),
                request.getDescription()
            );
            return ResponseEntity.ok(endpoint);
        } catch (Exception e) {
            logger.error("Failed to create permission-API endpoint mapping", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to create endpoint mapping: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update permission-API endpoint mapping")
    public ResponseEntity<?> updateEndpoint(@PathVariable Long id, 
                                          @Valid @RequestBody UpdateEndpointRequest request) {
        logger.info("Updating permission-API endpoint mapping with ID: {}", id);
        
        try {
            PermissionApiEndpoint endpoint = permissionApiEndpointService.updateEndpoint(
                id,
                request.getPermissionName(),
                request.getApiEndpoint(),
                request.getHttpMethod(),
                request.getDescription(),
                request.getIsActive()
            );
            return ResponseEntity.ok(endpoint);
        } catch (Exception e) {
            logger.error("Failed to update permission-API endpoint mapping", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to update endpoint mapping: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete permission-API endpoint mapping")
    public ResponseEntity<?> deleteEndpoint(@PathVariable Long id) {
        logger.info("Deleting permission-API endpoint mapping with ID: {}", id);
        
        try {
            permissionApiEndpointService.deleteEndpoint(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Failed to delete permission-API endpoint mapping", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to delete endpoint mapping: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate permission-API endpoint mapping")
    public ResponseEntity<?> deactivateEndpoint(@PathVariable Long id) {
        logger.info("Deactivating permission-API endpoint mapping with ID: {}", id);
        
        try {
            permissionApiEndpointService.deactivateEndpoint(id);
            return ResponseEntity.ok(Map.of("message", "Endpoint mapping deactivated successfully"));
        } catch (Exception e) {
            logger.error("Failed to deactivate permission-API endpoint mapping", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to deactivate endpoint mapping: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate permission-API endpoint mapping")
    public ResponseEntity<?> activateEndpoint(@PathVariable Long id) {
        logger.info("Activating permission-API endpoint mapping with ID: {}", id);
        
        try {
            permissionApiEndpointService.activateEndpoint(id);
            return ResponseEntity.ok(Map.of("message", "Endpoint mapping activated successfully"));
        } catch (Exception e) {
            logger.error("Failed to activate permission-API endpoint mapping", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to activate endpoint mapping: " + e.getMessage()));
        }
    }

    // DTOs
    public static class CreateEndpointRequest {
        private String permissionName;
        private String apiEndpoint;
        private String httpMethod = "GET";
        private String description;

        // Getters and setters
        public String getPermissionName() { return permissionName; }
        public void setPermissionName(String permissionName) { this.permissionName = permissionName; }
        
        public String getApiEndpoint() { return apiEndpoint; }
        public void setApiEndpoint(String apiEndpoint) { this.apiEndpoint = apiEndpoint; }
        
        public String getHttpMethod() { return httpMethod; }
        public void setHttpMethod(String httpMethod) { this.httpMethod = httpMethod; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class UpdateEndpointRequest extends CreateEndpointRequest {
        private Boolean isActive = true;
        
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    }
}
