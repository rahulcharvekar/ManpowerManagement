package com.example.paymentreconciliation.reconciliation.service;

import com.example.paymentreconciliation.board.dao.BoardReconciliationReceiptRepository;
import com.example.paymentreconciliation.board.entity.BoardReconciliationReceipt;
import com.example.paymentreconciliation.employer.dao.EmployerPaymentReceiptRepository;
import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.reconciliation.service.MT940ReconciliationService.MT940Transaction;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class BoardReconciliationService {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(BoardReconciliationService.class);
    
    @Autowired
    private BoardReconciliationReceiptRepository boardReceiptRepository;
    
    @Autowired
    private EmployerPaymentReceiptRepository employerReceiptRepository;
    
    @Autowired
    private MT940ReconciliationService mt940Service;
    
    /**
     * Get all validated employer receipts available for board reconciliation
     */
    public List<EmployerPaymentReceipt> getValidatedReceiptsForReconciliation() {
        log.info("Fetching validated employer receipts for board reconciliation");
        return employerReceiptRepository.findByStatus("VALIDATED");
    }
    
    /**
     * Reconcile an employer receipt against MT940 statement
     */
    @Transactional
    public BoardReconciliationReceipt reconcileEmployerReceipt(String employerReceiptNumber, String reconciledBy) {
        log.info("Starting reconciliation for employer receipt: {} by user: {}", employerReceiptNumber, reconciledBy);
        
        // Fetch employer receipt
        Optional<EmployerPaymentReceipt> employerReceiptOpt = employerReceiptRepository.findByEmployerReceiptNumber(employerReceiptNumber);
        if (!employerReceiptOpt.isPresent()) {
            throw new RuntimeException("Employer receipt not found: " + employerReceiptNumber);
        }
        
        EmployerPaymentReceipt employerReceipt = employerReceiptOpt.get();
        
        // Check if already reconciled
        Optional<BoardReconciliationReceipt> existingReconciliation = 
            boardReceiptRepository.findByEmployerReceiptNumber(employerReceiptNumber);
        if (existingReconciliation.isPresent()) {
            throw new RuntimeException("Employer receipt already reconciled: " + employerReceiptNumber);
        }
        
        // Search in MT940 statement
        MT940Transaction mt940Transaction = mt940Service.findTransactionInEODStatement(
            employerReceipt.getTransactionReference(), 
            employerReceipt.getTotalAmount()
        );
        
        BoardReconciliationReceipt reconciliationReceipt = new BoardReconciliationReceipt();
        reconciliationReceipt.setBoardReceiptNumber(generateBoardReceiptNumber());
        reconciliationReceipt.setEmployerReceiptNumber(employerReceiptNumber);
        reconciliationReceipt.setWorkerReceiptNumber(employerReceipt.getWorkerReceiptNumber());
        reconciliationReceipt.setTransactionReference(employerReceipt.getTransactionReference());
        reconciliationReceipt.setTotalAmount(employerReceipt.getTotalAmount());
        reconciliationReceipt.setTotalRecords(employerReceipt.getTotalRecords());
        reconciliationReceipt.setReconciledBy(reconciledBy);
        reconciliationReceipt.setReconciledAt(LocalDateTime.now());
        reconciliationReceipt.setStatementDate(LocalDateTime.now());
        
        if (mt940Transaction != null) {
            // Successful reconciliation
            reconciliationReceipt.setMt940Reference(mt940Transaction.getMt940Reference());
            reconciliationReceipt.setReconciledAmount(mt940Transaction.getAmount());
            reconciliationReceipt.setStatus("RECONCILED");
            reconciliationReceipt.setRemarks("Successfully matched with MT940 statement");
            
            log.info("Successfully reconciled employer receipt {} with MT940 ref {}", 
                    employerReceiptNumber, mt940Transaction.getMt940Reference());
        } else {
            // Failed reconciliation
            reconciliationReceipt.setMt940Reference(null);
            reconciliationReceipt.setReconciledAmount(BigDecimal.ZERO);
            reconciliationReceipt.setStatus("FAILED");
            reconciliationReceipt.setRemarks("No matching transaction found in MT940 statement");
            
            log.warn("Failed to reconcile employer receipt {} - no MT940 match found", employerReceiptNumber);
        }
        
        return boardReceiptRepository.save(reconciliationReceipt);
    }
    
    /**
     * Get all board reconciliation receipts
     */
    public List<BoardReconciliationReceipt> getAllBoardReconciliations() {
        log.info("Fetching all board reconciliation receipts");
        return boardReceiptRepository.findAll();
    }
    
    /**
     * Get board reconciliation receipts by status
     */
    public List<BoardReconciliationReceipt> getBoardReconciliationsByStatus(String status) {
        log.info("Fetching board reconciliation receipts with status: {}", status);
        return boardReceiptRepository.findByStatus(status);
    }
    
    /**
     * Get board reconciliation receipts by reconciled user
     */
    public List<BoardReconciliationReceipt> getBoardReconciliationsByUser(String reconciledBy) {
        log.info("Fetching board reconciliation receipts by user: {}", reconciledBy);
        return boardReceiptRepository.findByReconciledBy(reconciledBy);
    }
    
    /**
     * Generate unique board receipt number
     * Format: BRD-YYYYMMDD-HHMMSS-XXX
     */
    private String generateBoardReceiptNumber() {
        LocalDateTime now = LocalDateTime.now();
        String timestamp = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        
        // Generate random 3-digit number
        int randomNum = (int)(Math.random() * 900) + 100;
        
        String receiptNumber = "BRD-" + timestamp + "-" + randomNum;
        
        // Ensure uniqueness (in case of collision)
        while (boardReceiptRepository.findByBoardReceiptNumber(receiptNumber).isPresent()) {
            randomNum = (int)(Math.random() * 900) + 100;
            receiptNumber = "BRD-" + timestamp + "-" + randomNum;
        }
        
        log.info("Generated board receipt number: {}", receiptNumber);
        return receiptNumber;
    }
}
