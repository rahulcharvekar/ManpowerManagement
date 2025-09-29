package com.example.paymentreconciliation.reconciliation.service;

import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Mock MT940 service to simulate end-of-day statement data
 * In production, this would integrate with actual MT940 data source
 */
@Service
public class MT940ReconciliationService {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(MT940ReconciliationService.class);

    /**
     * Mock method to find transaction in today's EOD statement
     * @param transactionReference The transaction reference to search for
     * @param expectedAmount The expected amount to match
     * @return MT940Transaction if found and amount matches, null otherwise
     */
    public MT940Transaction findTransactionInEODStatement(String transactionReference, BigDecimal expectedAmount) {
        log.info("Searching MT940 EOD statement for txn ref: {} with amount: {}", transactionReference, expectedAmount);
        
        // Mock EOD statement data - in production this would come from actual MT940 data
        List<MT940Transaction> mockEODTransactions = getMockEODTransactions();
        
        Optional<MT940Transaction> matchingTransaction = mockEODTransactions.stream()
                .filter(txn -> transactionReference.equals(txn.getTransactionReference()))
                .filter(txn -> expectedAmount.compareTo(txn.getAmount()) == 0)
                .findFirst();
        
        if (matchingTransaction.isPresent()) {
            log.info("Found matching transaction in MT940: {}", matchingTransaction.get().getMt940Reference());
            return matchingTransaction.get();
        } else {
            log.warn("No matching transaction found in MT940 for ref: {} amount: {}", transactionReference, expectedAmount);
            return null;
        }
    }
    
    /**
     * Mock method to get today's EOD statement transactions
     * In production, this would fetch from actual MT940 data source
     */
    private List<MT940Transaction> getMockEODTransactions() {
        // Mock data - replace with actual MT940 integration
        List<MT940Transaction> transactions = new ArrayList<>();
        
        // Add some mock transactions for testing
        transactions.add(new MT940Transaction(
            "TXN", 
            new BigDecimal("82752.30"), 
            LocalDate.now(),
            "MT940-REF-001",
            "CREDIT TRANSFER"
        ));
        
        transactions.add(new MT940Transaction(
            "TXN123456789", 
            new BigDecimal("50000.00"), 
            LocalDate.now(),
            "MT940-REF-002",
            "CREDIT TRANSFER"
        ));
        
        transactions.add(new MT940Transaction(
            "TXN987654321", 
            new BigDecimal("25000.00"), 
            LocalDate.now(),
            "MT940-REF-003",
            "CREDIT TRANSFER"
        ));
        
        transactions.add(new MT940Transaction(
            "TXN555666777", 
            new BigDecimal("75000.00"), 
            LocalDate.now(),
            "MT940-REF-004",
            "CREDIT TRANSFER"
        ));
        
        return transactions;
    }
    
    /**
     * DTO class for MT940 transaction data
     */
    public static class MT940Transaction {
        private String transactionReference;
        private BigDecimal amount;
        private LocalDate valueDate;
        private String mt940Reference;
        private String transactionType;
        
        public MT940Transaction(String transactionReference, BigDecimal amount, 
                              LocalDate valueDate, String mt940Reference, String transactionType) {
            this.transactionReference = transactionReference;
            this.amount = amount;
            this.valueDate = valueDate;
            this.mt940Reference = mt940Reference;
            this.transactionType = transactionType;
        }
        
        // Getters
        public String getTransactionReference() { return transactionReference; }
        public BigDecimal getAmount() { return amount; }
        public LocalDate getValueDate() { return valueDate; }
        public String getMt940Reference() { return mt940Reference; }
        public String getTransactionType() { return transactionType; }
    }
}
