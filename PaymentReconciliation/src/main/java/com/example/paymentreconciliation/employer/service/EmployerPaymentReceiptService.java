package com.example.paymentreconciliation.employer.service;

import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.employer.dao.EmployerPaymentReceiptRepository;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import com.example.paymentreconciliation.worker.dao.WorkerPaymentReceiptRepository;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class EmployerPaymentReceiptService {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(EmployerPaymentReceiptService.class);
    
    private final EmployerPaymentReceiptRepository repository;
    private final WorkerPaymentReceiptRepository workerReceiptRepository;

    public EmployerPaymentReceiptService(EmployerPaymentReceiptRepository repository, 
                                       WorkerPaymentReceiptRepository workerReceiptRepository) {
        this.repository = repository;
        this.workerReceiptRepository = workerReceiptRepository;
    }

    @Transactional(readOnly = true)
    public List<WorkerPaymentReceipt> getAvailableReceipts() {
        log.info("Retrieving worker receipts available for employer validation");
        return workerReceiptRepository.findByStatus("GENERATED");
    }

    public EmployerPaymentReceipt validateAndCreateEmployerReceipt(String workerReceiptNumber, 
                                                                 String transactionReference, 
                                                                 String validatedBy) {
        log.info("Creating employer receipt for worker receipt: {} with txn ref: {}", 
                workerReceiptNumber, transactionReference);
        
        // Find the worker receipt
        Optional<WorkerPaymentReceipt> workerReceiptOpt = workerReceiptRepository.findByReceiptNumber(workerReceiptNumber);
        if (workerReceiptOpt.isEmpty()) {
            throw new RuntimeException("Worker receipt not found: " + workerReceiptNumber);
        }
        
        WorkerPaymentReceipt workerReceipt = workerReceiptOpt.get();
        
        // Check if already validated
        Optional<EmployerPaymentReceipt> existingOpt = repository.findByWorkerReceiptNumber(workerReceiptNumber);
        if (existingOpt.isPresent()) {
            throw new RuntimeException("Worker receipt already validated: " + workerReceiptNumber);
        }
        
        // Create employer receipt
        EmployerPaymentReceipt employerReceipt = new EmployerPaymentReceipt();
        employerReceipt.setEmployerReceiptNumber(generateEmployerReceiptNumber());
        employerReceipt.setWorkerReceiptNumber(workerReceiptNumber);
        employerReceipt.setTransactionReference(transactionReference);
        employerReceipt.setValidatedBy(validatedBy);
        employerReceipt.setValidatedAt(LocalDateTime.now());
        employerReceipt.setTotalRecords(workerReceipt.getTotalRecords());
        employerReceipt.setTotalAmount(workerReceipt.getTotalAmount());
        employerReceipt.setStatus("VALIDATED");
        
        // Save employer receipt
        EmployerPaymentReceipt savedReceipt = repository.save(employerReceipt);
        
        // Update worker receipt status
        workerReceipt.setStatus("VALIDATED");
        workerReceiptRepository.save(workerReceipt);
        
        log.info("Created employer receipt {} for worker receipt {}", 
                savedReceipt.getEmployerReceiptNumber(), workerReceiptNumber);
        
        return savedReceipt;
    }
    
    @Transactional(readOnly = true)
    public List<EmployerPaymentReceipt> findByStatus(String status) {
        log.info("Finding employer receipts with status: {}", status);
        return repository.findByStatus(status);
    }
    
    @Transactional(readOnly = true)
    public Optional<EmployerPaymentReceipt> findByWorkerReceiptNumber(String workerReceiptNumber) {
        log.info("Finding employer receipt for worker receipt: {}", workerReceiptNumber);
        return repository.findByWorkerReceiptNumber(workerReceiptNumber);
    }
    
    private String generateEmployerReceiptNumber() {
        // Generate employer receipt number in format: EMP-YYYYMMDD-HHMMSS-XXX
        LocalDateTime now = LocalDateTime.now();
        String dateTime = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String sequence = String.format("%03d", (System.currentTimeMillis() % 1000));
        
        return "EMP-" + dateTime + "-" + sequence;
    }
}
