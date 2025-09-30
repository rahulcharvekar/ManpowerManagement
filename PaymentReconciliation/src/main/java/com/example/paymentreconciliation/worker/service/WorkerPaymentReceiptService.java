package com.example.paymentreconciliation.worker.service;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import com.example.paymentreconciliation.worker.dao.WorkerPaymentReceiptRepository;
import com.example.paymentreconciliation.employer.service.EmployerPaymentReceiptService;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class WorkerPaymentReceiptService {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentReceiptService.class);
    
    private final WorkerPaymentReceiptRepository repository;
    private final EmployerPaymentReceiptService employerReceiptService;

    public WorkerPaymentReceiptService(WorkerPaymentReceiptRepository repository,
                                     EmployerPaymentReceiptService employerReceiptService) {
        this.repository = repository;
        this.employerReceiptService = employerReceiptService;
    }

    public WorkerPaymentReceipt createReceipt(List<WorkerPayment> processedPayments) {
        log.info("Creating receipt for {} processed payments", processedPayments.size());
        
        // Calculate total amount
        BigDecimal totalAmount = processedPayments.stream()
                .map(WorkerPayment::getPaymentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Generate receipt number
        String receiptNumber = generateReceiptNumber();
        
        // Create receipt
        WorkerPaymentReceipt receipt = new WorkerPaymentReceipt();
        receipt.setReceiptNumber(receiptNumber);
        receipt.setCreatedAt(LocalDateTime.now());
        receipt.setTotalRecords(processedPayments.size());
        receipt.setTotalAmount(totalAmount);
        receipt.setStatus("GENERATED");
        
        // Save receipt first to get ID
        WorkerPaymentReceipt savedReceipt = repository.save(receipt);
        
        // Automatically create corresponding employer receipt with PENDING status
        try {
            employerReceiptService.createPendingEmployerReceipt(savedReceipt);
            log.info("Auto-created pending employer receipt for worker receipt {}", receiptNumber);
        } catch (Exception e) {
            log.error("Failed to create pending employer receipt for worker receipt {}", receiptNumber, e);
        }
        
        log.info("Created receipt {} with {} payments totaling {}", receiptNumber, processedPayments.size(), totalAmount);
        
        return savedReceipt;
    }
    
    private String generateReceiptNumber() {
        // Generate receipt number in format: RCP-YYYYMMDD-HHMMSS-XXX
        LocalDateTime now = LocalDateTime.now();
        String dateTime = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String sequence = String.format("%03d", (System.currentTimeMillis() % 1000));
        
        return "RCP-" + dateTime + "-" + sequence;
    }
}
