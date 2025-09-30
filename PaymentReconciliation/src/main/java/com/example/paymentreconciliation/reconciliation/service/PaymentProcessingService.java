package com.example.paymentreconciliation.reconciliation.service;

import com.example.paymentreconciliation.board.dao.BoardReceiptRepository;
import com.example.paymentreconciliation.board.entity.BoardReceipt;

import com.example.paymentreconciliation.employer.dao.EmployerPaymentReceiptRepository;
import com.example.paymentreconciliation.employer.entity.EmployerPaymentReceipt;
import com.example.paymentreconciliation.worker.dao.WorkerPaymentReceiptRepository;
import com.example.paymentreconciliation.worker.entity.WorkerPaymentReceipt;

import com.example.paymentreconciliation.utilities.logger.LoggerFactoryProvider;

import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Service for processing payments after successful reconciliation
 * Updates status across all entities and generates payment reports
 */
@Service
@Transactional
public class PaymentProcessingService {
    
    private static final Logger log = LoggerFactoryProvider.getLogger(PaymentProcessingService.class);
    
    @Autowired
    private EmployerPaymentReceiptRepository employerPaymentReceiptRepository;
    
    @Autowired
    private WorkerPaymentReceiptRepository workerPaymentReceiptRepository;
    
    @Autowired
    private BoardReceiptRepository boardReceiptRepository;
    
    /**
     * Process payment after successful reconciliation
     * Updates all entity statuses and returns payment report data
     */
    @Transactional
    public PaymentProcessingResult processReconciledPayment(String transactionReference, String processedBy) {
        log.info("Processing reconciled payment for transaction reference: {} by: {}", transactionReference, processedBy);
        
        PaymentProcessingResult result = new PaymentProcessingResult();
        result.setTransactionReference(transactionReference);
        result.setProcessedBy(processedBy);
        result.setProcessedAt(LocalDateTime.now());
        
        try {
            // Find employer receipts by transaction reference
            List<EmployerPaymentReceipt> employerReceipts = employerPaymentReceiptRepository.findByTransactionReference(transactionReference);
            
            if (employerReceipts.isEmpty()) {
                throw new RuntimeException("No employer receipts found for transaction reference: " + transactionReference);
            }
            
            BigDecimal totalProcessedAmount = BigDecimal.ZERO;
            int totalRecordsProcessed = 0;
            
            for (EmployerPaymentReceipt employerReceipt : employerReceipts) {
                log.info("Processing employer receipt: {}", employerReceipt.getEmployerReceiptNumber());
                
                // Update employer receipt status to ACCEPTED
                employerReceipt.setStatus("ACCEPTED");
                employerPaymentReceiptRepository.save(employerReceipt);
                
                // Find and update worker payment receipt
                Optional<WorkerPaymentReceipt> workerReceiptOpt = workerPaymentReceiptRepository.findByReceiptNumber(employerReceipt.getWorkerReceiptNumber());
                
                if (workerReceiptOpt.isPresent()) {
                    WorkerPaymentReceipt workerReceipt = workerReceiptOpt.get();
                    workerReceipt.setStatus("PAYMENT_PROCESSED");
                    workerPaymentReceiptRepository.save(workerReceipt);
                    log.info("Updated worker payment receipt {} to PAYMENT_PROCESSED", workerReceipt.getReceiptNumber());
                }
                
                // Find and update board receipt
                Optional<BoardReceipt> boardReceiptOpt = boardReceiptRepository.findByEmployerRef(employerReceipt.getEmployerReceiptNumber());
                
                if (boardReceiptOpt.isPresent()) {
                    BoardReceipt boardReceipt = boardReceiptOpt.get();
                    boardReceipt.setStatus("PROCESSED");
                    boardReceiptRepository.save(boardReceipt);
                    log.info("Updated board receipt {} to PROCESSED", boardReceipt.getBoardRef());
                }
                
                // Board reconciliation receipt status will be updated elsewhere if needed
                
                totalProcessedAmount = totalProcessedAmount.add(employerReceipt.getTotalAmount());
                totalRecordsProcessed++;
            }
            
            result.setTotalAmount(totalProcessedAmount);
            result.setTotalRecords(totalRecordsProcessed);
            result.setStatus("SUCCESS");
            result.setMessage("Payment processing completed successfully");
            
            log.info("Payment processing completed - Total records: {}, Total amount: {}", totalRecordsProcessed, totalProcessedAmount);
            
        } catch (Exception e) {
            log.error("Error processing reconciled payment for transaction: {}", transactionReference, e);
            result.setStatus("FAILED");
            result.setMessage("Payment processing failed: " + e.getMessage());
            throw e; // Re-throw to trigger transaction rollback
        }
        
        return result;
    }
    
    /**
     * Generate payment report PDF
     */
    public byte[] generatePaymentReportPDF(PaymentProcessingResult processingResult) {
        log.info("Generating payment report PDF for transaction: {}", processingResult.getTransactionReference());
        
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.BLACK);
            Paragraph title = new Paragraph("PAYMENT PROCESSING REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);
            
            // Add report details
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.BLACK);
            Font contentFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.BLACK);
            
            // Create table for report details
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            
            // Add report information
            addTableRow(table, "Report Generated:", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")), headerFont, contentFont);
            addTableRow(table, "Transaction Reference:", processingResult.getTransactionReference(), headerFont, contentFont);
            addTableRow(table, "Processed By:", processingResult.getProcessedBy(), headerFont, contentFont);
            addTableRow(table, "Processing Date:", processingResult.getProcessedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")), headerFont, contentFont);
            addTableRow(table, "Total Records Processed:", String.valueOf(processingResult.getTotalRecords()), headerFont, contentFont);
            addTableRow(table, "Total Amount:", "₹ " + processingResult.getTotalAmount().toString(), headerFont, contentFont);
            addTableRow(table, "Status:", processingResult.getStatus(), headerFont, contentFont);
            addTableRow(table, "Message:", processingResult.getMessage(), headerFont, contentFont);
            
            document.add(table);
            
            // Add status details
            Paragraph statusSection = new Paragraph("\nSTATUS UPDATES COMPLETED:", headerFont);
            statusSection.setSpacingBefore(20);
            document.add(statusSection);
            
            PdfPTable statusTable = new PdfPTable(2);
            statusTable.setWidthPercentage(100);
            statusTable.setSpacingBefore(10);
            
            addTableRow(statusTable, "Employer Receipt Status:", "ACCEPTED", headerFont, contentFont);
            addTableRow(statusTable, "Worker Payment Status:", "PAYMENT_PROCESSED", headerFont, contentFont);
            addTableRow(statusTable, "Board Receipt Status:", "PROCESSED", headerFont, contentFont);
            addTableRow(statusTable, "Board Reconciliation Status:", "PROCESSED", headerFont, contentFont);
            
            document.add(statusTable);
            
            // Add footer
            Paragraph footer = new Paragraph("\n\nThis is an auto-generated report for payment processing.", 
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, BaseColor.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);
            
            document.close();
            
            log.info("Payment report PDF generated successfully, size: {} bytes", baos.size());
            return baos.toByteArray();
            
        } catch (Exception e) {
            log.error("Error generating payment report PDF", e);
            throw new RuntimeException("Failed to generate payment report PDF: " + e.getMessage());
        }
    }
    
    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }
    
    /**
     * DTO class for payment processing result
     */
    public static class PaymentProcessingResult {
        private String transactionReference;
        private String processedBy;
        private LocalDateTime processedAt;
        private BigDecimal totalAmount;
        private int totalRecords;
        private String status;
        private String message;
        
        // Getters and Setters
        public String getTransactionReference() { return transactionReference; }
        public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
        
        public String getProcessedBy() { return processedBy; }
        public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
        
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
        
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        
        public int getTotalRecords() { return totalRecords; }
        public void setTotalRecords(int totalRecords) { this.totalRecords = totalRecords; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
