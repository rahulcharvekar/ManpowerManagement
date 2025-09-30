package com.example.paymentreconciliation.reconciliation.controller;

import com.example.paymentreconciliation.reconciliation.service.ReconciliationService;
import com.example.paymentreconciliation.reconciliation.service.MT940ReconciliationService;
import com.example.paymentreconciliation.reconciliation.service.MT940ReconciliationService.ReconciliationResponse;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reconciliations")
@Tag(name = "Reconciliation Management", description = "APIs for payment reconciliation and MT940 matching")
public class ReconciliationController {

    private static final Logger log = LoggerFactoryProvider.getLogger(ReconciliationController.class);

    private final ReconciliationService reconciliationService;
    private final MT940ReconciliationService mt940ReconciliationService;

    public ReconciliationController(ReconciliationService reconciliationService, 
                                  MT940ReconciliationService mt940ReconciliationService) {
        this.reconciliationService = reconciliationService;
        this.mt940ReconciliationService = mt940ReconciliationService;
    }

    @PostMapping
    public ResponseEntity<String> reconcile() {
        log.info("Received reconcile request");
        String result = reconciliationService.reconcilePayments();
        log.info("Reconciliation completed");
        return ResponseEntity.accepted().body(result);
    }
    
    @PostMapping("/mt940")
    @Operation(summary = "Reconcile transaction against MT940 statements", 
               description = "Matches transaction reference and amount against MT940 bank statements. Returns detailed match status.")
    public ResponseEntity<?> reconcileWithMt940(
            @Parameter(description = "Transaction reference to match", example = "TXNREF")
            @RequestParam String txnRef,
            @Parameter(description = "Amount to match", example = "82752.30")
            @RequestParam BigDecimal amount
    ) {
        log.info("Received MT940 reconciliation request - txnRef: {}, amount: {}", txnRef, amount);
        
        try {
            ReconciliationResponse response = mt940ReconciliationService.reconcileTransaction(txnRef, amount);
            
            log.info("MT940 reconciliation completed - Status: {}, Amount Match: {}, Reference Match: {}", 
                    response.getStatus(), response.getAmountMatch(), response.getReferenceMatch());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error during MT940 reconciliation for txnRef: {}", txnRef, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Reconciliation failed: " + e.getMessage(),
                "txnRef", txnRef,
                "amount", amount
            ));
        }
    }
}
