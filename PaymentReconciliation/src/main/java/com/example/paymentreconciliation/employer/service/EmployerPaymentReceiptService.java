package com.example.paymentreconciliation.employer.service;

import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.employer.dao.EmployerPaymentReceiptRepository;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import com.example.paymentreconciliation.worker.dao.WorkerPaymentReceiptRepository;
import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
import com.example.paymentreconciliation.worker.service.WorkerPaymentService;
import com.example.paymentreconciliation.board.service.BoardReceiptService;
import com.example.paymentreconciliation.board.entity.BoardReceipt;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class EmployerPaymentReceiptService {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(EmployerPaymentReceiptService.class);
    
    private final EmployerPaymentReceiptRepository repository;
    private final WorkerPaymentReceiptRepository workerReceiptRepository;
    private final WorkerPaymentService workerPaymentService;
    private final BoardReceiptService boardReceiptService;

    public EmployerPaymentReceiptService(EmployerPaymentReceiptRepository repository, 
                                       WorkerPaymentReceiptRepository workerReceiptRepository,
                                       WorkerPaymentService workerPaymentService,
                                       BoardReceiptService boardReceiptService) {
        this.repository = repository;
        this.workerReceiptRepository = workerReceiptRepository;
        this.workerPaymentService = workerPaymentService;
        this.boardReceiptService = boardReceiptService;
    }

    @Transactional(readOnly = true)
    public List<WorkerPaymentReceipt> getAvailableReceipts() {
        log.info("Retrieving worker receipts available for employer validation");
        return workerReceiptRepository.findByStatus("GENERATED");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAvailableReceiptsWithFilters(int page, int size, String status, 
                                                              String singleDate, String startDate, String endDate) {
        log.info("Retrieving paginated worker receipts - page: {}, size: {}, status: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, singleDate, startDate, endDate);
        
        // Create pageable object
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // Default status to GENERATED if not provided
        String filterStatus = (status != null && !status.trim().isEmpty()) ? status : "GENERATED";
        
        Page<WorkerPaymentReceipt> receiptsPage;
        
        // Handle date filtering
        if (singleDate != null && !singleDate.trim().isEmpty()) {
            // Single date filter
            LocalDate date = LocalDate.parse(singleDate);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);
            receiptsPage = workerReceiptRepository.findByStatusAndCreatedAtBetween(filterStatus, startOfDay, endOfDay, pageable);
            
        } else if (startDate != null && !startDate.trim().isEmpty() && endDate != null && !endDate.trim().isEmpty()) {
            // Date range filter
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            LocalDateTime startDateTime = start.atStartOfDay();
            LocalDateTime endDateTime = end.atTime(23, 59, 59);
            receiptsPage = workerReceiptRepository.findByStatusAndCreatedAtBetween(filterStatus, startDateTime, endDateTime, pageable);
            
        } else {
            // No date filter, just status
            receiptsPage = workerReceiptRepository.findByStatus(filterStatus, pageable);
        }
        
        // Create response
        Map<String, Object> response = new HashMap<>();
        response.put("content", receiptsPage.getContent());
        response.put("page", receiptsPage.getNumber());
        response.put("size", receiptsPage.getSize());
        response.put("totalElements", receiptsPage.getTotalElements());
        response.put("totalPages", receiptsPage.getTotalPages());
        response.put("first", receiptsPage.isFirst());
        response.put("last", receiptsPage.isLast());
        response.put("empty", receiptsPage.isEmpty());
        
        log.info("Found {} worker receipts (page {} of {})", receiptsPage.getTotalElements(), 
                receiptsPage.getNumber() + 1, receiptsPage.getTotalPages());
        
        return response;
    }

    public EmployerPaymentReceipt validateAndCreateEmployerReceipt(String workerReceiptNumber, 
                                                                 String transactionReference, 
                                                                 String validatedBy) {
        log.info("Validating employer receipt for worker receipt: {} with txn ref: {}", 
                workerReceiptNumber, transactionReference);
        
        // Find the worker receipt
        Optional<WorkerPaymentReceipt> workerReceiptOpt = workerReceiptRepository.findByReceiptNumber(workerReceiptNumber);
        if (workerReceiptOpt.isEmpty()) {
            throw new RuntimeException("Worker receipt not found: " + workerReceiptNumber);
        }
        
        WorkerPaymentReceipt workerReceipt = workerReceiptOpt.get();
        
        // Check if employer receipt exists (should be PENDING)
        Optional<EmployerPaymentReceipt> existingOpt = repository.findByWorkerReceiptNumber(workerReceiptNumber);
        EmployerPaymentReceipt employerReceipt;
        
        if (existingOpt.isPresent()) {
            employerReceipt = existingOpt.get();
            // Check if already validated
            if ("VALIDATED".equals(employerReceipt.getStatus())) {
                throw new RuntimeException("Worker receipt already validated: " + workerReceiptNumber);
            }
            // Update existing PENDING receipt to SEND TO BOARD
            employerReceipt.setTransactionReference(transactionReference);
            employerReceipt.setValidatedBy(validatedBy);
            employerReceipt.setValidatedAt(LocalDateTime.now());
            employerReceipt.setStatus("SEND TO BOARD");
        } else {
            // Create new employer receipt (fallback if auto-creation failed)
            employerReceipt = new EmployerPaymentReceipt();
            employerReceipt.setEmployerReceiptNumber(generateEmployerReceiptNumber());
            employerReceipt.setWorkerReceiptNumber(workerReceiptNumber);
            employerReceipt.setTransactionReference(transactionReference);
            employerReceipt.setValidatedBy(validatedBy);
            employerReceipt.setValidatedAt(LocalDateTime.now());
            employerReceipt.setTotalRecords(workerReceipt.getTotalRecords());
            employerReceipt.setTotalAmount(workerReceipt.getTotalAmount());
            employerReceipt.setStatus("SEND TO BOARD");
        }
        
        // Save employer receipt
        EmployerPaymentReceipt savedReceipt = repository.save(employerReceipt);
        
        // Create board receipt with PENDING status
        try {
            BoardReceipt boardReceipt = boardReceiptService.createFromEmployerReceipt(savedReceipt, validatedBy);
            log.info("Created board receipt {} for employer receipt {}", 
                    boardReceipt.getBoardRef(), savedReceipt.getEmployerReceiptNumber());
        } catch (Exception e) {
            log.error("Failed to create board receipt for employer receipt {}", 
                    savedReceipt.getEmployerReceiptNumber(), e);
        }
        
        // Update worker receipt status
        workerReceipt.setStatus("VALIDATED");
        workerReceiptRepository.save(workerReceipt);
        
        // Update all worker payments with this receipt number to PAYMENT_INITIATED
        List<WorkerPayment> workerPayments = workerPaymentService.findByReceiptNumber(workerReceiptNumber);
        for (WorkerPayment payment : workerPayments) {
            if (payment.getStatus() == WorkerPaymentStatus.PAYMENT_REQUESTED) {
                payment.setStatus(WorkerPaymentStatus.PAYMENT_INITIATED);
                workerPaymentService.save(payment);
            }
        }
        
        log.info("Validated employer receipt {} for worker receipt {}, created board receipt, and updated {} worker payments to PAYMENT_INITIATED", 
                savedReceipt.getEmployerReceiptNumber(), workerReceiptNumber, workerPayments.size());
        
        return savedReceipt;
    }
    
    @Transactional(readOnly = true)
    public List<EmployerPaymentReceipt> findByStatus(String status) {
        log.info("Finding employer receipts with status: {}", status);
        return repository.findByStatus(status);
    }
    
    @Transactional(readOnly = true)
    public Optional<EmployerPaymentReceipt> findByWorkerReceiptNumber(String workerReceiptNumber) {
        log.info("Finding employer receipt for worker receipt: {}", workerReceiptNumber);
        return repository.findByWorkerReceiptNumber(workerReceiptNumber);
    }
    
    public Map<String, Object> getAllEmployerReceiptsWithFilters(int page, int size, String status, String empRef,
                                                                String singleDate, String startDate, String endDate) {
        log.info("Fetching employer receipts with filters - page: {}, size: {}, status: {}, empRef: {}, singleDate: {}, startDate: {}, endDate: {}", 
                page, size, status, empRef, singleDate, startDate, endDate);
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("validatedAt").descending());
            Page<EmployerPaymentReceipt> receiptsPage;
            
            // Parse dates if provided
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            
            if (singleDate != null && !singleDate.trim().isEmpty()) {
                LocalDate date = LocalDate.parse(singleDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                startDateTime = date.atStartOfDay();
                endDateTime = date.atTime(23, 59, 59);
            } else if (startDate != null && endDate != null && 
                      !startDate.trim().isEmpty() && !endDate.trim().isEmpty()) {
                LocalDate start = LocalDate.parse(startDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                LocalDate end = LocalDate.parse(endDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                startDateTime = start.atStartOfDay();
                endDateTime = end.atTime(23, 59, 59);
            }
            
            // Check if empRef filter is provided
            boolean hasEmpRef = empRef != null && !empRef.trim().isEmpty();
            boolean hasStatus = status != null && !status.trim().isEmpty();
            boolean hasDateRange = startDateTime != null && endDateTime != null;
            
            // Apply filters based on combinations
            if (hasEmpRef && hasStatus && hasDateRange) {
                receiptsPage = repository.findByEmployerReceiptNumberAndStatusAndValidatedAtBetween(empRef, status, startDateTime, endDateTime, pageable);
            } else if (hasEmpRef && hasStatus) {
                receiptsPage = repository.findByEmployerReceiptNumberAndStatus(empRef, status, pageable);
            } else if (hasEmpRef && hasDateRange) {
                receiptsPage = repository.findByEmployerReceiptNumberAndValidatedAtBetween(empRef, startDateTime, endDateTime, pageable);
            } else if (hasEmpRef) {
                receiptsPage = repository.findByEmployerReceiptNumber(empRef, pageable);
            } else if (hasStatus && hasDateRange) {
                receiptsPage = repository.findByStatusAndValidatedAtBetween(status, startDateTime, endDateTime, pageable);
            } else if (hasStatus) {
                receiptsPage = repository.findByStatus(status, pageable);
            } else if (hasDateRange) {
                receiptsPage = repository.findByValidatedAtBetween(startDateTime, endDateTime, pageable);
            } else {
                receiptsPage = repository.findAll(pageable);
            }
            
            // Build response
            Map<String, Object> response = new HashMap<>();
            response.put("content", receiptsPage.getContent());
            response.put("totalElements", receiptsPage.getTotalElements());
            response.put("totalPages", receiptsPage.getTotalPages());
            response.put("currentPage", receiptsPage.getNumber());
            response.put("pageSize", receiptsPage.getSize());
            response.put("hasNext", receiptsPage.hasNext());
            response.put("hasPrevious", receiptsPage.hasPrevious());
            
            log.info("Found {} employer receipts (page {}/{})", 
                    receiptsPage.getTotalElements(), receiptsPage.getNumber(), receiptsPage.getTotalPages());
            
            return response;
            
        } catch (Exception e) {
            log.error("Error fetching employer receipts with filters", e);
            throw new RuntimeException("Failed to fetch employer receipts: " + e.getMessage());
        }
    }

    public EmployerPaymentReceipt createPendingEmployerReceipt(WorkerPaymentReceipt workerReceipt) {
        log.info("Creating pending employer receipt for worker receipt: {}", workerReceipt.getReceiptNumber());
        
        // Check if already exists
        Optional<EmployerPaymentReceipt> existingOpt = repository.findByWorkerReceiptNumber(workerReceipt.getReceiptNumber());
        if (existingOpt.isPresent()) {
            log.info("Employer receipt already exists for worker receipt: {}", workerReceipt.getReceiptNumber());
            return existingOpt.get();
        }
        
        // Create employer receipt with PENDING status
        EmployerPaymentReceipt employerReceipt = new EmployerPaymentReceipt();
        employerReceipt.setEmployerReceiptNumber(generateEmployerReceiptNumber());
        employerReceipt.setWorkerReceiptNumber(workerReceipt.getReceiptNumber());
        employerReceipt.setTransactionReference(""); // Will be filled during validation
        employerReceipt.setValidatedBy(""); // Will be filled during validation
        employerReceipt.setValidatedAt(LocalDateTime.now()); // Creation time for now
        employerReceipt.setTotalRecords(workerReceipt.getTotalRecords());
        employerReceipt.setTotalAmount(workerReceipt.getTotalAmount());
        employerReceipt.setStatus("PENDING");
        
        // Save employer receipt
        EmployerPaymentReceipt savedReceipt = repository.save(employerReceipt);
        
        log.info("Created pending employer receipt {} for worker receipt {}", 
                savedReceipt.getEmployerReceiptNumber(), workerReceipt.getReceiptNumber());
        
        return savedReceipt;
    }
    
    private String generateEmployerReceiptNumber() {
        // Generate employer receipt number in format: EMP-YYYYMMDD-HHMMSS-XXX
        LocalDateTime now = LocalDateTime.now();
        String dateTime = now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String sequence = String.format("%03d", (System.currentTimeMillis() % 1000));
        
        return "EMP-" + dateTime + "-" + sequence;
    }
}
