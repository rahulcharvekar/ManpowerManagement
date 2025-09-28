package com.example.paymentreconciliation.system.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

@RestController
public class HealthController {

    private static final Logger log = LoggerFactoryProvider.getLogger(HealthController.class);

    @GetMapping("/api/v1/health")
    public String healthCheck() {
        log.info("Health check endpoint invoked");
        return "Payment Reconciliation service is up";
    }
}
