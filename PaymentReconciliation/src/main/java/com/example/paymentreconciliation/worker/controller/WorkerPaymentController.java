package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;

import com.example.paymentreconciliation.worker.service.WorkerPaymentService;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.web.bind.annotation.DeleteMapping;
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
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/worker-payments")
@Tag(name = "Worker Payment Management", description = "APIs for worker payment CRUD operations and filtering")
public class WorkerPaymentController {

    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentController.class);

    private final WorkerPaymentService service;

    public WorkerPaymentController(WorkerPaymentService service) {
        this.service = service;
    }

    @PostMapping
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
            @Parameter(description = "Start date for filtering (YYYY-MM-DD)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date for filtering (YYYY-MM-DD)") @RequestParam(required = false) String endDate,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Fetching worker payments with filters - status: {}, receiptNumber: {}, dateRange: {} to {}, page: {}, size: {}", 
                status, receiptNumber, startDate, endDate, page, size);
        
        try {
            // Parse date parameters
            java.time.LocalDateTime startDateTime = null;
            java.time.LocalDateTime endDateTime = null;
            
            if (startDate != null && !startDate.trim().isEmpty()) {
                startDateTime = java.time.LocalDate.parse(startDate.trim()).atStartOfDay();
            }
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                endDateTime = java.time.LocalDate.parse(endDate.trim()).atTime(23, 59, 59);
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
    public ResponseEntity<WorkerPayment> update(@PathVariable("id") Long id, @RequestBody WorkerPayment workerPayment) {
        log.info("Updating worker payment id={}", id);
        return ResponseEntity.ok(service.update(id, workerPayment));
    }

    @DeleteMapping("/{id}")
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
            @RequestParam(defaultValue = "asc") String sortDir) {
        
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
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching payments by uploadedFileRef: {}", uploadedFileRef, e);
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
