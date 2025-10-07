package com.example.paymentreconciliation.worker.repository;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerPaymentRepository extends JpaRepository<WorkerPayment, Long> {
    // All read operations now handled by WorkerPaymentQueryDao
    // Only JPA save operations remain for WRITE operations
}
