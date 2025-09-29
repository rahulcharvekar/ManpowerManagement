package com.example.paymentreconciliation.board.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "board_reconciliation_receipts")
public class BoardReconciliationReceipt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_receipt_number", nullable = false, unique = true, length = 40)
    private String boardReceiptNumber;

    @Column(name = "employer_receipt_number", nullable = false, length = 40)
    private String employerReceiptNumber;

    @Column(name = "worker_receipt_number", nullable = false, length = 40)
    private String workerReceiptNumber;

    @Column(name = "transaction_reference", nullable = false, length = 50)
    private String transactionReference;

    @Column(name = "mt940_reference", length = 100)
    private String mt940Reference; // Reference from MT940 statement

    @Column(name = "reconciled_by", nullable = false, length = 64)
    private String reconciledBy; // Board user who reconciled

    @Column(name = "reconciled_at", nullable = false)
    private LocalDateTime reconciledAt;

    @Column(name = "statement_date")
    private LocalDateTime statementDate; // Date from MT940 statement

    @Column(name = "total_records", nullable = false)
    private Integer totalRecords;

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "reconciled_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal reconciledAmount; // Amount found in MT940

    @Column(name = "status", nullable = false, length = 32)
    private String status; // RECONCILED, PROCESSED, etc.

    @Column(name = "remarks", length = 500)
    private String remarks;

    public BoardReconciliationReceipt() {
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public String getBoardReceiptNumber() {
        return boardReceiptNumber;
    }

    public void setBoardReceiptNumber(String boardReceiptNumber) {
        this.boardReceiptNumber = boardReceiptNumber;
    }

    public String getEmployerReceiptNumber() {
        return employerReceiptNumber;
    }

    public void setEmployerReceiptNumber(String employerReceiptNumber) {
        this.employerReceiptNumber = employerReceiptNumber;
    }

    public String getWorkerReceiptNumber() {
        return workerReceiptNumber;
    }

    public void setWorkerReceiptNumber(String workerReceiptNumber) {
        this.workerReceiptNumber = workerReceiptNumber;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getMt940Reference() {
        return mt940Reference;
    }

    public void setMt940Reference(String mt940Reference) {
        this.mt940Reference = mt940Reference;
    }

    public String getReconciledBy() {
        return reconciledBy;
    }

    public void setReconciledBy(String reconciledBy) {
        this.reconciledBy = reconciledBy;
    }

    public LocalDateTime getReconciledAt() {
        return reconciledAt;
    }

    public void setReconciledAt(LocalDateTime reconciledAt) {
        this.reconciledAt = reconciledAt;
    }

    public LocalDateTime getStatementDate() {
        return statementDate;
    }

    public void setStatementDate(LocalDateTime statementDate) {
        this.statementDate = statementDate;
    }

    public Integer getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Integer totalRecords) {
        this.totalRecords = totalRecords;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getReconciledAmount() {
        return reconciledAmount;
    }

    public void setReconciledAmount(BigDecimal reconciledAmount) {
        this.reconciledAmount = reconciledAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
