package com.example.paymentreconciliation.reconciliation.controller;

import com.example.paymentreconciliation.reconciliation.service.PaymentProcessingService;
import com.example.paymentreconciliation.reconciliation.service.PaymentProcessingService.PaymentProcessingResult;
import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * REST Controller for payment processing after successful reconciliation
 */
@RestController
@RequestMapping("/api/payment-processing")
@CrossOrigin
@Tag(name = "Payment Processing", description = "APIs for processing payments after successful reconciliation")
@SecurityRequirement(name = "Bearer Authentication")
public class PaymentProcessingController {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(PaymentProcessingController.class);
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    /**
     * Process payment after successful reconciliation
     * Updates all entity statuses: employer receipt -> ACCEPTED, worker payment -> PROCESSED, board receipt -> PROCESSED
     */
    @PostMapping("/process/{transactionReference}")
    @Operation(summary = "Process reconciled payment",
               description = "Updates all entity statuses after successful reconciliation and returns processing details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment processed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid transaction reference"),
        @ApiResponse(responseCode = "404", description = "Transaction not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> processReconciledPayment(
            @Parameter(description = "Transaction reference number from reconciliation", required = true)
            @PathVariable String transactionReference,
            @Parameter(description = "User who is processing the payment", required = true)
            @RequestParam String processedBy) {
        
        try {
            log.info("API call - Process reconciled payment for transaction: {} by user: {}", transactionReference, processedBy);
            
            PaymentProcessingResult result = paymentProcessingService.processReconciledPayment(transactionReference, processedBy);
            
            log.info("Payment processing completed: {}", result.getStatus());
            return ResponseEntity.ok(result);
            
        } catch (RuntimeException e) {
            log.error("Payment processing failed for transaction: {}", transactionReference, e);
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Payment processing failed",
                "message", e.getMessage(),
                "transactionReference", transactionReference,
                "timestamp", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during payment processing for transaction: {}", transactionReference, e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Internal server error",
                "message", "An unexpected error occurred during payment processing",
                "transactionReference", transactionReference,
                "timestamp", LocalDateTime.now().toString()
            ));
        }
    }
    
    /**
     * Generate and download payment report PDF
     */
    @PostMapping("/report/{transactionReference}")
    @Operation(summary = "Generate payment processing report",
               description = "Generates and downloads PDF report for processed payment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Report generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid transaction reference"),
        @ApiResponse(responseCode = "500", description = "Report generation failed")
    })
    public ResponseEntity<?> generatePaymentReport(
            @Parameter(description = "Transaction reference number", required = true)
            @PathVariable String transactionReference,
            @Parameter(description = "User who is generating the report", required = true)
            @RequestParam String processedBy) {
        
        try {
            log.info("API call - Generate payment report for transaction: {} by user: {}", transactionReference, processedBy);
            
            // First process the payment to get the results
            PaymentProcessingResult result = paymentProcessingService.processReconciledPayment(transactionReference, processedBy);
            
            // Generate PDF report
            byte[] pdfBytes = paymentProcessingService.generatePaymentReportPDF(result);
            
            // Generate filename in the format "New Doc 09-29-2025 13.14.pdf"
            String filename = "New Doc " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM-dd-yyyy HH.mm")) + ".pdf";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            
            log.info("Payment report generated successfully: {} bytes, filename: {}", pdfBytes.length, filename);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new ByteArrayResource(pdfBytes));
                    
        } catch (RuntimeException e) {
            log.error("Payment report generation failed for transaction: {}", transactionReference, e);
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Report generation failed",
                "message", e.getMessage(),
                "transactionReference", transactionReference,
                "timestamp", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during report generation for transaction: {}", transactionReference, e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Internal server error",
                "message", "An unexpected error occurred during report generation",
                "transactionReference", transactionReference,
                "timestamp", LocalDateTime.now().toString()
            ));
        }
    }
    
    /**
     * Process payment and generate report in a single call
     */
    @PostMapping("/process-and-report/{transactionReference}")
    @Operation(summary = "Process payment and generate report",
               description = "Processes reconciled payment and generates PDF report in a single operation")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Payment processed and report generated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid transaction reference"),
        @ApiResponse(responseCode = "500", description = "Processing or report generation failed")
    })
    public ResponseEntity<?> processPaymentAndGenerateReport(
            @Parameter(description = "Transaction reference number", required = true)
            @PathVariable String transactionReference,
            @Parameter(description = "User who is processing the payment and generating report", required = true)
            @RequestParam String processedBy) {
        
        try {
            log.info("API call - Process payment and generate report for transaction: {} by user: {}", transactionReference, processedBy);
            
            // Process the payment
            PaymentProcessingResult result = paymentProcessingService.processReconciledPayment(transactionReference, processedBy);
            
            if (!"SUCCESS".equals(result.getStatus())) {
                log.warn("Payment processing failed, cannot generate report: {}", result.getMessage());
                return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "Payment processing failed",
                    "message", result.getMessage(),
                    "processingResult", result,
                    "timestamp", LocalDateTime.now().toString()
                ));
            }
            
            // Generate PDF report
            byte[] pdfBytes = paymentProcessingService.generatePaymentReportPDF(result);
            
            // Generate filename in the format "New Doc 09-29-2025 13.14.pdf"
            String filename = "New Doc " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("MM-dd-yyyy HH.mm")) + ".pdf";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfBytes.length);
            
            // Add processing result details to headers for reference
            headers.add("X-Processing-Status", result.getStatus());
            headers.add("X-Total-Records", String.valueOf(result.getTotalRecords()));
            headers.add("X-Total-Amount", result.getTotalAmount().toString());
            
            log.info("Payment processed and report generated successfully: {} records, {} total amount, {} bytes PDF", 
                     result.getTotalRecords(), result.getTotalAmount(), pdfBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(new ByteArrayResource(pdfBytes));
                    
        } catch (RuntimeException e) {
            log.error("Payment processing and report generation failed for transaction: {}", transactionReference, e);
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Processing failed",
                "message", e.getMessage(),
                "transactionReference", transactionReference,
                "timestamp", LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            log.error("Unexpected error during payment processing and report generation for transaction: {}", transactionReference, e);
            return ResponseEntity.internalServerError().body(java.util.Map.of(
                "error", "Internal server error",
                "message", "An unexpected error occurred during processing",
                "transactionReference", transactionReference,
                "timestamp", LocalDateTime.now().toString()
            ));
        }
    }
}
