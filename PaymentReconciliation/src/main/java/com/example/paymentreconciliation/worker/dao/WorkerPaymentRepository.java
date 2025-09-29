package com.example.paymentreconciliation.worker.dao;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkerPaymentRepository extends JpaRepository<WorkerPayment, Long> {
    List<WorkerPayment> findByRequestReferenceNumberStartingWith(String prefix);
    List<WorkerPayment> findByStatus(WorkerPaymentStatus status);
    List<WorkerPayment> findByRequestReferenceNumberStartingWithAndStatus(String prefix, WorkerPaymentStatus status);
    List<WorkerPayment> findByReceiptNumber(String receiptNumber);
}
