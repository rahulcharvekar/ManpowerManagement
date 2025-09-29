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

@RestController
@RequestMapping("/api/worker-payments/file")
@Tag(name = "Worker Payment File Processing", description = "APIs for worker payment file upload, validation, and processing")
public class WorkerPaymentFileController {

    @Autowired
    private WorkerPaymentFileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // File type check
        String filename = file.getOriginalFilename();
        if (filename == null || !(filename.toLowerCase().endsWith(".csv") || filename.toLowerCase().endsWith(".xls") || filename.toLowerCase().endsWith(".xlsx"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only .csv, .xls, and .xlsx files are allowed.");
        }
        // File size check (max 200MB)
        long maxSize = 200L * 1024 * 1024; // 200MB
        if (file.getSize() > maxSize) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File size exceeds 200MB limit.");
        }
        return ResponseEntity.ok(fileService.handleFileUpload(file));
    }

    @PostMapping("/validate/{fileId}")
    public ResponseEntity<?> validateFile(@PathVariable String fileId) {
        return ResponseEntity.ok(fileService.validateFileRecords(fileId));
    }

    @GetMapping("/results/{fileId}")
    public ResponseEntity<?> getValidationResults(@PathVariable String fileId) {
        return ResponseEntity.ok(fileService.getValidationResults(fileId));
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
}
