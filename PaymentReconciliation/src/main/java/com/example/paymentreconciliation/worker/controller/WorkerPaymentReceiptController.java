package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import com.example.paymentreconciliation.worker.service.WorkerPaymentReceiptService;
import com.example.paymentreconciliation.worker.service.WorkerPaymentService;
import com.example.paymentreconciliation.employer.service.EmployerPaymentReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker/receipts")
@Tag(name = "Worker Receipt Management", description = "APIs for worker receipt management and tracking")
public class WorkerPaymentReceiptController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentReceiptController.class);
    
    private final WorkerPaymentReceiptService service;
    
    @Autowired
    private EmployerPaymentReceiptService employerReceiptService;
    
    @Autowired
    private WorkerPaymentService workerPaymentService;

    public WorkerPaymentReceiptController(WorkerPaymentReceiptService service) {
        this.service = service;
    }

    @GetMapping("/all")
    @Operation(summary = "Get all worker receipts with pagination and filtering", 
               description = "Returns paginated worker receipts with optional filters for status and date range")
    public ResponseEntity<?> getAllWorkerReceipts(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Receipt status filter", example = "GENERATED")
            @RequestParam(required = false) String status,
            @Parameter(description = "Single date filter (YYYY-MM-DD)", example = "2024-01-15")
            @RequestParam(required = false) String singleDate,
            @Parameter(description = "Start date for range filter (YYYY-MM-DD)", example = "2024-01-01")
            @RequestParam(required = false) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) String endDate,
            @Parameter(description = "Sort field", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        log.info("Fetching worker receipts with filters - page: {}, size: {}, status: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, singleDate, startDate, endDate);
        
        try {
            // Create pageable with sorting
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<WorkerPaymentReceipt> receiptsPage;
            
            // Handle date filtering
            if (singleDate != null && !singleDate.trim().isEmpty()) {
                LocalDate date = LocalDate.parse(singleDate);
                LocalDateTime startDateTime = date.atStartOfDay();
                LocalDateTime endDateTime = date.plusDays(1).atStartOfDay().minusNanos(1);
                
                if (status != null && !status.trim().isEmpty()) {
                    receiptsPage = service.findByStatusAndDateRangePaginated(status.trim().toUpperCase(), 
                            startDateTime, endDateTime, pageable);
                } else {
                    receiptsPage = service.findByDateRangePaginated(startDateTime, endDateTime, pageable);
                }
            } else if (startDate != null && endDate != null && 
                      !startDate.trim().isEmpty() && !endDate.trim().isEmpty()) {
                LocalDateTime startDateTime = LocalDate.parse(startDate).atStartOfDay();
                LocalDateTime endDateTime = LocalDate.parse(endDate).plusDays(1).atStartOfDay().minusNanos(1);
                
                if (status != null && !status.trim().isEmpty()) {
                    receiptsPage = service.findByStatusAndDateRangePaginated(status.trim().toUpperCase(), 
                            startDateTime, endDateTime, pageable);
                } else {
                    receiptsPage = service.findByDateRangePaginated(startDateTime, endDateTime, pageable);
                }
            } else if (status != null && !status.trim().isEmpty()) {
                receiptsPage = service.findByStatusPaginated(status.trim().toUpperCase(), pageable);
            } else {
                receiptsPage = service.findAllPaginated(pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("receipts", receiptsPage.getContent());
            response.put("totalElements", receiptsPage.getTotalElements());
            response.put("totalPages", receiptsPage.getTotalPages());
            response.put("currentPage", receiptsPage.getNumber());
            response.put("pageSize", receiptsPage.getSize());
            response.put("hasNext", receiptsPage.hasNext());
            response.put("hasPrevious", receiptsPage.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (DateTimeParseException e) {
            log.error("Invalid date format provided", e);
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid date format. Use YYYY-MM-DD"));
        } catch (Exception e) {
            log.error("Error fetching worker receipts", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get worker receipts by status", 
               description = "Returns all worker receipts with the specified status")
    public ResponseEntity<List<WorkerPaymentReceipt>> getReceiptsByStatus(
            @Parameter(description = "Receipt status") 
            @PathVariable String status) {
        log.info("Fetching worker receipts with status: {}", status);
        
        try {
            List<WorkerPaymentReceipt> receipts = service.findByStatus(status.toUpperCase());
            return ResponseEntity.ok(receipts);
        } catch (Exception e) {
            log.error("Error fetching receipts by status: {}", status, e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{receiptNumber}")
    @Operation(summary = "Get worker receipt by receipt number", 
               description = "Returns worker receipt details for a specific receipt number")
    public ResponseEntity<?> getByReceiptNumber(
            @Parameter(description = "Worker receipt number") 
            @PathVariable String receiptNumber) {
        log.info("Fetching worker receipt: {}", receiptNumber);
        
        try {
            return service.findByReceiptNumber(receiptNumber)
                    .map(receipt -> ResponseEntity.ok(receipt))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching receipt: {}", receiptNumber, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{receiptNumber}/status")
    @Operation(summary = "Update worker receipt status", 
               description = "Updates the status of a worker receipt")
    public ResponseEntity<?> updateReceiptStatus(
            @Parameter(description = "Worker receipt number") 
            @PathVariable String receiptNumber,
            @RequestBody StatusUpdateRequest request) {
        log.info("Updating status of worker receipt {} to {}", receiptNumber, request.getStatus());
        
        try {
            WorkerPaymentReceipt updatedReceipt = service.updateStatus(receiptNumber, request.getStatus().toUpperCase());
            
            return ResponseEntity.ok(Map.of(
                "message", "Receipt status updated successfully",
                "receiptNumber", updatedReceipt.getReceiptNumber(),
                "newStatus", updatedReceipt.getStatus(),
                "totalAmount", updatedReceipt.getTotalAmount(),
                "totalRecords", updatedReceipt.getTotalRecords()
            ));
            
        } catch (Exception e) {
            log.error("Error updating receipt status: {}", receiptNumber, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/summary")
    @Operation(summary = "Get worker receipts summary", 
               description = "Returns summary statistics of worker receipts by status")
    public ResponseEntity<?> getReceiptsSummary() {
        log.info("Fetching worker receipts summary");
        
        try {
            List<WorkerPaymentReceipt> allReceipts = service.findAll();
            
            Map<String, Integer> statusCounts = new HashMap<>();
            Map<String, java.math.BigDecimal> statusAmounts = new HashMap<>();
            
            // Initialize common statuses
            String[] statuses = {"GENERATED", "PAYMENT_PROCESSED", "PAYMENT_RECONCILED", "ERROR"};
            for (String status : statuses) {
                statusCounts.put(status, 0);
                statusAmounts.put(status, java.math.BigDecimal.ZERO);
            }
            
            // Count by status
            for (WorkerPaymentReceipt receipt : allReceipts) {
                String status = receipt.getStatus();
                statusCounts.put(status, statusCounts.getOrDefault(status, 0) + 1);
                statusAmounts.put(status, statusAmounts.getOrDefault(status, java.math.BigDecimal.ZERO)
                        .add(receipt.getTotalAmount()));
            }
            
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalReceipts", allReceipts.size());
            summary.put("statusCounts", statusCounts);
            summary.put("statusAmounts", statusAmounts);
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            log.error("Error fetching receipts summary", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{receiptNumber}/send-to-employer")
    @Operation(summary = "Send worker receipt to employer for validation", 
               description = "Creates a pending employer receipt for manual review and validation")
    public ResponseEntity<?> sendReceiptToEmployer(
            @Parameter(description = "Worker receipt number") 
            @PathVariable String receiptNumber) {
        log.info("Sending worker receipt {} to employer for validation", receiptNumber);
        
        try {
            // Get the worker receipt
            java.util.Optional<WorkerPaymentReceipt> workerReceiptOpt = service.findByReceiptNumber(receiptNumber);
            
            if (workerReceiptOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Worker receipt not found",
                    "receiptNumber", receiptNumber
                ));
            }
            
            WorkerPaymentReceipt workerReceipt = workerReceiptOpt.get();
            
            // Create employer receipt manually using injected service
            com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt employerReceipt = 
                employerReceiptService.createPendingEmployerReceipt(workerReceipt);
            
            // Update worker receipt status to PAYMENT_INITIATED
            service.updateStatus(receiptNumber, "PAYMENT_INITIATED");
            log.info("Updated worker receipt {} status to PAYMENT_INITIATED", receiptNumber);
            
            // Update all related worker payment records to PAYMENT_INITIATED
            java.util.List<com.example.paymentreconciliation.worker.entity.WorkerPayment> workerPayments = 
                workerPaymentService.findByReceiptNumber(receiptNumber);
            
            int updatedPayments = 0;
            for (com.example.paymentreconciliation.worker.entity.WorkerPayment payment : workerPayments) {
                payment.setStatus("PAYMENT_INITIATED");
                workerPaymentService.save(payment);
                updatedPayments++;
            }
            log.info("Updated {} worker payment records to PAYMENT_INITIATED for receipt {}", updatedPayments, receiptNumber);
            
            return ResponseEntity.ok(Map.of(
                "message", "Worker receipt sent to employer successfully",
                "workerReceiptNumber", receiptNumber,
                "employerReceiptNumber", employerReceipt.getEmployerReceiptNumber(),
                "workerReceiptStatus", "PAYMENT_INITIATED",
                "employerReceiptStatus", "PENDING",
                "totalRecords", employerReceipt.getTotalRecords(),
                "totalAmount", employerReceipt.getTotalAmount(),
                "updatedPaymentRecords", updatedPayments
            ));
            
        } catch (Exception e) {
            log.error("Error sending worker receipt {} to employer", receiptNumber, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to send receipt to employer: " + e.getMessage(),
                "receiptNumber", receiptNumber
            ));
        }
    }

    // Request DTO class
    public static class StatusUpdateRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
