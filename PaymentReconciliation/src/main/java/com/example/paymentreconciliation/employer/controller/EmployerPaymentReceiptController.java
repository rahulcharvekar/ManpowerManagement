package com.example.paymentreconciliation.employer.controller;

import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.employer.service.EmployerPaymentReceiptService;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employer/receipts")
@Tag(name = "Employer Receipt Management", description = "APIs for employer receipt validation and processing")
public class EmployerPaymentReceiptController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(EmployerPaymentReceiptController.class);
    
    private final EmployerPaymentReceiptService service;

    public EmployerPaymentReceiptController(EmployerPaymentReceiptService service) {
        this.service = service;
    }

    @GetMapping("/available")
    @Operation(summary = "Get available worker receipts for validation", 
               description = "Returns all worker receipts in GENERATED state that are ready for employer validation")
    public ResponseEntity<List<WorkerPaymentReceipt>> getAvailableReceipts() {
        log.info("Fetching available worker receipts for employer validation");
        List<WorkerPaymentReceipt> receipts = service.getAvailableReceipts();
        return ResponseEntity.ok(receipts);
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate worker receipt and create employer receipt", 
               description = "Validates a worker receipt with transaction reference and creates employer receipt")
    public ResponseEntity<?> validateReceipt(@RequestBody ReceiptValidationRequest request) {
        log.info("Validating worker receipt: {} with transaction reference: {}", 
                request.getWorkerReceiptNumber(), request.getTransactionReference());
        
        try {
            EmployerPaymentReceipt employerReceipt = service.validateAndCreateEmployerReceipt(
                request.getWorkerReceiptNumber(),
                request.getTransactionReference(),
                request.getValidatedBy()
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Receipt validated successfully",
                "employerReceiptNumber", employerReceipt.getEmployerReceiptNumber(),
                "workerReceiptNumber", employerReceipt.getWorkerReceiptNumber(),
                "transactionReference", employerReceipt.getTransactionReference(),
                "totalAmount", employerReceipt.getTotalAmount(),
                "totalRecords", employerReceipt.getTotalRecords(),
                "validatedAt", employerReceipt.getValidatedAt()
            ));
            
        } catch (Exception e) {
            log.error("Error validating receipt: {}", request.getWorkerReceiptNumber(), e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/validated")
    @Operation(summary = "Get all validated employer receipts", 
               description = "Returns all employer receipts that have been validated")
    public ResponseEntity<List<EmployerPaymentReceipt>> getValidatedReceipts() {
        log.info("Fetching all validated employer receipts");
        List<EmployerPaymentReceipt> receipts = service.findByStatus("VALIDATED");
        return ResponseEntity.ok(receipts);
    }

    @GetMapping("/worker/{workerReceiptNumber}")
    @Operation(summary = "Get employer receipt by worker receipt number", 
               description = "Returns employer receipt details for a specific worker receipt")
    public ResponseEntity<?> getByWorkerReceiptNumber(
            @Parameter(description = "Worker receipt number") 
            @PathVariable String workerReceiptNumber) {
        log.info("Fetching employer receipt for worker receipt: {}", workerReceiptNumber);
        
        return service.findByWorkerReceiptNumber(workerReceiptNumber)
                .map(receipt -> ResponseEntity.ok(receipt))
                .orElse(ResponseEntity.notFound().build());
    }

    // Request DTO class
    public static class ReceiptValidationRequest {
        private String workerReceiptNumber;
        private String transactionReference;
        private String validatedBy;

        public String getWorkerReceiptNumber() {
            return workerReceiptNumber;
        }

        public void setWorkerReceiptNumber(String workerReceiptNumber) {
            this.workerReceiptNumber = workerReceiptNumber;
        }

        public String getTransactionReference() {
            return transactionReference;
        }

        public void setTransactionReference(String transactionReference) {
            this.transactionReference = transactionReference;
        }

        public String getValidatedBy() {
            return validatedBy;
        }

        public void setValidatedBy(String validatedBy) {
            this.validatedBy = validatedBy;
        }
    }
}
