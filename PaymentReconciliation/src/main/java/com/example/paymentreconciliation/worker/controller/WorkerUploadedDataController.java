package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.entity.WorkerUploadedData;
import com.example.paymentreconciliation.worker.service.WorkerUploadedDataService;
import com.example.paymentreconciliation.worker.service.WorkerPaymentFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/worker/uploaded-data")
@Tag(name = "Worker Uploaded Data Management", description = "APIs for managing worker uploaded data validation and processing")
@SecurityRequirement(name = "Bearer Authentication")
public class WorkerUploadedDataController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerUploadedDataController.class);
    
    private final WorkerUploadedDataService service;
    
    @Autowired
    private WorkerPaymentFileService fileService;

    @Autowired
    private com.example.paymentreconciliation.common.service.PaginationSessionService paginationSessionService;

    public WorkerUploadedDataController(WorkerUploadedDataService service) {
        this.service = service;
    }

    // NEW: Secure paginated endpoint with mandatory date range filtering
    @PostMapping("/secure-paginated")
    @Operation(summary = "Get secure paginated uploaded data", 
               description = "Retrieve paginated uploaded data with MANDATORY date range filtering for security. " +
                           "Prevents unrestricted data access and implements tamper-proof pagination tokens.")
    @com.example.paymentreconciliation.common.annotation.SecurePagination
    public ResponseEntity<?> getSecurePaginatedUploadedData(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                description = "Secure pagination request with mandatory date range",
                required = true
            )
            @jakarta.validation.Valid @RequestBody 
            com.example.paymentreconciliation.common.dto.SecurePaginationRequest request) {
        
        log.info("Secure paginated request for uploaded data: {}", request);
        
        // Validate request using utility
        com.example.paymentreconciliation.common.util.SecurePaginationUtil.ValidationResult validation = 
            com.example.paymentreconciliation.common.util.SecurePaginationUtil.validatePaginationRequest(request);
        
        if (!validation.isValid()) {
            return ResponseEntity.badRequest().body(
                com.example.paymentreconciliation.common.util.SecurePaginationUtil.createErrorResponse(validation));
        }
        
        try {
            // Create secure pageable
            org.springframework.data.domain.Pageable pageable = 
                com.example.paymentreconciliation.common.util.SecurePaginationUtil.createSecurePageable(request);
            
            // Get paginated data with date filtering
            org.springframework.data.domain.Page<WorkerUploadedData> dataPage = 
                service.findByDateRangePaginated(validation.getStartDateTime(), validation.getEndDateTime(), pageable);
            
            // Create secure response with opaque tokens
            com.example.paymentreconciliation.common.dto.SecurePaginationResponse<WorkerUploadedData> response = 
                com.example.paymentreconciliation.common.util.SecurePaginationUtil.createSecureResponse(dataPage, request);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in secure paginated data retrieval", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to retrieve data: " + e.getMessage(),
                "timestamp", java.time.LocalDateTime.now()
            ));
        }
    }

    // Create an opaque pagination session to avoid exposing query params in URLs
    @PostMapping("/file/{fileId}/pagination-session")
    @Operation(summary = "Create pagination session", description = "Create an opaque pagination session token for subsequent paginated requests. Prevents tampering with query parameters in the URL.")
    public ResponseEntity<?> createPaginationSession(
            @Parameter(description = "File ID") @PathVariable String fileId,
            @RequestBody(required = false) PaginationSessionRequest request) {
        try {
            // Build a generic filters map to store server-side
            java.util.Map<String, String> filters = new java.util.HashMap<>();
            if (request != null) {
                if (request.getStatus() != null) filters.put("status", request.getStatus());
                if (request.getStartDate() != null) filters.put("startDate", request.getStartDate());
                if (request.getEndDate() != null) filters.put("endDate", request.getEndDate());
                if (request.getSortBy() != null) filters.put("sortBy", request.getSortBy());
                if (request.getSortDir() != null) filters.put("sortDir", request.getSortDir());
            }

            Long ttlMs = request != null ? request.getTtlMs() : null;
            Integer maxPageSize = request != null ? request.getMaxPageSize() : null;

            String token = paginationSessionService.createSession("workerUploadedData", fileId, filters, ttlMs, maxPageSize);

            com.example.paymentreconciliation.common.service.PaginationSessionService.PaginationSession s = paginationSessionService.getSession(token);
            long expiresInMs = s != null ? s.expiresAt.toEpochMilli() - java.time.Instant.now().toEpochMilli() : 0L;

            return ResponseEntity.ok(Map.of("paginationToken", token, "expiresInMs", expiresInMs));
        } catch (Exception e) {
            log.error("Error creating pagination session for fileId={}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload worker payment file", 
               description = "Upload CSV, XLS, or XLSX file containing worker payment data. Returns fileId for subsequent operations.")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // File type check
            String filename = file.getOriginalFilename();
            if (filename == null || !(filename.toLowerCase().endsWith(".csv") || 
                                    filename.toLowerCase().endsWith(".xls") || 
                                    filename.toLowerCase().endsWith(".xlsx"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "failed",
                    "error", "Only .csv, .xls, and .xlsx files are allowed.",
                    "message", "File upload failed due to unsupported file type"
                ));
            }
            
            // File size check (max 200MB)
            long maxSize = 200L * 1024 * 1024; // 200MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "failed",
                    "error", "File size exceeds 200MB limit.",
                    "message", "File upload failed due to size limit exceeded"
                ));
            }

            // Empty file check
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "failed",
                    "error", "Uploaded file is empty.",
                    "message", "File upload failed due to empty file"
                ));
            }

            Map<String, Object> result = fileService.handleFileUpload(file);
            
            if (result.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("File upload failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "failed",
                "error", "File upload failed: " + e.getMessage(),
                "message", "Internal server error during file upload"
            ));
        }
    }

    @GetMapping("/files/summaries")
    @Operation(summary = "Get paginated file summaries", 
               description = "Returns paginated list of all uploaded files with comprehensive summaries including validation counts and total amounts")
    public ResponseEntity<?> getPaginatedFileSummaries(
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filter by specific file ID", example = "123")
            @RequestParam(required = false) String fileId,
            @Parameter(description = "Filter by file status", example = "VALIDATED")
            @RequestParam(required = false) String status,
            @Parameter(description = "Start date for range filter (YYYY-MM-DD) - MANDATORY", example = "2024-01-01")
            @RequestParam(required = true) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) String endDate,
            @Parameter(description = "Sort field", example = "uploadDate")
            @RequestParam(defaultValue = "uploadDate") String sortBy,
            @Parameter(description = "Sort direction", example = "desc")
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Getting paginated file summaries - page: {}, size: {}, fileId: {}, status: {}, dateRange: {} to {}", 
                page, size, fileId, status, startDate, endDate);
        
        try {
            Map<String, Object> result = service.getPaginatedFileSummaries(
                page, size, fileId, status, startDate, endDate, sortBy, sortDir);
            
            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error getting paginated file summaries", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to get file summaries: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/file/{fileId}/summary")
    @Operation(summary = "Get comprehensive file summary", 
               description = "Returns comprehensive summary including file metadata, validation counts, and total amount for payment generation")
    public ResponseEntity<?> getComprehensiveFileSummary(
            @Parameter(description = "File ID") 
            @PathVariable String fileId) {
        log.info("Getting comprehensive summary for fileId: {}", fileId);
        
        try {
            Map<String, Object> summary = service.getComprehensiveFileSummary(fileId);
            
            if (summary.containsKey("error")) {
                return ResponseEntity.badRequest().body(summary);
            }
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error getting comprehensive summary for fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/file/{fileId}/validate")
    @Operation(summary = "Validate uploaded data", 
               description = "Validates all uploaded data for a specific file and updates uploaded file status")
    public ResponseEntity<?> validateUploadedData(
            @Parameter(description = "File ID") 
            @PathVariable String fileId) {
        log.info("Starting validation for fileId: {}", fileId);
        
        try {
            // Use the comprehensive validation from WorkerPaymentFileService
            // This handles both validation and uploaded file status updates
            Map<String, Object> result = fileService.validateFileRecords(fileId);
            
            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error validating uploaded data for fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/results/{fileId}")
    @Operation(summary = "Get uploaded data results with pagination and filtering", 
               description = "Returns paginated uploaded data results with optional status and date range filtering")
    public ResponseEntity<?> getValidationResults(
            @Parameter(description = "File ID") 
            @PathVariable String fileId,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Status filter", example = "VALIDATED")
            @RequestParam(required = false) String status,
            @Parameter(description = "Start date for range filter (YYYY-MM-DD) - MANDATORY", example = "2024-01-01")
            @RequestParam(required = true) String startDate,
            @Parameter(description = "End date for range filter (YYYY-MM-DD)", example = "2024-01-31")
            @RequestParam(required = false) String endDate,
            @Parameter(description = "Sort field", example = "rowNumber")
            @RequestParam(defaultValue = "rowNumber") String sortBy,
            @Parameter(description = "Sort direction", example = "asc")
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        try {
            Map<String, Object> result = fileService.getValidationResultsPaginated(
                fileId, page, size, status, startDate, endDate, sortBy, sortDir);
            
            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching validation results for fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to fetch validation results: " + e.getMessage(),
                "fileId", fileId
            ));
        }
    }

    // New endpoint: fetch paginated results using server-side session token (sent in POST body)
    @PostMapping("/results/{fileId}/by-session")
    @Operation(summary = "Get uploaded data results by session token", description = "Submit pagination token and page request in body to avoid exposing params in URL. Token enforces server-side filters and limits.")
    public ResponseEntity<?> getValidationResultsBySession(
            @Parameter(description = "File ID") @PathVariable String fileId,
            @RequestBody SessionedPageRequest pageRequest) {
        try {
            if (pageRequest == null || pageRequest.getPaginationToken() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "paginationToken is required in body"));
            }

            com.example.paymentreconciliation.common.service.PaginationSessionService.PaginationSession session = paginationSessionService.getSession(pageRequest.getPaginationToken());
            if (session == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid or expired pagination token"));
            }

            // Ensure token fileId matches requested path
        if (!fileId.equals(session.resourceId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Token does not belong to requested fileId"));
            }

            int page = pageRequest.getPage() >= 0 ? pageRequest.getPage() : 0;
        int size = Math.min(pageRequest.getSize() <= 0 ? 20 : pageRequest.getSize(), session.maxPageSize);

        // Delegate to existing service but use session's filters
        String status = session.filters != null ? session.filters.get("status") : null;
        String startDate = session.filters != null ? session.filters.get("startDate") : null;
        String endDate = session.filters != null ? session.filters.get("endDate") : null;
        String sortBy = session.filters != null ? session.filters.getOrDefault("sortBy", "rowNumber") : "rowNumber";
        String sortDir = session.filters != null ? session.filters.getOrDefault("sortDir", "asc") : "asc";

        Map<String, Object> result = fileService.getValidationResultsPaginated(
            fileId, page, size, status, startDate, endDate, sortBy, sortDir);

            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching sessioned validation results for fileId={}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // DTOs for session endpoints
    public static class PaginationSessionRequest {
        private String status;
        private String startDate;
        private String endDate;
        private String sortBy;
        private String sortDir;
        private Long ttlMs; // dev-only override
        private Integer maxPageSize; // dev-only override

        // getters/setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getSortBy() { return sortBy; }
        public void setSortBy(String sortBy) { this.sortBy = sortBy; }
        public String getSortDir() { return sortDir; }
        public void setSortDir(String sortDir) { this.sortDir = sortDir; }
        public Long getTtlMs() { return ttlMs; }
        public void setTtlMs(Long ttlMs) { this.ttlMs = ttlMs; }
        public Integer getMaxPageSize() { return maxPageSize; }
        public void setMaxPageSize(Integer maxPageSize) { this.maxPageSize = maxPageSize; }
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

    @PostMapping("/file/{fileId}/generate-request")
    @Operation(summary = "Generate request for validated data", 
               description = "Generates request numbers for validated data (keeps data in same table)")
    public ResponseEntity<?> generateRequestForValidatedData(
            @Parameter(description = "File ID") 
            @PathVariable String fileId,
            @RequestBody(required = false) ProcessRequest request) {
        log.info("Generating request for validated data in fileId: {}", fileId);
        
        try {
            String uploadedFileRef = request != null && request.getUploadedFileRef() != null 
                ? request.getUploadedFileRef() : fileId;
            
            int processedCount = service.generateRequestForValidatedData(fileId, uploadedFileRef);
            
            // Get updated summary
            Map<String, Integer> summary = service.getFileStatusSummary(fileId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Request generated successfully",
                "fileId", fileId,
                "processedRecords", processedCount,
                "summary", summary
            ));
            
        } catch (Exception e) {
            log.error("Error generating request for validated data in fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/file/{fileId}/rejected")
    @Operation(summary = "Get rejected records", 
               description = "Returns rejected records for a specific file with pagination")
    public ResponseEntity<?> getRejectedRecords(
            @Parameter(description = "File ID") 
            @PathVariable String fileId,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching rejected records for fileId: {}", fileId);
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("rowNumber").ascending());
            Page<WorkerUploadedData> rejectedPage = service.findRejectedRecordsPaginated(fileId, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("rejectedRecords", rejectedPage.getContent());
            response.put("totalElements", rejectedPage.getTotalElements());
            response.put("totalPages", rejectedPage.getTotalPages());
            response.put("currentPage", rejectedPage.getNumber());
            response.put("pageSize", rejectedPage.getSize());
            response.put("hasNext", rejectedPage.hasNext());
            response.put("hasPrevious", rejectedPage.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching rejected records for fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/file/{fileId}")
    @Operation(summary = "Delete uploaded data", 
               description = "Deletes all uploaded data for a specific file")
    public ResponseEntity<?> deleteUploadedData(
            @Parameter(description = "File ID") 
            @PathVariable String fileId) {
        log.info("Deleting uploaded data for fileId: {}", fileId);
        
        try {
            service.deleteByFileId(fileId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Uploaded data deleted successfully",
                "fileId", fileId
            ));
            
        } catch (Exception e) {
            log.error("Error deleting uploaded data for fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/file/{fileId}/requests")
    @Operation(summary = "Get generated requests", 
               description = "Returns requests (records with REQUEST_GENERATED status) for a specific file with pagination")
    public ResponseEntity<?> getGeneratedRequests(
            @Parameter(description = "File ID") 
            @PathVariable String fileId,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching generated requests for fileId: {}", fileId);
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("receiptNumber", "rowNumber").ascending());
            Page<WorkerUploadedData> requestsPage = service.findRequestGeneratedRecordsPaginated(fileId, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("requests", requestsPage.getContent());
            response.put("totalElements", requestsPage.getTotalElements());
            response.put("totalPages", requestsPage.getTotalPages());
            response.put("currentPage", requestsPage.getNumber());
            response.put("pageSize", requestsPage.getSize());
            response.put("hasNext", requestsPage.hasNext());
            response.put("hasPrevious", requestsPage.hasPrevious());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching generated requests for fileId: {}", fileId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/receipt/{receiptNumber}")
    @Operation(summary = "Get request details by receipt number", 
               description = "Returns all records associated with a specific receipt number")
    public ResponseEntity<?> getRequestByReceiptNumber(
            @Parameter(description = "Receipt number") 
            @PathVariable String receiptNumber,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20") 
            @RequestParam(defaultValue = "20") int size) {
        log.info("Fetching request details for receiptNumber: {}", receiptNumber);
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("rowNumber").ascending());
            Page<WorkerUploadedData> requestPage = service.findByReceiptNumberPaginated(receiptNumber, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("requestDetails", requestPage.getContent());
            response.put("totalElements", requestPage.getTotalElements());
            response.put("totalPages", requestPage.getTotalPages());
            response.put("currentPage", requestPage.getNumber());
            response.put("pageSize", requestPage.getSize());
            response.put("hasNext", requestPage.hasNext());
            response.put("hasPrevious", requestPage.hasPrevious());
            response.put("receiptNumber", receiptNumber);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching request details for receiptNumber: {}", receiptNumber, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTO class
    public static class ProcessRequest {
        private String uploadedFileRef;

        public String getUploadedFileRef() {
            return uploadedFileRef;
        }

        public void setUploadedFileRef(String uploadedFileRef) {
            this.uploadedFileRef = uploadedFileRef;
        }
    }
}
