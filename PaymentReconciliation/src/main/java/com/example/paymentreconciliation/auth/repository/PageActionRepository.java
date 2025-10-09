package com.example.paymentreconciliation.auth.repository;

import com.example.paymentreconciliation.auth.entity.PageAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PageAction entity.
 * Provides methods to query page actions (buttons/operations on pages).
 */
@Repository
public interface PageActionRepository extends JpaRepository<PageAction, Long> {

    /**
     * Find a page action by its unique key
     */
    Optional<PageAction> findByKey(String key);

    /**
     * Find all actions for a specific page
     */
    List<PageAction> findByPageIdAndIsActiveTrueOrderByDisplayOrder(Long pageId);

    /**
     * Find all actions for a specific page (by page key)
     */
    @Query("SELECT pa FROM PageAction pa " +
           "JOIN UIPage p ON pa.page.id = p.id " +
           "WHERE p.key = :pageKey " +
           "AND pa.isActive = true " +
           "ORDER BY pa.displayOrder")
    List<PageAction> findByPageKey(@Param("pageKey") String pageKey);

    /**
     * Find all active actions
     */
    List<PageAction> findByIsActiveTrue();

    /**
     * Find actions by required capability
     */
    List<PageAction> findByRequiredCapability(String requiredCapability);

    /**
     * Find actions by action type (CREATE, EDIT, DELETE, etc.)
     */
    List<PageAction> findByAction(String action);

    /**
     * Check if an action exists by key
     */
    boolean existsByKey(String key);

    /**
     * Find all actions accessible to a role
     * This checks if the required capability is granted by policies for that role
     */
    @Query("SELECT DISTINCT pa FROM PageAction pa " +
           "WHERE pa.requiredCapability IN (" +
           "  SELECT c.name FROM Capability c " +
           "  JOIN PolicyCapability pc ON pc.capability.id = c.id " +
           "  JOIN Policy p ON p.id = pc.policy.id " +
           "  WHERE p.expression LIKE CONCAT('%', :roleName, '%') " +
           "  AND p.isActive = true " +
           "  AND c.isActive = true" +
           ") " +
           "AND pa.isActive = true " +
           "ORDER BY pa.page.id, pa.displayOrder")
    List<PageAction> findAccessibleByRole(@Param("roleName") String roleName);

    /**
     * Find actions for pages in a specific module
     */
    @Query("SELECT pa FROM PageAction pa " +
           "JOIN UIPage p ON pa.page.id = p.id " +
           "WHERE p.module = :module " +
           "AND pa.isActive = true " +
           "ORDER BY pa.displayOrder")
    List<PageAction> findByModule(@Param("module") String module);

    /**
     * Count actions for a specific page
     */
    long countByPageIdAndIsActiveTrue(Long pageId);
    
    /**
     * Find actions by page ID and active status
     */
    List<PageAction> findByPageIdAndIsActiveTrue(Long pageId);
}
