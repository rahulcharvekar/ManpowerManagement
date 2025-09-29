package com.example.paymentreconciliation.worker.dao;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface WorkerPaymentRepository extends JpaRepository<WorkerPayment, Long> {
    List<WorkerPayment> findByRequestReferenceNumberStartingWith(String prefix);
    List<WorkerPayment> findByStatus(WorkerPaymentStatus status);
    List<WorkerPayment> findByRequestReferenceNumberStartingWithAndStatus(String prefix, WorkerPaymentStatus status);
    List<WorkerPayment> findByReceiptNumber(String receiptNumber);
    
    // New methods for direct fileId linkage
    List<WorkerPayment> findByFileId(String fileId);
    List<WorkerPayment> findByFileIdAndStatus(String fileId, WorkerPaymentStatus status);
    
    // Paginated methods
    Page<WorkerPayment> findByFileId(String fileId, Pageable pageable);
    Page<WorkerPayment> findByFileIdAndStatus(String fileId, WorkerPaymentStatus status, Pageable pageable);
}
