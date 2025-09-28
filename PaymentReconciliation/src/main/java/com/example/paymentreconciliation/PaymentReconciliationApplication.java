package com.example.paymentreconciliation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

@SpringBootApplication
public class PaymentReconciliationApplication {

    private static final Logger log = LoggerFactoryProvider.getLogger(PaymentReconciliationApplication.class);
    public static void main(String[] args) {
        log.info("Starting Payment Reconciliation application");
        SpringApplication.run(PaymentReconciliationApplication.class, args);
    }
}
