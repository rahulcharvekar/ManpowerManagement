package com.example.paymentreconciliation.employer.dao;

import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EmployerPaymentReceiptRepository extends JpaRepository<EmployerPaymentReceipt, Long> {
    
    Optional<EmployerPaymentReceipt> findByWorkerReceiptNumber(String workerReceiptNumber);
    
    List<EmployerPaymentReceipt> findByStatus(String status);
    
    Page<EmployerPaymentReceipt> findByStatus(String status, Pageable pageable);
    
    List<EmployerPaymentReceipt> findByValidatedBy(String validatedBy);
    
    Optional<EmployerPaymentReceipt> findByEmployerReceiptNumber(String employerReceiptNumber);
    
    // Find by status and date range
    @Query("SELECT e FROM EmployerPaymentReceipt e WHERE e.status = :status AND e.validatedAt BETWEEN :startDate AND :endDate")
    Page<EmployerPaymentReceipt> findByStatusAndValidatedAtBetween(
        @Param("status") String status, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable
    );
    
    // Find by date range only
    @Query("SELECT e FROM EmployerPaymentReceipt e WHERE e.validatedAt BETWEEN :startDate AND :endDate")
    Page<EmployerPaymentReceipt> findByValidatedAtBetween(
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable
    );
    
    // Find by employer receipt number with pagination
    Page<EmployerPaymentReceipt> findByEmployerReceiptNumber(String employerReceiptNumber, Pageable pageable);
    
    // Find by employer receipt number and status
    @Query("SELECT e FROM EmployerPaymentReceipt e WHERE e.employerReceiptNumber = :empRef AND e.status = :status")
    Page<EmployerPaymentReceipt> findByEmployerReceiptNumberAndStatus(
        @Param("empRef") String employerReceiptNumber, 
        @Param("status") String status, 
        Pageable pageable
    );
    
    // Find by employer receipt number, status and date range
    @Query("SELECT e FROM EmployerPaymentReceipt e WHERE e.employerReceiptNumber = :empRef AND e.status = :status AND e.validatedAt BETWEEN :startDate AND :endDate")
    Page<EmployerPaymentReceipt> findByEmployerReceiptNumberAndStatusAndValidatedAtBetween(
        @Param("empRef") String employerReceiptNumber,
        @Param("status") String status, 
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable
    );
    
    // Find by employer receipt number and date range
    @Query("SELECT e FROM EmployerPaymentReceipt e WHERE e.employerReceiptNumber = :empRef AND e.validatedAt BETWEEN :startDate AND :endDate")
    Page<EmployerPaymentReceipt> findByEmployerReceiptNumberAndValidatedAtBetween(
        @Param("empRef") String employerReceiptNumber,
        @Param("startDate") LocalDateTime startDate, 
        @Param("endDate") LocalDateTime endDate, 
        Pageable pageable
    );
    
    // Find by transaction reference for MT940 reconciliation
    List<EmployerPaymentReceipt> findByTransactionReference(String transactionReference);
}
