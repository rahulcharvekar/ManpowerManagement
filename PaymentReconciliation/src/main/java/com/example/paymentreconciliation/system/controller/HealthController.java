package com.example.paymentreconciliation.system.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import com.example.paymentreconciliation.common.util.ETagUtil;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

@RestController
public class HealthController {

    private static final Logger log = LoggerFactoryProvider.getLogger(HealthController.class);

    @GetMapping("/api/v1/health")
    public ResponseEntity<String> healthCheck(HttpServletRequest request) {
        log.info("Health check endpoint invoked");
        String response = "Payment Reconciliation service is up";
        String eTag = ETagUtil.generateETag(response);
        String ifNoneMatch = request.getHeader(HttpHeaders.IF_NONE_MATCH);
        if (eTag.equals(ifNoneMatch)) {
            return ResponseEntity.status(304).eTag(eTag).build();
        }
        return ResponseEntity.ok().eTag(eTag).body(response);
    }
}
