package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
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
               description = "Retrieve worker payments with optional filtering by status and receipt number, with pagination")
    public ResponseEntity<Page<WorkerPayment>> findAll(
            @Parameter(description = "Payment status filter") @RequestParam(required = false) WorkerPaymentStatus status,
            @Parameter(description = "Receipt number filter") @RequestParam(required = false) String receiptNumber,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Fetching worker payments with filters - status: {}, receiptNumber: {}, page: {}, size: {}", 
                status, receiptNumber, page, size);
        
        // Create sort object
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        // Create pageable object
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // If no filters are provided, return all payments paginated
        if (status == null && receiptNumber == null) {
            return ResponseEntity.ok(service.findAllPaginated(pageable));
        }
        
        // If only status filter is provided
        if (status != null && receiptNumber == null) {
            return ResponseEntity.ok(service.findByStatusPaginated(status, pageable));
        }
        
        // If only receipt number filter is provided
        if (status == null && receiptNumber != null) {
            return ResponseEntity.ok(service.findByReceiptNumber(receiptNumber, pageable));
        }
        
        // If both status and receipt number filters are provided
        return ResponseEntity.ok(service.findByStatusAndReceiptNumber(status, receiptNumber, pageable));
    }

    @GetMapping("/list")
    @Operation(summary = "Get all worker payments as list", description = "Retrieve all worker payments as a simple list (no pagination)")
    public ResponseEntity<List<WorkerPayment>> findAllAsList() {
        log.info("Fetching all worker payments as list");
        return ResponseEntity.ok(service.findAll());
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
}
