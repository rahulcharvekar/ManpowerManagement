package com.example.paymentreconciliation.auth.repository;

import com.example.paymentreconciliation.auth.entity.PermissionApiEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PermissionApiEndpointRepository extends JpaRepository<PermissionApiEndpoint, Long> {
    
    /**
     * Find all active endpoints for a specific permission ID
     */
    List<PermissionApiEndpoint> findByPermissionIdAndIsActiveTrue(Long permissionId);
    
    /**
     * Find all active endpoints for multiple permission IDs
     */
    List<PermissionApiEndpoint> findByPermissionIdInAndIsActiveTrue(Set<Long> permissionIds);
    
    /**
     * Find endpoints by API endpoint and HTTP method
     */
    List<PermissionApiEndpoint> findByApiEndpointAndHttpMethodAndIsActiveTrue(String apiEndpoint, String httpMethod);
    
    /**
     * Get all distinct permission IDs that have active endpoints
     */
    @Query("SELECT DISTINCT pae.permissionId FROM PermissionApiEndpoint pae WHERE pae.isActive = true")
    List<Long> findAllActivePermissionIds();
    
    /**
     * Get active endpoints with permission names for specific permission names
     */
    @Query("""
        SELECT p.name, pae.apiEndpoint, pae.httpMethod 
        FROM PermissionApiEndpoint pae 
        JOIN Permission p ON pae.permissionId = p.id 
        WHERE p.name IN :permissionNames AND pae.isActive = true
        ORDER BY p.name, pae.apiEndpoint
        """)
    List<Object[]> findEndpointsByPermissionNames(@Param("permissionNames") Set<String> permissionNames);
    
    /**
     * Get active endpoints grouped by permission name
     */
    @Query("""
        SELECT pae 
        FROM PermissionApiEndpoint pae 
        JOIN FETCH pae.permission p 
        WHERE p.name IN :permissionNames AND pae.isActive = true
        ORDER BY p.name, pae.apiEndpoint
        """)
    List<PermissionApiEndpoint> findActiveEndpointsByPermissionNames(@Param("permissionNames") Set<String> permissionNames);
    
    /**
     * Check if a specific API endpoint exists for a permission
     */
    @Query("""
        SELECT COUNT(pae) > 0 
        FROM PermissionApiEndpoint pae 
        JOIN Permission p ON pae.permissionId = p.id 
        WHERE p.name = :permissionName 
        AND pae.apiEndpoint = :apiEndpoint 
        AND pae.httpMethod = :httpMethod 
        AND pae.isActive = true
        """)
    boolean existsByPermissionNameAndEndpointAndMethod(
        @Param("permissionName") String permissionName, 
        @Param("apiEndpoint") String apiEndpoint, 
        @Param("httpMethod") String httpMethod
    );
    
    /**
     * Find all active endpoints for a specific permission name
     */
    @Query("""
        SELECT pae 
        FROM PermissionApiEndpoint pae 
        JOIN Permission p ON pae.permissionId = p.id 
        WHERE p.name = :permissionName AND pae.isActive = true
        ORDER BY pae.apiEndpoint
        """)
    List<PermissionApiEndpoint> findActiveEndpointsByPermissionName(@Param("permissionName") String permissionName);
    
    /**
     * Get count of active endpoints per permission
     */
    @Query("""
        SELECT p.name, COUNT(pae) 
        FROM PermissionApiEndpoint pae 
        JOIN Permission p ON pae.permissionId = p.id 
        WHERE pae.isActive = true 
        GROUP BY p.name
        ORDER BY p.name
        """)
    List<Object[]> getEndpointCountByPermission();
}
