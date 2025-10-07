package com.example.paymentreconciliation.auth.repository;

import com.example.paymentreconciliation.auth.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    // Only keep methods needed for WRITE operations and entity lookups during writes
    
    @Query("SELECT p FROM Permission p WHERE p.name IN :names")
    List<Permission> findByNames(@Param("names") List<String> names);
    
    // Keep for write operation validations
    boolean existsByName(String name);
}
