package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;

import com.example.paymentreconciliation.worker.service.WorkerPaymentService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import com.example.paymentreconciliation.common.util.ETagUtil;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.web.bind.annotation.DeleteMapping;
import com.example.paymentreconciliation.audit.annotation.Audited;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/worker-payments")
@Tag(name = "Worker Payment Management", description = "APIs for worker payment CRUD operations and filtering")
@SecurityRequirement(name = "Bearer Authentication")
public class WorkerPaymentController {

    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentController.class);

    private final WorkerPaymentService service;

    @org.springframework.beans.factory.annotation.Autowired
    private com.example.paymentreconciliation.common.service.PaginationSessionService paginationSessionService;

    public WorkerPaymentController(WorkerPaymentService service) {
        this.service = service;
    }

    @PostMapping
    @Audited(action = "CREATE_WORKER_PAYMENT", resourceType = "WORKER_PAYMENT")
    public ResponseEntity<WorkerPayment> create(@RequestBody WorkerPayment workerPayment) {
        log.info("Creating worker payment for workerRef={}", workerPayment.getWorkerRef());
        WorkerPayment created = service.create(workerPayment);
        log.info("Created worker payment id={}", created.getId());
        return ResponseEntity.created(URI.create("/api/v1/worker-payments/" + created.getId()))
                .body(created);
    }

    @GetMapping
    @Operation(summary = "Get all worker payments with filtering", 
               description = "Retrieve worker payments with optional filtering by status, receipt number, and date range, with pagination")
    public ResponseEntity<Page<WorkerPayment>> findAll(
            @Parameter(description = "Payment status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Receipt number filter") @RequestParam(required = false) String receiptNumber,
            @Parameter(description = "Start date for filtering (YYYY-MM-DD) - MANDATORY") @RequestParam(required = true) String startDate,
            @Parameter(description = "End date for filtering (YYYY-MM-DD) - MANDATORY") @RequestParam(required = true) String endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Fetching worker payments with filters - status: {}, receiptNumber: {}, dateRange: {} to {}, page: {}, size: {}", 
                status, receiptNumber, startDate, endDate, page, size);
        
        try {
            // Parse date parameters - startDate is now mandatory
            java.time.LocalDateTime startDateTime = java.time.LocalDate.parse(startDate.trim()).atStartOfDay();
            java.time.LocalDateTime endDateTime = null;
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                endDateTime = java.time.LocalDate.parse(endDate.trim()).atTime(23, 59, 59);
            } else {
                // If no endDate provided, use current date as end
                endDateTime = java.time.LocalDate.now().atTime(23, 59, 59);
            }
            
            // Create sort object
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
            
            // Create pageable object
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Use the comprehensive filtering method with date support
            return ResponseEntity.ok(service.findByStatusAndReceiptNumberAndDateRange(
                status, receiptNumber, startDateTime, endDateTime, pageable));
                
        } catch (java.time.format.DateTimeParseException e) {
            log.error("Invalid date format provided. Expected YYYY-MM-DD format", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error fetching worker payments", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Create session for worker payments listing
    @PostMapping("/pagination-session")
    public ResponseEntity<?> createPaginationSessionForPayments(@RequestBody(required = false) java.util.Map<String, Object> body) {
        try {
            // Accept filters as a simple map in body: status, receiptNumber, startDate, endDate, sortBy, sortDir
            java.util.Map<String, String> filters = new java.util.HashMap<>();
            if (body != null) {
                body.forEach((k, v) -> { if (v != null) filters.put(k, v.toString()); });
            }
            Long ttl = body != null && body.get("ttlMs") instanceof Number ? ((Number) body.get("ttlMs")).longValue() : null;
            Integer maxPageSize = body != null && body.get("maxPageSize") instanceof Number ? ((Number) body.get("maxPageSize")).intValue() : null;

            String token = paginationSessionService.createSession("workerPayments", null, filters, ttl, maxPageSize);
            com.example.paymentreconciliation.common.service.PaginationSessionService.PaginationSession s = paginationSessionService.getSession(token);
            long expiresInMs = s != null ? s.expiresAt.toEpochMilli() - java.time.Instant.now().toEpochMilli() : 0L;
            return ResponseEntity.ok(java.util.Map.of("paginationToken", token, "expiresInMs", expiresInMs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/by-session")
    public ResponseEntity<?> getPaymentsBySession(@RequestBody SessionedPageRequest pageRequest) {
        try {
            if (pageRequest == null || pageRequest.getPaginationToken() == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of("error", "paginationToken required"));
            }

            com.example.paymentreconciliation.common.service.PaginationSessionService.PaginationSession session = paginationSessionService.getSession(pageRequest.getPaginationToken());
            if (session == null) return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body(java.util.Map.of("error", "Invalid or expired token"));

            int page = pageRequest.getPage() >= 0 ? pageRequest.getPage() : 0;
            int size = Math.min(pageRequest.getSize() <= 0 ? 20 : pageRequest.getSize(), session.maxPageSize);

            String status = session.filters.get("status");
            String receiptNumber = session.filters.get("receiptNumber");
            String startDate = session.filters.get("startDate");
            String endDate = session.filters.get("endDate");
            String sortBy = session.filters.getOrDefault("sortBy", "createdAt");
            String sortDir = session.filters.getOrDefault("sortDir", "desc");

            // Convert dates
            java.time.LocalDateTime startDateTime = java.time.LocalDate.parse(startDate.trim()).atStartOfDay();
            java.time.LocalDateTime endDateTime = null;
            if (endDate != null && !endDate.trim().isEmpty()) {
                endDateTime = java.time.LocalDate.parse(endDate.trim()).atTime(23, 59, 59);
            } else {
                endDateTime = java.time.LocalDate.now().atTime(23, 59, 59);
            }

            Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);

            return ResponseEntity.ok(service.findByStatusAndReceiptNumberAndDateRange(status, receiptNumber, startDateTime, endDateTime, pageable));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    public static class SessionedPageRequest {
        private String paginationToken;
        private int page;
        private int size;
        public String getPaginationToken() { return paginationToken; }
        public void setPaginationToken(String paginationToken) { this.paginationToken = paginationToken; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerPayment> findById(@PathVariable("id") Long id) {
        log.info("Fetching worker payment id={}", id);
        return ResponseEntity.ok(service.findById(id));
    }

    @GetMapping("/by-reference-prefix")
    public ResponseEntity<List<WorkerPayment>> findByReferencePrefix(@RequestParam("prefix") String prefix) {
        log.info("Fetching worker payments with reference prefix={}", prefix);
        List<WorkerPayment> payments = service.findByRequestReferencePrefix(prefix);
        return ResponseEntity.ok(payments);
    }

    @PutMapping("/{id}")
    @Audited(action = "UPDATE_WORKER_PAYMENT", resourceType = "WORKER_PAYMENT")
    public ResponseEntity<WorkerPayment> update(@PathVariable("id") Long id, @RequestBody WorkerPayment workerPayment) {
        log.info("Updating worker payment id={}", id);
        return ResponseEntity.ok(service.update(id, workerPayment));
    }

    @DeleteMapping("/{id}")
    @Audited(action = "DELETE_WORKER_PAYMENT", resourceType = "WORKER_PAYMENT")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        log.info("Deleting worker payment id={}", id);
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/by-uploaded-file-ref/{uploadedFileRef}")
    @Operation(summary = "Get worker payments by uploaded file reference", 
               description = "Returns all worker payments that originated from a specific uploaded file")
    public ResponseEntity<?> getByUploadedFileRef(
            @Parameter(description = "Uploaded file reference") 
            @PathVariable String uploadedFileRef,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field", example = "id")
            @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction", example = "asc")
            @RequestParam(defaultValue = "asc") String sortDir,
            HttpServletRequest request) {
        log.info("Fetching worker payments by uploadedFileRef={}", uploadedFileRef);
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<WorkerPayment> paymentsPage = service.findByUploadedFileRefPaginated(uploadedFileRef, pageable);
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("payments", paymentsPage.getContent());
            response.put("totalElements", paymentsPage.getTotalElements());
            response.put("totalPages", paymentsPage.getTotalPages());
            response.put("currentPage", paymentsPage.getNumber());
            response.put("pageSize", paymentsPage.getSize());
            response.put("hasNext", paymentsPage.hasNext());
            response.put("hasPrevious", paymentsPage.hasPrevious());
            response.put("uploadedFileRef", uploadedFileRef);

            // Generate ETag from response content
            String responseJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(response);
            String eTag = ETagUtil.generateETag(responseJson);
            String ifNoneMatch = request.getHeader(HttpHeaders.IF_NONE_MATCH);
            if (eTag.equals(ifNoneMatch)) {
                return ResponseEntity.status(304).eTag(eTag).build();
            }
            return ResponseEntity.ok().eTag(eTag).body(response);
        } catch (Exception e) {
            log.error("Error fetching payments by uploadedFileRef: {}", uploadedFileRef, e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
