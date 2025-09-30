package com.example.paymentreconciliation.worker.dao;

import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WorkerPaymentReceiptRepository extends JpaRepository<WorkerPaymentReceipt, Long> {
    
    List<WorkerPaymentReceipt> findByStatus(String status);
    
    Page<WorkerPaymentReceipt> findByStatus(String status, Pageable pageable);
    
    Page<WorkerPaymentReceipt> findByStatusAndCreatedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    Optional<WorkerPaymentReceipt> findByReceiptNumber(String receiptNumber);
}
