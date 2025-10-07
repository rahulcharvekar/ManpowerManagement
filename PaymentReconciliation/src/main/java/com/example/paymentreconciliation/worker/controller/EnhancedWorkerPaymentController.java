package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.service.EnhancedWorkerPaymentService;
import com.example.paymentreconciliation.common.dao.BaseQueryDao.PageResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Enhanced Worker Payment Controller demonstrating the query-based approach for reads
 * and JPA-based approach for writes. This provides better control and easier debugging
 * of read operations while maintaining JPA benefits for write operations.
 */
@RestController
@RequestMapping("/api/v2/worker-payments")
@Tag(name = "Worker Payments v2", description = "Enhanced worker payment operations with query-based reads")
@SecurityRequirement(name = "Bearer Authentication")
public class EnhancedWorkerPaymentController {

    private final EnhancedWorkerPaymentService service;

    public EnhancedWorkerPaymentController(EnhancedWorkerPaymentService service) {
        this.service = service;
    }

    // ===========================================
    // READ OPERATIONS - Using Custom Queries
    // ===========================================

    @GetMapping("/{id}")
    @Operation(summary = "Get worker payment by ID", 
               description = "Retrieve a single worker payment using optimized custom query")
    public ResponseEntity<WorkerPayment> getById(@PathVariable Long id) {
        Optional<WorkerPayment> payment = service.findById(id);
        return payment.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get worker payments with filters", 
               description = "Retrieve worker payments with comprehensive filtering and pagination using custom queries")
    public ResponseEntity<Map<String, Object>> getPaymentsWithFilters(
            @Parameter(description = "Payment status filter") @RequestParam(required = false) String status,
            @Parameter(description = "Receipt number filter") @RequestParam(required = false) String receiptNumber,
            @Parameter(description = "File ID filter") @RequestParam(required = false) String fileId,
            @Parameter(description = "Start date filter") @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "End date filter") @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        PageResult<WorkerPayment> result = service.findWithFilters(
            status, receiptNumber, fileId, startDate, endDate, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("page", result.getPage());
        response.put("size", result.getSize());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("first", result.isFirst());
        response.put("last", result.isLast());
        response.put("hasNext", result.hasNext());
        response.put("hasPrevious", result.hasPrevious());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-status")
    @Operation(summary = "Get payments by status", 
               description = "Retrieve worker payments filtered by status with pagination")
    public ResponseEntity<Map<String, Object>> getByStatus(
            @Parameter(description = "Payment status") @RequestParam String status,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        PageResult<WorkerPayment> result = service.findByStatus(status, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("totalElements", result.getTotalElements());
        response.put("totalPages", result.getTotalPages());
        response.put("currentPage", result.getPage());
        response.put("pageSize", result.getSize());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-receipt-number/{receiptNumber}")
    @Operation(summary = "Get payments by receipt number", 
               description = "Retrieve worker payments by receipt number using custom query")
    public ResponseEntity<List<WorkerPayment>> getByReceiptNumber(@PathVariable String receiptNumber) {
        List<WorkerPayment> payments = service.findByReceiptNumber(receiptNumber);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/by-file/{fileId}")
    @Operation(summary = "Get payments by file ID", 
               description = "Retrieve worker payments by file ID with pagination")
    public ResponseEntity<Map<String, Object>> getByFileId(
            @PathVariable String fileId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResult<WorkerPayment> result = service.findByFileId(fileId, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("pagination", Map.of(
            "page", result.getPage(),
            "size", result.getSize(),
            "totalElements", result.getTotalElements(),
            "totalPages", result.getTotalPages()
        ));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-reference-prefix/{prefix}")
    @Operation(summary = "Get payments by reference prefix", 
               description = "Retrieve worker payments by request reference number prefix")
    public ResponseEntity<List<WorkerPayment>> getByReferencePrefix(@PathVariable String prefix) {
        List<WorkerPayment> payments = service.findByRequestReferencePrefix(prefix);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/by-date-range")
    @Operation(summary = "Get payments by date range", 
               description = "Retrieve worker payments within a specific date range")
    public ResponseEntity<Map<String, Object>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResult<WorkerPayment> result = service.findByDateRange(startDate, endDate, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", result.getContent());
        response.put("dateRange", Map.of("startDate", startDate, "endDate", endDate));
        response.put("pagination", Map.of(
            "page", result.getPage(),
            "size", result.getSize(),
            "totalElements", result.getTotalElements(),
            "totalPages", result.getTotalPages()
        ));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status-counts/{fileId}")
    @Operation(summary = "Get status counts by file ID", 
               description = "Get aggregated status counts for payments in a specific file")
    public ResponseEntity<Map<String, Long>> getStatusCounts(@PathVariable String fileId) {
        Map<String, Long> statusCounts = service.getStatusCountsByFileId(fileId);
        return ResponseEntity.ok(statusCounts);
    }

    @GetMapping("/summary/{fileId}")
    @Operation(summary = "Get payment summary by file ID", 
               description = "Get summary statistics for payments in a specific file")
    public ResponseEntity<Map<String, Object>> getPaymentSummary(@PathVariable String fileId) {
        Map<String, Object> summary = service.getPaymentSummary(fileId);
        return ResponseEntity.ok(summary);
    }

    // ===========================================
    // WRITE OPERATIONS - Using JPA Repository  
    // ===========================================

    @PostMapping
    @Operation(summary = "Create worker payment", 
               description = "Create a new worker payment using JPA for transaction consistency")
    public ResponseEntity<WorkerPayment> create(@Valid @RequestBody WorkerPayment workerPayment) {
        WorkerPayment created = service.create(workerPayment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk create worker payments", 
               description = "Create multiple worker payments in a single transaction using JPA")
    public ResponseEntity<Map<String, Object>> createBulk(@Valid @RequestBody List<WorkerPayment> workerPayments) {
        List<WorkerPayment> created = service.createBulk(workerPayments);
        
        Map<String, Object> response = new HashMap<>();
        response.put("created", created);
        response.put("count", created.size());
        response.put("message", "Successfully created " + created.size() + " worker payments");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update worker payment", 
               description = "Update an existing worker payment using JPA for transaction consistency")
    public ResponseEntity<WorkerPayment> update(@PathVariable Long id, 
                                               @Valid @RequestBody WorkerPayment workerPayment) {
        WorkerPayment updated = service.update(id, workerPayment);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/bulk")
    @Operation(summary = "Bulk update worker payments", 
               description = "Update multiple worker payments in a single transaction using JPA")
    public ResponseEntity<Map<String, Object>> updateBulk(@Valid @RequestBody List<WorkerPayment> workerPayments) {
        List<WorkerPayment> updated = service.updateBulk(workerPayments);
        
        Map<String, Object> response = new HashMap<>();
        response.put("updated", updated);
        response.put("count", updated.size());
        response.put("message", "Successfully updated " + updated.size() + " worker payments");
        
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update payment status", 
               description = "Update only the status of a worker payment")
    public ResponseEntity<WorkerPayment> updateStatus(@PathVariable Long id, 
                                                     @RequestParam String status) {
        WorkerPayment updated = service.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete worker payment", 
               description = "Delete a worker payment using JPA for transaction consistency")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        service.delete(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Worker payment deleted successfully");
        response.put("id", id.toString());
        
        return ResponseEntity.ok(response);
    }

    // ===========================================
    // UTILITY ENDPOINTS
    // ===========================================

    @GetMapping("/{id}/exists")
    @Operation(summary = "Check if payment exists", 
               description = "Check if a worker payment exists by ID")
    public ResponseEntity<Map<String, Boolean>> exists(@PathVariable Long id) {
        boolean exists = service.existsById(id);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    @GetMapping("/count")
    @Operation(summary = "Count payments with filters", 
               description = "Get count of worker payments matching the specified filters")
    public ResponseEntity<Map<String, Long>> count(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String receiptNumber,
            @RequestParam(required = false) String fileId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        long count = service.countWithFilters(status, receiptNumber, fileId, startDate, endDate);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
