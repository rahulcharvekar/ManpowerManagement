package com.example.paymentreconciliation.worker.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.paymentreconciliation.utilities.file.FileStorageUtil;
import com.example.paymentreconciliation.utilities.file.FileParsingUtil;
import com.example.paymentreconciliation.worker.entity.WorkerPayment;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentStatus;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;
import com.example.paymentreconciliation.utilities.file.UploadedFileRepository;
import com.example.paymentreconciliation.utilities.file.UploadedFile;
import org.slf4j.Logger;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.io.File;
import java.math.BigDecimal;
import java.util.*;

@Service
public class WorkerPaymentFileService {
    private static final Logger log = LoggerFactoryProvider.getLogger(WorkerPaymentFileService.class);

    @Autowired
    private FileStorageUtil fileStorageUtil;
    
    @Autowired
    private FileParsingUtil fileParsingUtil;
    
    @Autowired
    private UploadedFileRepository uploadedFileRepository;
    
    @Autowired
    private WorkerPaymentService workerPaymentService;
    
    @Autowired
    private WorkerPaymentReceiptService receiptService;

    public Map<String, Object> handleFileUpload(MultipartFile file) {
        log.info("Received file upload: name={}, size={} bytes", file.getOriginalFilename(), file.getSize());
        
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // Use the new method that returns the entity directly to avoid lookup issues
            UploadedFile uploadedFile = fileStorageUtil.storeFileAndReturnEntity(file, "workerpayments", fileName);
            String storedPath = uploadedFile.getStoredPath();
            String fileId = uploadedFile.getId().toString();
            
            log.info("File saved to {} with fileId: {}", storedPath, fileId);
            
            // Parse the file and extract worker payments
            File fileToRead = new File(storedPath);
            List<WorkerPayment> payments = fileParsingUtil.parseFile(fileToRead, file.getOriginalFilename());
            
            // Update the uploaded file record with parsing results
            uploadedFile.setTotalRecords(payments.size());
            uploadedFile.setSuccessCount(0); // Will be updated after validation
            uploadedFile.setFailureCount(0);
            uploadedFile.setStatus("UPLOADED");
            uploadedFileRepository.save(uploadedFile);
            
            // Save worker payments to database using WorkerPaymentService
            String uploadedFileRequestRefNumber = uploadedFile.getRequestReferenceNumber();
            for (WorkerPayment payment : payments) {
                // Set the file ID for direct linkage
                payment.setFileId(fileId);
                // Use uploaded file's request reference number for all worker payments
                payment.setRequestReferenceNumber(uploadedFileRequestRefNumber);
            }
            
            List<WorkerPayment> savedPayments = workerPaymentService.createBulk(payments);
            
            log.info("File {} parsed and {} records saved via WorkerPaymentService (fileId={})", 
                file.getOriginalFilename(), savedPayments.size(), fileId);
            
            // Create response map step by step to identify any null values
            Map<String, Object> response = new HashMap<>();
            response.put("fileId", fileId);
            response.put("message", "File uploaded successfully. " + payments.size() + " records loaded. Proceed to validation.");
            response.put("path", storedPath);
            response.put("recordCount", payments.size());
            
            log.info("Returning response: {}", response);
            return response;
            
        } catch (Exception e) {
            log.error("Failed to process uploaded file", e);
            String errorMessage = e.getMessage();
            if (errorMessage == null || errorMessage.trim().isEmpty()) {
                errorMessage = e.getClass().getSimpleName() + " - " + e.toString();
            }
            return Map.of("error", "Failed to process uploaded file: " + errorMessage);
        }
    }

    public Map<String, Object> validateFileRecords(String fileId) {
        log.info("Validating records for fileId={}", fileId);
        
        try {
            Long uploadedFileId = Long.parseLong(fileId);
            Optional<UploadedFile> uploadedFileOpt = uploadedFileRepository.findById(uploadedFileId);
            
            if (uploadedFileOpt.isEmpty()) {
                return Map.of("error", "File not found");
            }
            
            // Get all worker payments for this file (using direct fileId lookup for better performance)
            List<WorkerPayment> payments = workerPaymentService.findByFileId(fileId);
            
            // Simple validation: check required fields and update individual statuses
            int passedCount = 0;
            int failedCount = 0;
            List<WorkerPayment> updatedPayments = new ArrayList<>();
            
            for (WorkerPayment payment : payments) {
                boolean isValid = validateWorkerPayment(payment);
                if (isValid) {
                    payment.setStatus(WorkerPaymentStatus.VALIDATED);
                    passedCount++;
                } else {
                    payment.setStatus(WorkerPaymentStatus.FAILED);
                    failedCount++;
                }
                updatedPayments.add(payment);
            }
            
            // Save updated payment statuses
            workerPaymentService.updateBulk(updatedPayments);
            
            // Update the uploaded file record with validation results
            UploadedFile uploadedFile = uploadedFileOpt.get();
            uploadedFile.setSuccessCount(passedCount);
            uploadedFile.setFailureCount(failedCount);
            uploadedFile.setStatus("VALIDATED");
            uploadedFileRepository.save(uploadedFile);
            
            log.info("Validation complete for fileId={}: {} passed, {} failed", fileId, passedCount, failedCount);
            return Map.of("passed", passedCount, "failed", failedCount);
            
        } catch (Exception e) {
            log.error("Error validating records for fileId={}", fileId, e);
            return Map.of("error", "Validation failed: " + e.getMessage());
        }
    }
    
    private boolean validateWorkerPayment(WorkerPayment payment) {
        // Basic validation rules
        if (payment.getWorkerRef() == null || payment.getWorkerRef().trim().isEmpty()) {
            return false;
        }
        if (payment.getName() == null || payment.getName().trim().isEmpty()) {
            return false;
        }
        if (payment.getPaymentAmount() == null || payment.getPaymentAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            return false;
        }
        // Add more validation rules as needed
        return true;
    }

    public Map<String, Object> getValidationResults(String fileId) {
        log.info("Fetching validation results for fileId={}", fileId);
        
        try {
            // Get all worker payments for this file
            List<WorkerPayment> payments = workerPaymentService.findByFileId(fileId);
            
            List<Map<String, Object>> passedRecords = new ArrayList<>();
            List<Map<String, Object>> failedRecords = new ArrayList<>();
            
            for (WorkerPayment payment : payments) {
                Map<String, Object> record = createPaymentSummary(payment);
                
                if (payment.getStatus() == WorkerPaymentStatus.VALIDATED) {
                    passedRecords.add(record);
                } else if (payment.getStatus() == WorkerPaymentStatus.FAILED) {
                    failedRecords.add(record);
                }
            }
            
            return Map.of(
                "passedRecords", passedRecords,
                "failedRecords", failedRecords
            );
            
        } catch (Exception e) {
            log.error("Error fetching validation results for fileId={}", fileId, e);
            return Map.of("error", "Failed to fetch results: " + e.getMessage());
        }
    }
    
    private Map<String, Object> createPaymentSummary(WorkerPayment payment) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", payment.getId());
        summary.put("fileId", payment.getFileId());
        summary.put("workerRef", payment.getWorkerRef());
        summary.put("regId", payment.getRegId());
        summary.put("name", payment.getName());
        summary.put("toli", payment.getToli());
        summary.put("aadhar", payment.getAadhar());
        summary.put("pan", payment.getPan());
        summary.put("paymentAmount", payment.getPaymentAmount());
        summary.put("bankAccount", payment.getBankAccount());
        summary.put("requestRefNumber", payment.getRequestReferenceNumber());
        summary.put("status", payment.getStatus().name());
        
        // Include receipt number if available
        if (payment.getReceiptNumber() != null) {
            summary.put("receiptNumber", payment.getReceiptNumber());
        }
        
        return summary;
    }

    public Map<String, Object> processValidRecords(String fileId) {
        log.info("Processing valid records for fileId={}", fileId);
        
        try {
            List<WorkerPayment> payments = workerPaymentService.findByFileId(fileId);
            
            int processedCount = 0;
            List<WorkerPayment> toUpdate = new ArrayList<>();
            
            for (WorkerPayment payment : payments) {
                // Only process records that passed validation
                if (payment.getStatus() == WorkerPaymentStatus.VALIDATED) {
                    payment.setStatus(WorkerPaymentStatus.PROCESSED);
                    toUpdate.add(payment);
                    processedCount++;
                }
            }
            
            // Update statuses in bulk
            String receiptNumber = null;
            if (!toUpdate.isEmpty()) {
                // First, create the receipt for all processed payments
                WorkerPaymentReceipt receipt = receiptService.createReceipt(toUpdate);
                receiptNumber = receipt.getReceiptNumber();
                
                // Assign the receipt number to all processed payments
                for (WorkerPayment payment : toUpdate) {
                    payment.setReceiptNumber(receiptNumber);
                }
                
                // Update payments with new status and receipt number assignment
                workerPaymentService.updateBulk(toUpdate);
                
                log.info("Generated receipt {} for {} processed payments", receipt.getReceiptNumber(), processedCount);
            }
            
            // Update file status
            Long uploadedFileId = Long.parseLong(fileId);
            Optional<UploadedFile> uploadedFileOpt = uploadedFileRepository.findById(uploadedFileId);
            if (uploadedFileOpt.isPresent()) {
                UploadedFile uploadedFile = uploadedFileOpt.get();
                uploadedFile.setStatus("PROCESSED");
                uploadedFileRepository.save(uploadedFile);
            }
            
            log.info("Processing complete for fileId={}: {} records processed", fileId, processedCount);
            
            Map<String, Object> result = new HashMap<>();
            result.put("processed", processedCount);
            if (receiptNumber != null) {
                result.put("receiptNumber", receiptNumber);
                result.put("message", "Processed " + processedCount + " valid records and generated receipt: " + receiptNumber);
            } else {
                result.put("message", "No valid records found to process.");
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("Error processing records for fileId={}", fileId, e);
            return Map.of("error", "Processing failed: " + e.getMessage());
        }
    }

    public Map<String, Object> reuploadFailedRecords(String fileId, MultipartFile file) {
        log.info("Re-uploading failed records for fileId={} with file {}", fileId, file.getOriginalFilename());
        
        try {
            // Process the new file similar to initial upload
            Map<String, Object> result = handleFileUpload(file);
            
            if (result.containsKey("error")) {
                return result;
            }
            
            String newFileId = (String) result.get("fileId");
            
            // You could implement logic here to merge or replace failed records
            // For now, we'll just return success
            log.info("Re-upload complete: new fileId={}", newFileId);
            return Map.of("message", "Re-uploaded successfully with new file ID: " + newFileId);
            
        } catch (Exception e) {
            log.error("Error re-uploading file for fileId={}", fileId, e);
            return Map.of("error", "Re-upload failed: " + e.getMessage());
        }
    }

    public Map<String, Object> getFileStatusSummary(String fileId) {
        log.info("Getting status summary for fileId={}", fileId);
        
        try {
            List<WorkerPayment> payments = workerPaymentService.findByFileId(fileId);
            
            Map<WorkerPaymentStatus, Integer> statusCounts = new HashMap<>();
            
            // Initialize counts
            for (WorkerPaymentStatus status : WorkerPaymentStatus.values()) {
                statusCounts.put(status, 0);
            }
            
            // Count by status
            for (WorkerPayment payment : payments) {
                WorkerPaymentStatus status = payment.getStatus();
                statusCounts.put(status, statusCounts.get(status) + 1);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("fileId", fileId);
            result.put("totalRecords", payments.size());
            result.put("uploadedCount", statusCounts.get(WorkerPaymentStatus.UPLOADED));
            result.put("validatedCount", statusCounts.get(WorkerPaymentStatus.VALIDATED));
            result.put("failedCount", statusCounts.get(WorkerPaymentStatus.FAILED));
            result.put("processedCount", statusCounts.get(WorkerPaymentStatus.PROCESSED));
            result.put("errorCount", statusCounts.get(WorkerPaymentStatus.ERROR));
            
            return result;
            
        } catch (Exception e) {
            log.error("Error getting status summary for fileId={}", fileId, e);
            return Map.of("error", "Failed to get status summary: " + e.getMessage());
        }
    }

    public Map<String, Object> getReceiptDetails(String fileId) {
        log.info("Getting receipt details for fileId={}", fileId);
        
        try {
            List<WorkerPayment> processedPayments = workerPaymentService.findByFileIdAndStatus(
                fileId, WorkerPaymentStatus.PROCESSED);
            
            if (processedPayments.isEmpty()) {
                return Map.of("message", "No processed payments found for fileId: " + fileId);
            }
            
            // Get receipt number from the first processed payment (all should have the same receipt number)
            String receiptNumber = processedPayments.get(0).getReceiptNumber();
            
            if (receiptNumber == null) {
                return Map.of("message", "No receipt number found for processed payments in fileId: " + fileId);
            }
            
            // Find the receipt by receipt number
            // Note: We would need a method in receiptService to find by receipt number
            // For now, let's create a simplified response
            Map<String, Object> result = new HashMap<>();
            result.put("fileId", fileId);
            result.put("receiptNumber", receiptNumber);
            
            // Calculate totals from processed payments
            int totalRecords = processedPayments.size();
            BigDecimal totalAmount = processedPayments.stream()
                    .map(WorkerPayment::getPaymentAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            result.put("totalRecords", totalRecords);
            result.put("totalAmount", totalAmount);
            result.put("status", "PROCESSED");
            
            // Include payment details
            List<Map<String, Object>> paymentDetails = new ArrayList<>();
            for (WorkerPayment payment : processedPayments) {
                paymentDetails.add(createPaymentSummary(payment));
            }
            result.put("payments", paymentDetails);
            
            return result;
            
        } catch (Exception e) {
            log.error("Error getting receipt details for fileId={}", fileId, e);
            return Map.of("error", "Failed to get receipt details: " + e.getMessage());
        }
    }

    public Map<String, Object> getValidationDetailsPaginated(String fileId, int page, int size, String statusFilter) {
        log.info("Getting paginated validation details for fileId={}, page={}, size={}, status={}", fileId, page, size, statusFilter);
        
        try {
            // First, let's check if there are any records for this fileId at all
            List<WorkerPayment> allPaymentsForFile = workerPaymentService.findByFileId(fileId);
            log.info("Found {} total payments for fileId={}", allPaymentsForFile.size(), fileId);
            
            if (allPaymentsForFile.isEmpty()) {
                log.warn("No payments found for fileId={}. This could mean the file hasn't been uploaded or processed yet.", fileId);
                return Map.of(
                    "content", new ArrayList<>(),
                    "totalElements", 0,
                    "totalPages", 0,
                    "currentPage", page,
                    "pageSize", size,
                    "hasNext", false,
                    "hasPrevious", false,
                    "fileId", fileId,
                    "message", "No worker payments found for this file ID. Please ensure the file has been uploaded and processed."
                );
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<WorkerPayment> paymentsPage;
            
            if (statusFilter != null && !statusFilter.trim().isEmpty()) {
                try {
                    WorkerPaymentStatus status = WorkerPaymentStatus.valueOf(statusFilter.toUpperCase());
                    paymentsPage = workerPaymentService.findByFileIdAndStatusPaginated(fileId, status, pageable);
                } catch (IllegalArgumentException e) {
                    return Map.of("error", "Invalid status filter: " + statusFilter);
                }
            } else {
                paymentsPage = workerPaymentService.findByFileIdPaginated(fileId, pageable);
            }
            
            log.info("Paginated query returned {} elements (page {} of {})", 
                paymentsPage.getNumberOfElements(), paymentsPage.getNumber() + 1, paymentsPage.getTotalPages());
            
            List<Map<String, Object>> paymentDetails = new ArrayList<>();
            for (WorkerPayment payment : paymentsPage.getContent()) {
                Map<String, Object> detail = createPaymentSummary(payment);
                // Add additional validation details
                detail.put("validationStatus", getValidationStatusDetail(payment));
                paymentDetails.add(detail);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("content", paymentDetails);
            result.put("totalElements", paymentsPage.getTotalElements());
            result.put("totalPages", paymentsPage.getTotalPages());
            result.put("currentPage", paymentsPage.getNumber());
            result.put("pageSize", paymentsPage.getSize());
            result.put("hasNext", paymentsPage.hasNext());
            result.put("hasPrevious", paymentsPage.hasPrevious());
            result.put("fileId", fileId);
            
            return result;
            
        } catch (Exception e) {
            log.error("Error getting paginated validation details for fileId={}", fileId, e);
            return Map.of("error", "Failed to get validation details: " + e.getMessage());
        }
    }
    
    private String getValidationStatusDetail(WorkerPayment payment) {
        switch (payment.getStatus()) {
            case UPLOADED:
                return "Pending validation";
            case VALIDATED:
                return "Validation passed";
            case FAILED:
                return "Validation failed - check required fields";
            case PROCESSED:
                return "Successfully processed";
            case ERROR:
                return "Error during processing";
            default:
                return "Unknown status";
        }
    }
    
    // Debug method to get worker payments by fileId
    public List<WorkerPayment> getWorkerPaymentsByFileId(String fileId) {
        return workerPaymentService.findByFileId(fileId);
    }
}
