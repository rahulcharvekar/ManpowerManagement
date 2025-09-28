package com.example.paymentreconciliation.employer.dao;

import com.example.paymentreconciliation.employer.entity.EmployerPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployerPaymentRepository extends JpaRepository<EmployerPayment, Long> {
}
