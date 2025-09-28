package com.example.paymentreconciliation.worker.dao;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkerPaymentRepository extends JpaRepository<WorkerPayment, Long> {
}
