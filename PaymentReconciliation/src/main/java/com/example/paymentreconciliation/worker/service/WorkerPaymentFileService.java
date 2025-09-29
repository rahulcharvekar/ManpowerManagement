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
            String storedPath = fileStorageUtil.storeFile(file, "workerpayments", fileName);
            log.info("File saved to {}", storedPath);
            
            // Get the uploaded file record from database
            Optional<UploadedFile> uploadedFileOpt = uploadedFileRepository.findByStoredPath(storedPath);
            if (uploadedFileOpt.isEmpty()) {
                throw new RuntimeException("Uploaded file record not found in database");
            }
            
            UploadedFile uploadedFile = uploadedFileOpt.get();
            String fileId = uploadedFile.getId().toString();
            
            // Parse the file and extract worker payments
            File fileToRead = new File(storedPath);
            List<WorkerPayment> payments = fileParsingUtil.parseFile(fileToRead, file.getOriginalFilename());
            
            // Update the uploaded file record with parsing results
            uploadedFile.setTotalRecords(payments.size());
            uploadedFile.setSuccessCount(0); // Will be updated after validation
            uploadedFile.setFailureCount(0);
            uploadedFile.setStatus("PARSED");
            uploadedFileRepository.save(uploadedFile);
            
            // Save worker payments to database using WorkerPaymentService
            for (WorkerPayment payment : payments) {
                // Generate request reference number for each payment
                payment.setRequestReferenceNumber("REQ_" + fileId + "_" + UUID.randomUUID().toString().substring(0, 8));
            }
            
            List<WorkerPayment> savedPayments = workerPaymentService.createBulk(payments);
            
            log.info("File {} parsed and {} records saved via WorkerPaymentService (fileId={})", 
                file.getOriginalFilename(), savedPayments.size(), fileId);
            return Map.of(
                "fileId", fileId, 
                "message", "File uploaded and parsed. " + payments.size() + " records loaded. Proceed to validation.", 
                "path", storedPath,
                "recordCount", payments.size()
            );
            
        } catch (Exception e) {
            log.error("Failed to process uploaded file", e);
            return Map.of("error", "Failed to process uploaded file: " + e.getMessage());
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
            
            // Get all worker payments for this file (using request reference number pattern)
            List<WorkerPayment> payments = workerPaymentService.findByRequestReferencePrefix("REQ_" + fileId);
            
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
            List<WorkerPayment> payments = workerPaymentService.findByRequestReferencePrefix("REQ_" + fileId);
            
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
        summary.put("workerRef", payment.getWorkerRef());
        summary.put("name", payment.getName());
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
            List<WorkerPayment> payments = workerPaymentService.findByRequestReferencePrefix("REQ_" + fileId);
            
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
            List<WorkerPayment> payments = workerPaymentService.findByRequestReferencePrefix("REQ_" + fileId);
            
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
            List<WorkerPayment> processedPayments = workerPaymentService.findByReferencePrefixAndStatus(
                "REQ_" + fileId, WorkerPaymentStatus.PROCESSED);
            
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
}
