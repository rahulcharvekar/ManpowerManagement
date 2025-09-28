package com.example.paymentreconciliation.reconciliation.controller;

import com.example.paymentreconciliation.reconciliation.service.ReconciliationService;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reconciliations")
public class ReconciliationController {

    private static final Logger log = LoggerFactoryProvider.getLogger(ReconciliationController.class);

    private final ReconciliationService reconciliationService;

    public ReconciliationController(ReconciliationService reconciliationService) {
        this.reconciliationService = reconciliationService;
    }

    @PostMapping
    public ResponseEntity<String> reconcile() {
        log.info("Received reconcile request");
        String result = reconciliationService.reconcilePayments();
        log.info("Reconciliation completed");
        return ResponseEntity.accepted().body(result);
    }
}
