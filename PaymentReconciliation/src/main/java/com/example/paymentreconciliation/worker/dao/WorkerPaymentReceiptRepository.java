package com.example.paymentreconciliation.worker.dao;

import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerPaymentReceiptRepository extends JpaRepository<WorkerPaymentReceipt, Long> {
    
    List<WorkerPaymentReceipt> findByStatus(String status);
    
    Optional<WorkerPaymentReceipt> findByReceiptNumber(String receiptNumber);
}
