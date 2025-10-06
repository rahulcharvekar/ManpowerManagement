package com.example.paymentreconciliation.worker.service;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import com.example.paymentreconciliation.worker.repository.WorkerPaymentReceiptRepository;
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

    public WorkerPaymentReceiptService(WorkerPaymentReceiptRepository repository) {
        this.repository = repository;
    }

    public WorkerPaymentReceipt createReceipt(List<WorkerPayment> processedPayments) {
        log.info("Creating receipt for {} payments", processedPayments.size());
        
        if (processedPayments.isEmpty()) {
            throw new IllegalArgumentException("Cannot create receipt for empty payment list");
        }
        
        // Calculate total amount
        BigDecimal totalAmount = processedPayments.stream()
                .map(WorkerPayment::getPaymentAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Generate receipt number
        String receiptNumber = generateReceiptNumber();
        
        // Get employer_id and toli_id from the first payment (all payments in a batch should have the same employer/toli)
        WorkerPayment firstPayment = processedPayments.get(0);
        String employerId = firstPayment.getEmployerId();
        String toliId = firstPayment.getToliId();
        
        // Create receipt
        WorkerPaymentReceipt receipt = new WorkerPaymentReceipt();
        receipt.setReceiptNumber(receiptNumber);
        receipt.setEmployerId(employerId);
        receipt.setToliId(toliId);
        receipt.setCreatedAt(LocalDateTime.now());
        receipt.setTotalRecords(processedPayments.size());
        receipt.setTotalAmount(totalAmount);
        receipt.setStatus("GENERATED");
        
        // Save receipt first to get ID
        WorkerPaymentReceipt savedReceipt = repository.save(receipt);
        
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

    public List<WorkerPaymentReceipt> findByStatus(String status) {
        log.info("Finding worker payment receipts with status: {}", status);
        return repository.findByStatus(status);
    }

    public List<WorkerPaymentReceipt> findAll() {
        log.info("Finding all worker payment receipts");
        return repository.findAll();
    }

    public java.util.Optional<WorkerPaymentReceipt> findByReceiptNumber(String receiptNumber) {
        log.info("Finding worker payment receipt by receipt number: {}", receiptNumber);
        return repository.findByReceiptNumber(receiptNumber);
    }

    public org.springframework.data.domain.Page<WorkerPaymentReceipt> findByStatusPaginated(String status, org.springframework.data.domain.Pageable pageable) {
        log.info("Finding worker payment receipts with status: {} (paginated)", status);
        return repository.findByStatus(status, pageable);
    }

    public org.springframework.data.domain.Page<WorkerPaymentReceipt> findAllPaginated(org.springframework.data.domain.Pageable pageable) {
        log.info("Finding all worker payment receipts (paginated)");
        return repository.findAll(pageable);
    }

    public org.springframework.data.domain.Page<WorkerPaymentReceipt> findByStatusAndDateRangePaginated(
            String status, LocalDateTime startDate, LocalDateTime endDate, org.springframework.data.domain.Pageable pageable) {
        log.info("Finding worker payment receipts with status: {} between {} and {} (paginated)", status, startDate, endDate);
        return repository.findByStatusAndCreatedAtBetween(status, startDate, endDate, pageable);
    }

    public org.springframework.data.domain.Page<WorkerPaymentReceipt> findByDateRangePaginated(
            LocalDateTime startDate, LocalDateTime endDate, org.springframework.data.domain.Pageable pageable) {
        log.info("Finding worker payment receipts between {} and {} (paginated)", startDate, endDate);
        return repository.findByCreatedAtBetween(startDate, endDate, pageable);
    }

    public WorkerPaymentReceipt updateStatus(String receiptNumber, String newStatus) {
        log.info("Updating status of worker payment receipt {} to {}", receiptNumber, newStatus);
        
        WorkerPaymentReceipt receipt = repository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Worker payment receipt not found with number: " + receiptNumber));
        
        receipt.setStatus(newStatus);
        return repository.save(receipt);
    }
}
