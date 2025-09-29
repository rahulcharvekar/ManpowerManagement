package com.example.paymentreconciliation.employer.dao;

import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployerPaymentReceiptRepository extends JpaRepository<EmployerPaymentReceipt, Long> {
    
    Optional<EmployerPaymentReceipt> findByWorkerReceiptNumber(String workerReceiptNumber);
    
    List<EmployerPaymentReceipt> findByStatus(String status);
    
    List<EmployerPaymentReceipt> findByValidatedBy(String validatedBy);
    
    Optional<EmployerPaymentReceipt> findByEmployerReceiptNumber(String employerReceiptNumber);
}
