package com.example.paymentreconciliation.worker.dao;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface WorkerPaymentRepository extends JpaRepository<WorkerPayment, Long> {
    List<WorkerPayment> findByRequestReferenceNumberStartingWith(String prefix);
    List<WorkerPayment> findByStatus(WorkerPaymentStatus status);
    List<WorkerPayment> findByRequestReferenceNumberStartingWithAndStatus(String prefix, WorkerPaymentStatus status);
    List<WorkerPayment> findByReceiptNumber(String receiptNumber);
    Page<WorkerPayment> findByReceiptNumber(String receiptNumber, Pageable pageable);
    
    // New methods for direct fileId linkage
    List<WorkerPayment> findByFileId(String fileId);
    List<WorkerPayment> findByFileIdAndStatus(String fileId, WorkerPaymentStatus status);
    
    // Paginated methods
    Page<WorkerPayment> findByFileId(String fileId, Pageable pageable);
    Page<WorkerPayment> findByFileIdAndStatus(String fileId, WorkerPaymentStatus status, Pageable pageable);
    
    // Simplified filtering - only status and date filters
    Page<WorkerPayment> findByStatus(WorkerPaymentStatus status, Pageable pageable);
    
    // Combined status and receipt number filtering (without date filtering due to missing columns)
    @Query("SELECT w FROM WorkerPayment w WHERE " +
           "(:status IS NULL OR w.status = :status) AND " +
           "(:receiptNumber IS NULL OR w.receiptNumber = :receiptNumber)")
    Page<WorkerPayment> findByStatusAndReceiptNumber(
        @Param("status") WorkerPaymentStatus status,
        @Param("receiptNumber") String receiptNumber,
        Pageable pageable
    );
}
