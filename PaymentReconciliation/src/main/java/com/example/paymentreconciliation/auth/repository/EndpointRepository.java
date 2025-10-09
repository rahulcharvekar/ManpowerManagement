package com.example.paymentreconciliation.auth.repository;

import com.example.paymentreconciliation.auth.entity.Endpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Endpoint entity.
 * Provides methods to query service catalog endpoints.
 */
@Repository
public interface EndpointRepository extends JpaRepository<Endpoint, Long> {

    /**
     * Find an endpoint by its unique key
     */
    Optional<Endpoint> findByKey(String key);

    /**
     * Find an endpoint by HTTP method and path
     */
    Optional<Endpoint> findByMethodAndPath(String method, String path);

    /**
     * Find all endpoints for a given module
     */
    List<Endpoint> findByModule(String module);

    /**
     * Find all active endpoints
     */
    List<Endpoint> findByIsActiveTrue();

    /**
     * Find all public endpoints (no authentication required)
     */
    List<Endpoint> findByIsPublicTrue();

    /**
     * Find all active endpoints for a module
     */
    List<Endpoint> findByModuleAndIsActiveTrue(String module);

    /**
     * Find endpoints by required capability
     */
    List<Endpoint> findByRequiredCapability(String requiredCapability);

    /**
     * Check if an endpoint exists by key
     */
    boolean existsByKey(String key);

    /**
     * Check if an endpoint exists by method and path
     */
    boolean existsByMethodAndPath(String method, String path);

    /**
     * Find all endpoints protected by a specific policy
     */
    @Query("SELECT DISTINCT e FROM Endpoint e " +
           "JOIN EndpointPolicy ep ON ep.endpoint.id = e.id " +
           "JOIN Policy p ON p.id = ep.policy.id " +
           "WHERE p.name = :policyName " +
           "AND e.isActive = true")
    List<Endpoint> findByPolicyName(@Param("policyName") String policyName);

    /**
     * Find all endpoints accessible to a role
     * This joins through policies that apply to the role
     */
    @Query("SELECT DISTINCT e FROM Endpoint e " +
           "JOIN EndpointPolicy ep ON ep.endpoint.id = e.id " +
           "JOIN Policy p ON p.id = ep.policy.id " +
           "WHERE p.expression LIKE CONCAT('%', :roleName, '%') " +
           "AND p.isActive = true " +
           "AND e.isActive = true")
    List<Endpoint> findAccessibleByRole(@Param("roleName") String roleName);

    /**
     * Find endpoints by HTTP method
     */
    List<Endpoint> findByMethod(String method);

    /**
     * Get all endpoint keys (for frontend catalog)
     */
    @Query("SELECT e.key FROM Endpoint e WHERE e.isActive = true")
    List<String> findAllActiveEndpointKeys();
    
    /**
     * Find all active endpoints ordered by module and key
     */
    List<Endpoint> findByIsActiveTrueOrderByModuleAscKeyAsc();
}
