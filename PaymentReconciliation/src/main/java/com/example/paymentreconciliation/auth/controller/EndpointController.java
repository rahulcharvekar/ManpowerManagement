package com.example.paymentreconciliation.auth.controller;

import com.example.paymentreconciliation.auth.entity.Endpoint;
import com.example.paymentreconciliation.auth.entity.EndpointPolicy;
import com.example.paymentreconciliation.auth.entity.Policy;
import com.example.paymentreconciliation.auth.repository.EndpointPolicyRepository;
import com.example.paymentreconciliation.auth.repository.EndpointRepository;
import com.example.paymentreconciliation.auth.repository.PolicyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Admin controller for managing endpoints and their policy assignments
 * Only accessible by ADMIN role
 */
@RestController
@RequestMapping("/api/admin/endpoints")
@PreAuthorize("hasRole('ADMIN')")
public class EndpointController {

    private final EndpointRepository endpointRepository;
    private final PolicyRepository policyRepository;
    private final EndpointPolicyRepository endpointPolicyRepository;

    public EndpointController(
            EndpointRepository endpointRepository,
            PolicyRepository policyRepository,
            EndpointPolicyRepository endpointPolicyRepository) {
        this.endpointRepository = endpointRepository;
        this.policyRepository = policyRepository;
        this.endpointPolicyRepository = endpointPolicyRepository;
    }

    /**
     * Get all endpoints with their policies
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllEndpoints() {
        List<Endpoint> endpoints = endpointRepository.findAll();
        List<Map<String, Object>> response = endpoints.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Get endpoint by ID with policies
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEndpointById(@PathVariable Long id) {
        return endpointRepository.findById(id)
                .map(endpoint -> ResponseEntity.ok(convertToResponse(endpoint)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new endpoint
     */
    @PostMapping
    @Transactional
    public ResponseEntity<Map<String, Object>> createEndpoint(@RequestBody EndpointRequest request) {
        Endpoint endpoint = new Endpoint(
                request.getService(),
                request.getVersion(),
                request.getMethod(),
                request.getPath(),
                request.getDescription()
        );
        endpoint.setIsActive(request.getIsActive());
        Endpoint saved = endpointRepository.save(endpoint);
        
        // Assign policies if provided
        if (request.getPolicyIds() != null && !request.getPolicyIds().isEmpty()) {
            assignPolicies(saved.getId(), request.getPolicyIds());
        }
        
        return ResponseEntity.ok(convertToResponse(endpointRepository.findById(saved.getId()).get()));
    }

    /**
     * Update endpoint
     */
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateEndpoint(
            @PathVariable Long id,
            @RequestBody EndpointRequest request) {
        
        return endpointRepository.findById(id)
                .map(endpoint -> {
                    endpoint.setService(request.getService());
                    endpoint.setVersion(request.getVersion());
                    endpoint.setMethod(request.getMethod());
                    endpoint.setPath(request.getPath());
                    endpoint.setDescription(request.getDescription());
                    endpoint.setIsActive(request.getIsActive());
                    endpointRepository.save(endpoint);
                    
                    // Update policies if provided
                    if (request.getPolicyIds() != null) {
                        // Remove existing policies
                        endpointPolicyRepository.deleteByEndpointId(id);
                        // Add new policies
                        if (!request.getPolicyIds().isEmpty()) {
                            assignPolicies(id, request.getPolicyIds());
                        }
                    }
                    
                    return ResponseEntity.ok(convertToResponse(endpointRepository.findById(id).get()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Delete endpoint
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteEndpoint(@PathVariable Long id) {
        if (endpointRepository.existsById(id)) {
            // Delete endpoint policies first
            endpointPolicyRepository.deleteByEndpointId(id);
            // Delete endpoint
            endpointRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Toggle endpoint active status
     */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<Map<String, Object>> toggleActive(@PathVariable Long id) {
        return endpointRepository.findById(id)
                .map(endpoint -> {
                    endpoint.setIsActive(!endpoint.getIsActive());
                    Endpoint updated = endpointRepository.save(endpoint);
                    return ResponseEntity.ok(convertToResponse(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get policies assigned to an endpoint
     */
    @GetMapping("/{id}/policies")
    public ResponseEntity<List<Policy>> getEndpointPolicies(@PathVariable Long id) {
        List<EndpointPolicy> endpointPolicies = endpointPolicyRepository.findByEndpointId(id);
        List<Policy> policies = endpointPolicies.stream()
                .map(EndpointPolicy::getPolicy)
                .collect(Collectors.toList());
        return ResponseEntity.ok(policies);
    }

    /**
     * Assign policies to endpoint
     */
    @PostMapping("/{id}/policies")
    @Transactional
    public ResponseEntity<Map<String, Object>> assignPoliciesToEndpoint(
            @PathVariable Long id,
            @RequestBody PolicyAssignmentRequest request) {
        
        if (!endpointRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        assignPolicies(id, request.getPolicyIds());
        
        return ResponseEntity.ok(convertToResponse(endpointRepository.findById(id).get()));
    }

    /**
     * Remove policy from endpoint
     */
    @DeleteMapping("/{id}/policies/{policyId}")
    @Transactional
    public ResponseEntity<Void> removePolicyFromEndpoint(
            @PathVariable Long id,
            @PathVariable Long policyId) {
        
        endpointPolicyRepository.deleteByEndpointIdAndPolicyId(id, policyId);
        return ResponseEntity.noContent().build();
    }

    // Helper methods
    
    private void assignPolicies(Long endpointId, Set<Long> policyIds) {
        Endpoint endpoint = endpointRepository.findById(endpointId)
                .orElseThrow(() -> new RuntimeException("Endpoint not found"));
        
        for (Long policyId : policyIds) {
            Policy policy = policyRepository.findById(policyId)
                    .orElseThrow(() -> new RuntimeException("Policy not found: " + policyId));
            
            // Check if already exists
            if (!endpointPolicyRepository.existsByEndpointIdAndPolicyId(endpointId, policyId)) {
                EndpointPolicy ep = new EndpointPolicy(endpoint, policy);
                endpointPolicyRepository.save(ep);
            }
        }
    }
    
    private Map<String, Object> convertToResponse(Endpoint endpoint) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", endpoint.getId());
        response.put("service", endpoint.getService());
        response.put("version", endpoint.getVersion());
        response.put("method", endpoint.getMethod());
        response.put("path", endpoint.getPath());
        response.put("description", endpoint.getDescription());
        response.put("isActive", endpoint.getIsActive());
        response.put("createdAt", endpoint.getCreatedAt());
        response.put("updatedAt", endpoint.getUpdatedAt());
        
        // Add policies
        Set<EndpointPolicy> endpointPolicies = endpoint.getEndpointPolicies();
        List<Map<String, Object>> policies = endpointPolicies.stream()
                .map(ep -> {
                    Map<String, Object> pol = new HashMap<>();
                    pol.put("id", ep.getPolicy().getId());
                    pol.put("name", ep.getPolicy().getName());
                    pol.put("description", ep.getPolicy().getDescription());
                    return pol;
                })
                .collect(Collectors.toList());
        response.put("policies", policies);
        
        return response;
    }

    // DTO classes
    
    public static class EndpointRequest {
        private String service;
        private String version;
        private String method;
        private String path;
        private String description;
        private Boolean isActive = true;
        private Set<Long> policyIds;

        // Getters and Setters
        public String getService() { return service; }
        public void setService(String service) { this.service = service; }
        
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        
        public String getPath() { return path; }
        public void setPath(String path) { this.path = path; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Boolean getIsActive() { return isActive; }
        public void setIsActive(Boolean isActive) { this.isActive = isActive; }
        
        public Set<Long> getPolicyIds() { return policyIds; }
        public void setPolicyIds(Set<Long> policyIds) { this.policyIds = policyIds; }
    }
    
    public static class PolicyAssignmentRequest {
        private Set<Long> policyIds;

        public Set<Long> getPolicyIds() { return policyIds; }
        public void setPolicyIds(Set<Long> policyIds) { this.policyIds = policyIds; }
    }
}
