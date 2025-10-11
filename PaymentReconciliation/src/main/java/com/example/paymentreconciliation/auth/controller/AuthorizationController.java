package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.service.AuthorizationService;
import com.example.paymentreconciliation.auth.service.ServiceCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for authorization and service catalog endpoints
 * Provides user authorizations and service metadata
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Authorization", description = "Authorization and Service Catalog APIs")
@SecurityRequirement(name = "Bearer Authentication")
public class AuthorizationController {

    private final AuthorizationService authorizationService;
    private final ServiceCatalogService serviceCatalogService;

    public AuthorizationController(
            AuthorizationService authorizationService,
            ServiceCatalogService serviceCatalogService) {
        this.authorizationService = authorizationService;
        this.serviceCatalogService = serviceCatalogService;
    }

    /**
     * Get comprehensive authorization data for the authenticated user
     * Returns: roles, permissions (can), pages, menus, endpoints
     * 
     * Frontend should call this after login and cache the response (using ETag)
     * Call again only when user permissions change or version number changes
     * 
     * @param authentication The authenticated user
     * @return Authorization data including roles, permissions (can), pages, and endpoints
     */
    @GetMapping("/me/authorizations")
    @Operation(
            summary = "Get user authorizations",
            description = "Returns comprehensive authorization data including roles, permissions (can), accessible pages, menu tree, and endpoints for the authenticated user",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getUserAuthorizations(Authentication authentication) {
        // Extract user ID from authentication
        // Assuming authentication principal contains user ID
        Long userId = extractUserIdFromAuthentication(authentication);
        
        Map<String, Object> authorizations = authorizationService.getUserAuthorizations(userId);
        
        // Add ETag header for client-side caching
        String etag = String.valueOf(authorizations.get("version"));
        
        return ResponseEntity.ok()
                .eTag(etag)
                .body(authorizations);
    }

    /**
     * Get service catalog metadata
     * Returns all available endpoints and pages (not user-specific)
     * Frontend can use this to discover available services
     * 
     * @return Service catalog with endpoints and pages
     */
    @GetMapping("/meta/service-catalog")
    @Operation(
            summary = "Get service catalog",
            description = "Returns metadata about all available endpoints and UI pages in the system",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getServiceCatalog() {
        Map<String, Object> catalog = serviceCatalogService.getServiceCatalog();
        
        String etag = String.valueOf(catalog.get("version"));
        
        return ResponseEntity.ok()
                .eTag(etag)
                .body(catalog);
    }

    /**
     * Get endpoints catalog grouped by module
     * 
     * @return Map of module -> endpoints
     */
    @GetMapping("/meta/endpoints")
    @Operation(
            summary = "Get endpoints catalog",
            description = "Returns all available API endpoints grouped by module",
            security = @SecurityRequirement(name = "bearerAuth")
    )
        public ResponseEntity<Map<String, Object>> getEndpointsCatalog(@RequestParam(value = "page_id", required = false) Long pageId) {
                Map<String, Object> response;
                if (pageId != null) {
                        response = Map.of(
                                "endpoints", authorizationService.getEndpointsForPage(pageId)
                        );
                } else {
                        response = Map.of(
                                "endpoints", serviceCatalogService.getEndpointsCatalog()
                        );
                }
                return ResponseEntity.ok(response);
        }

    /**
     * Get pages catalog in hierarchical structure
     * 
     * @return Hierarchical list of UI pages
     */
    @GetMapping("/meta/pages")
    @Operation(
            summary = "Get pages catalog",
            description = "Returns all available UI pages in hierarchical structure",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<Map<String, Object>> getPagesCatalog() {
        Map<String, Object> response = Map.of(
                "pages", serviceCatalogService.getPagesCatalog()
        );
        
        return ResponseEntity.ok(response);
    }

    /**
     * Extract user ID from authentication object
     * This assumes your authentication principal contains user details
     * Adjust based on your actual authentication implementation
     */
    private Long extractUserIdFromAuthentication(Authentication authentication) {
        // If using UserDetails with User entity
        if (authentication.getPrincipal() instanceof com.example.paymentreconciliation.auth.entity.User) {
            com.example.paymentreconciliation.auth.entity.User user = 
                (com.example.paymentreconciliation.auth.entity.User) authentication.getPrincipal();
            return user.getId();
        }
        
        // If using username string, you need to look up the user
        // TODO: Inject UserRepository and implement username lookup
        // For now, returning a placeholder
        throw new IllegalStateException("Unable to extract user ID from authentication. Principal type: " + 
                authentication.getPrincipal().getClass().getName());
    }
}
