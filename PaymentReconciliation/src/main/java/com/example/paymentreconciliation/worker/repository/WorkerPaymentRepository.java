package com.example.paymentreconciliation.worker.repository;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface WorkerPaymentRepository extends JpaRepository<WorkerPayment, Long> {
    List<WorkerPayment> findByRequestReferenceNumberStartingWith(String prefix);
    List<WorkerPayment> findByStatus(String status);
    List<WorkerPayment> findByRequestReferenceNumberStartingWithAndStatus(String prefix, String status);
    List<WorkerPayment> findByReceiptNumber(String receiptNumber);
    Page<WorkerPayment> findByReceiptNumber(String receiptNumber, Pageable pageable);
    
    // New methods for direct fileId linkage
    List<WorkerPayment> findByFileId(String fileId);
    List<WorkerPayment> findByFileIdAndStatus(String fileId, String status);
    
    // Paginated methods
    Page<WorkerPayment> findByFileId(String fileId, Pageable pageable);
    Page<WorkerPayment> findByFileIdAndStatus(String fileId, String status, Pageable pageable);
    
    // Simplified filtering - only status and date filters
    Page<WorkerPayment> findByStatus(String status, Pageable pageable);
    
    // Combined status and receipt number filtering (without date filtering due to missing columns)
    @Query("SELECT w FROM WorkerPayment w WHERE " +
           "(:status IS NULL OR w.status = :status) AND " +
           "(:receiptNumber IS NULL OR w.receiptNumber = :receiptNumber)")
    Page<WorkerPayment> findByStatusAndReceiptNumber(
        @Param("status") String status,
        @Param("receiptNumber") String receiptNumber,
        Pageable pageable
    );
    
    // Methods for uploadedFileRef
    List<WorkerPayment> findByUploadedFileRef(String uploadedFileRef);
    Page<WorkerPayment> findByUploadedFileRef(String uploadedFileRef, Pageable pageable);
    
    // Date filtering methods
    Page<WorkerPayment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    Page<WorkerPayment> findByStatusAndCreatedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    // Combined filtering with date range
    @Query("SELECT w FROM WorkerPayment w WHERE " +
           "(:status IS NULL OR w.status = :status) AND " +
           "(:receiptNumber IS NULL OR w.receiptNumber = :receiptNumber) AND " +
           "(:startDate IS NULL OR w.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR w.createdAt <= :endDate)")
    Page<WorkerPayment> findByStatusAndReceiptNumberAndDateRange(
        @Param("status") String status,
        @Param("receiptNumber") String receiptNumber,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
