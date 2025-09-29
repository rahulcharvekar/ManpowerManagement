package com.example.paymentreconciliation.worker.controller;

import com.example.paymentreconciliation.worker.service.WorkerPaymentFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;
import java.util.List;
import java.util.HashMap;
import com.example.paymentreconciliation.worker.entity.WorkerPayment;

@RestController
@RequestMapping("/api/worker-payments/file")
@Tag(name = "Worker Payment File Processing", description = "APIs for worker payment file upload, validation, and processing")
public class WorkerPaymentFileController {

    @Autowired
    private WorkerPaymentFileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload worker payment file", description = "Upload CSV, XLS, or XLSX file containing worker payment data")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // File type check
            String filename = file.getOriginalFilename();
            if (filename == null || !(filename.toLowerCase().endsWith(".csv") || filename.toLowerCase().endsWith(".xls") || filename.toLowerCase().endsWith(".xlsx"))) {
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
            
            // Handle file upload
            System.out.println("About to call fileService.handleFileUpload()");
            Map<String, Object> result = fileService.handleFileUpload(file);
            System.out.println("Received result from service: " + result);
            
            // Check if the service returned an error
            if (result.containsKey("error")) {
                System.out.println("Service returned error: " + result.get("error"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "failed",
                    "error", result.get("error"),
                    "message", "File upload failed during processing"
                ));
            }
            
            // Add success status to the response
            result.put("status", "success");
            System.out.println("About to return success response: " + result);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            // Better error handling - get meaningful error message
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                errorMessage = e.getClass().getSimpleName() + " occurred";
            }
            
            // Log the full stack trace for debugging
            System.err.println("File upload error: " + errorMessage);
            e.printStackTrace();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "failed",
                "error", "Unexpected error during file upload: " + errorMessage,
                "message", "File upload failed due to unexpected error",
                "exceptionType", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/validate/{fileId}")
    public ResponseEntity<?> validateFile(@PathVariable String fileId) {
        return ResponseEntity.ok(fileService.validateFileRecords(fileId));
    }

    @GetMapping("/results/{fileId}")
    public ResponseEntity<?> getValidationResults(@PathVariable String fileId) {
        return ResponseEntity.ok(fileService.getValidationResults(fileId));
    }

    @GetMapping("/validate/{fileId}/details")
    @Operation(summary = "Get paginated validation details", description = "Returns paginated worker payment details with validation status for a file")
    public ResponseEntity<?> getValidationDetails(
            @Parameter(description = "File ID from upload") @PathVariable String fileId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Filter by status") @RequestParam(required = false) String status) {
        return ResponseEntity.ok(fileService.getValidationDetailsPaginated(fileId, page, size, status));
    }

    @PostMapping("/process/{fileId}")
    public ResponseEntity<?> processValidRecords(@PathVariable String fileId) {
        return ResponseEntity.ok(fileService.processValidRecords(fileId));
    }

    @PostMapping("/reupload/{fileId}")
    public ResponseEntity<?> reuploadFailedRecords(@PathVariable String fileId, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(fileService.reuploadFailedRecords(fileId, file));
    }

    @GetMapping("/status/{fileId}")
    @Operation(summary = "Get file processing status summary", description = "Returns status breakdown by payment record status")
    public ResponseEntity<?> getFileStatusSummary(@Parameter(description = "File ID from upload") @PathVariable String fileId) {
        return ResponseEntity.ok(fileService.getFileStatusSummary(fileId));
    }

    @GetMapping("/receipt/{fileId}")
    @Operation(summary = "Get receipt details for processed payments", description = "Returns receipt information and payment details for processed records")
    public ResponseEntity<?> getReceiptDetails(@Parameter(description = "File ID from upload") @PathVariable String fileId) {
        return ResponseEntity.ok(fileService.getReceiptDetails(fileId));
    }

    @GetMapping("/debug/{fileId}")
    @Operation(summary = "Debug endpoint - check data for fileId", description = "Returns debug information about payments for a given fileId")
    public ResponseEntity<?> debugFileData(@Parameter(description = "File ID from upload") @PathVariable String fileId) {
        try {
            // Check if any worker payments exist for this fileId
            List<WorkerPayment> payments = fileService.getWorkerPaymentsByFileId(fileId);
            
            Map<String, Object> debugInfo = new HashMap<>();
            debugInfo.put("fileId", fileId);
            debugInfo.put("totalPayments", payments.size());
            
            if (!payments.isEmpty()) {
                debugInfo.put("samplePayment", Map.of(
                    "id", payments.get(0).getId(),
                    "fileId", payments.get(0).getFileId(),
                    "workerRef", payments.get(0).getWorkerRef(),
                    "status", payments.get(0).getStatus().name()
                ));
                
                // Count by status
                Map<String, Long> statusCounts = payments.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                        p -> p.getStatus().name(),
                        java.util.stream.Collectors.counting()
                    ));
                debugInfo.put("statusCounts", statusCounts);
            }
            
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "error", e.getMessage(),
                "fileId", fileId
            ));
        }
    }
}
