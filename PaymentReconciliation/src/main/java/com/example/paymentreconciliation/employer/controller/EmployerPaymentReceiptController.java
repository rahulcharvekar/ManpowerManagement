package com.example.paymentreconciliation.employer.controller;

import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.employer.service.EmployerPaymentReceiptService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employer/receipts")
@Tag(name = "Employer Receipt Management", description = "APIs for employer receipt validation and processing")
@SecurityRequirement(name = "Bearer Authentication")
public class EmployerPaymentReceiptController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(EmployerPaymentReceiptController.class);
    
    private final EmployerPaymentReceiptService service;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.paymentreconciliation.common.service.PaginationSessionService paginationSessionService;

    public EmployerPaymentReceiptController(EmployerPaymentReceiptService service) {
        this.service = service;
    }

    @GetMapping("/available")
    @Operation(summary = "Get available worker receipts with pagination and filtering", 
               description = "Returns paginated worker receipts with optional filters for status and date range")
    public ResponseEntity<?> getAvailableReceipts(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Receipt status filter", example = "GENERATED")
            @RequestParam(required = false) String status,
            @Parameter(description = "Single date filter (YYYY-MM-DD)", example = "2024-01-15")
            @RequestParam(required = false) String singleDate,
            @Parameter(description = "Start date for range filter (YYYY-MM-DD) - MANDATORY", example = "2024-01-01")
            @RequestParam(required = true) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) String endDate
    ) {
        log.info("Fetching available receipts with filters - page: {}, size: {}, status: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, singleDate, startDate, endDate);
        
        try {
            return ResponseEntity.ok(service.getAvailableReceiptsWithFilters(page, size, status, singleDate, startDate, endDate));
        } catch (Exception e) {
            log.error("Error fetching available receipts", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/pagination-session")
    public ResponseEntity<?> createPaginationSessionForEmployerReceipts(@RequestBody(required = false) java.util.Map<String, Object> body) {
        try {
            java.util.Map<String, String> filters = new java.util.HashMap<>();
            if (body != null) { body.forEach((k, v) -> { if (v != null) filters.put(k, v.toString()); }); }
            Long ttl = body != null && body.get("ttlMs") instanceof Number ? ((Number) body.get("ttlMs")).longValue() : null;
            Integer maxPageSize = body != null && body.get("maxPageSize") instanceof Number ? ((Number) body.get("maxPageSize")).intValue() : null;

            String token = paginationSessionService.createSession("employerReceipts", null, filters, ttl, maxPageSize);
            com.example.paymentreconciliation.common.service.PaginationSessionService.PaginationSession s = paginationSessionService.getSession(token);
            long expiresInMs = s != null ? s.expiresAt.toEpochMilli() - java.time.Instant.now().toEpochMilli() : 0L;
            return ResponseEntity.ok(java.util.Map.of("paginationToken", token, "expiresInMs", expiresInMs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/by-session")
    public ResponseEntity<?> getEmployerReceiptsBySession(@RequestBody SessionedPageRequest pageRequest) {
        try {
            if (pageRequest == null || pageRequest.getPaginationToken() == null) return ResponseEntity.badRequest().body(java.util.Map.of("error","paginationToken required"));
            com.example.paymentreconciliation.common.service.PaginationSessionService.PaginationSession session = paginationSessionService.getSession(pageRequest.getPaginationToken());
            if (session == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error","Invalid or expired token"));

            int page = pageRequest.getPage() >= 0 ? pageRequest.getPage() : 0;
            int size = Math.min(pageRequest.getSize() <= 0 ? 20 : pageRequest.getSize(), session.maxPageSize);

            // Delegate to service which already handles filters
            return ResponseEntity.ok(service.getAvailableReceiptsWithFilters(page, size, session.filters.get("status"), session.filters.get("singleDate"), session.filters.get("startDate"), session.filters.get("endDate")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    public static class SessionedPageRequest { private String paginationToken; private int page; private int size; public String getPaginationToken() { return paginationToken; } public void setPaginationToken(String paginationToken) { this.paginationToken = paginationToken; } public int getPage() { return page; } public void setPage(int page) { this.page = page; } public int getSize() { return size; } public void setSize(int size) { this.size = size; } }

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

    @GetMapping("/all")
    @Operation(summary = "Get all employer receipts with pagination and filtering", 
               description = "Returns paginated employer receipts with optional filters for status, date range, and employer reference")
    public ResponseEntity<?> getAllEmployerReceipts(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Receipt status filter", example = "PENDING")
            @RequestParam(required = false) String status,
            @Parameter(description = "Employer reference number filter", example = "EMP-20250930-123456-001")
            @RequestParam(required = false) String empRef,
            @Parameter(description = "Single date filter (YYYY-MM-DD)", example = "2024-01-15")
            @RequestParam(required = false) String singleDate,
            @Parameter(description = "Start date for range filter (YYYY-MM-DD) - MANDATORY", example = "2024-01-01")
            @RequestParam(required = true) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) String endDate
    ) {
        log.info("Fetching all employer receipts with filters - page: {}, size: {}, status: {}, empRef: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, empRef, singleDate, startDate, endDate);
        
        try {
            return ResponseEntity.ok(service.getAllEmployerReceiptsWithFilters(page, size, status, empRef, singleDate, startDate, endDate));
        } catch (Exception e) {
            log.error("Error fetching all employer receipts", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
