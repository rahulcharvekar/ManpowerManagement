package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.dto.ComponentUIConfig;
import com.example.paymentreconciliation.auth.entity.ActionType;
import com.example.paymentreconciliation.auth.service.ComponentPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/components")
@Tag(name = "Component Permissions", description = "Component-based permission management APIs")
public class ComponentPermissionController {
    
    private static final Logger logger = LoggerFactory.getLogger(ComponentPermissionController.class);
    
    @Autowired
    private ComponentPermissionService componentPermissionService;
    
    @GetMapping("/ui-config")
    @Operation(summary = "Get component-based UI configuration", 
               description = "Get complete UI configuration including navigation and permissions for current user based on components")
    @ApiResponse(responseCode = "200", description = "UI configuration retrieved successfully")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> getComponentUIConfig() {
        try {
            ComponentUIConfig uiConfig = componentPermissionService.getUserComponentConfig();
            if (uiConfig != null) {
                return ResponseEntity.ok(uiConfig);
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "User not authenticated"));
            }
        } catch (Exception e) {
            logger.error("Failed to get component UI configuration", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to retrieve component UI configuration"));
        }
    }
    
    @GetMapping("/check-permission")
    @Operation(summary = "Check component permission", 
               description = "Check if current user can perform specific action on component")
    @ApiResponse(responseCode = "200", description = "Permission check completed")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> checkComponentPermission(
            @Parameter(description = "Component key") @RequestParam String componentKey,
            @Parameter(description = "Action type") @RequestParam ActionType action) {
        try {
            boolean hasPermission = componentPermissionService.canPerformAction(componentKey, action);
            return ResponseEntity.ok(Map.of(
                "componentKey", componentKey,
                "action", action.name(),
                "hasPermission", hasPermission
            ));
        } catch (Exception e) {
            logger.error("Failed to check component permission", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to check permission"));
        }
    }
    
    @GetMapping("/check-access")
    @Operation(summary = "Check component access", 
               description = "Check if current user can access component (VIEW permission)")
    @ApiResponse(responseCode = "200", description = "Access check completed")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<?> checkComponentAccess(
            @Parameter(description = "Component key") @RequestParam String componentKey) {
        try {
            boolean hasAccess = componentPermissionService.canAccessComponent(componentKey);
            return ResponseEntity.ok(Map.of(
                "componentKey", componentKey,
                "hasAccess", hasAccess
            ));
        } catch (Exception e) {
            logger.error("Failed to check component access", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to check access"));
        }
    }
    
    @GetMapping("/actions")
    @Operation(summary = "Get available actions", description = "Get list of available action types")
    public ResponseEntity<ActionType[]> getAvailableActions() {
        return ResponseEntity.ok(ActionType.values());
    }
}
